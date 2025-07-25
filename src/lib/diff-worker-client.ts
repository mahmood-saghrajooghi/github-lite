interface DiffProcessingMessage {
  id: string
  type: 'PROCESS_DIFF'
  payload: {
    diffContent: string
    language?: string
  }
}

interface DiffProcessingResponse {
  id: string
  type: 'DIFF_PROCESSED'
  payload: {
    files: any[]
    tokens: Record<string, any>
  }
}

interface DiffProcessingError {
  id: string
  type: 'DIFF_PROCESSING_ERROR'
  payload: {
    error: string
  }
}

type DiffWorkerResponse = DiffProcessingResponse | DiffProcessingError

class DiffWorkerClient {
  private worker: ServiceWorker | null = null
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void
    reject: (error: Error) => void
  }>()

  constructor() {
    this.initializeWorker()
  }

  private async initializeWorker() {
    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready
      this.worker = registration.active

      if (this.worker) {
        // Listen for messages from the service worker
        navigator.serviceWorker.addEventListener('message', this.handleWorkerMessage.bind(this))
      }
    } catch (error) {
      console.error('Failed to initialize diff worker:', error)
    }
  }

  private handleWorkerMessage = (event: MessageEvent<DiffWorkerResponse>) => {
    const response = event.data
    const pendingRequest = this.pendingRequests.get(response.id)
    
    if (!pendingRequest) return
    
    this.pendingRequests.delete(response.id)
    
    if (response.type === 'DIFF_PROCESSED') {
      pendingRequest.resolve(response.payload)
    } else if (response.type === 'DIFF_PROCESSING_ERROR') {
      pendingRequest.reject(new Error(response.payload.error))
    }
  }

  async processDiff(diffContent: string, language = 'tsx'): Promise<{
    files: any[]
    tokens: Record<string, any>
  }> {
    if (!this.worker) {
      // Fallback to main thread processing if worker is not available
      throw new Error('Service worker not available')
    }

    const id = crypto.randomUUID()
    
    const message: DiffProcessingMessage = {
      id,
      type: 'PROCESS_DIFF',
      payload: {
        diffContent,
        language
      }
    }

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, { resolve, reject })
      
      // Send message to service worker
      this.worker!.postMessage(message)
      
      // Set a timeout to avoid hanging requests
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id)
          reject(new Error('Diff processing timeout'))
        }
      }, 30000) // 30 second timeout
    })
  }
}

// Create a singleton instance
export const diffWorkerClient = new DiffWorkerClient()