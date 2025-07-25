import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { parseDiff, tokenize } from 'react-diff-view'
import refractor from 'refractor'

declare let self: ServiceWorkerGlobalScope

// Precache and route for PWA functionality
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

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
    files: ReturnType<typeof parseDiff>
    tokens: any
  }
}

// Handle messages from the main thread
self.addEventListener('message', async (event) => {
  const message = event.data as DiffProcessingMessage
  
  if (message.type === 'PROCESS_DIFF') {
    try {
      // Parse the diff content
      const files = parseDiff(message.payload.diffContent)
      
      // Process tokens for each file
      const tokens = new Map()
      
      for (const file of files) {
        const fileTokens = tokenize(file.hunks, { 
          highlight: true, 
          language: message.payload.language || 'tsx', 
          refractor 
        })
        tokens.set(file.newPath, fileTokens)
      }
      
      // Convert Map to object for serialization
      const tokensObject = Object.fromEntries(tokens)
      
      const response: DiffProcessingResponse = {
        id: message.id,
        type: 'DIFF_PROCESSED',
        payload: {
          files,
          tokens: tokensObject
        }
      }
      
      // Send the processed data back to the main thread
      self.postMessage(response)
    } catch (error) {
      // Send error back to main thread
      self.postMessage({
        id: message.id,
        type: 'DIFF_PROCESSING_ERROR',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      })
    }
  }
})

// Optional: Handle fetch events for additional caching if needed
self.addEventListener('fetch', (event) => {
  // Let the browser handle all requests by default
  // You can add custom caching logic here if needed
})