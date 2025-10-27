import type {
  DifftasticAPIRequest,
  DifftasticAPIResponse,
  DifftasticStatusResponse,
} from '../types/difftastic'

/**
 * API client for difftastic backend
 */

const API_BASE_URL =
  typeof import.meta !== 'undefined' && import.meta.env?.VITE_DIFFTASTIC_API_URL
    ? import.meta.env.VITE_DIFFTASTIC_API_URL
    : 'http://localhost:3001'

/**
 * Check if difftastic is installed and available
 */
export async function checkDifftasticStatus(): Promise<DifftasticStatusResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/difftastic/status`)
    return await response.json()
  } catch (error) {
    return {
      success: false,
      installed: false,
      error: error instanceof Error ? error.message : 'Failed to connect to difftastic API',
    }
  }
}

/**
 * Process a diff using difftastic
 */
export async function processDiff(
  request: DifftasticAPIRequest
): Promise<DifftasticAPIResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/difftastic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return {
        success: false,
        error: errorData.error || `HTTP error ${response.status}`,
      }
    }

    return await response.json()
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process diff',
    }
  }
}

/**
 * Process a diff for a GitHub file comparison
 * Convenience wrapper that handles common GitHub use cases
 */
export async function processGitHubFileDiff(params: {
  owner: string
  repo: string
  oldSha: string
  newSha: string
  filePath: string
  oldContent: string
  newContent: string
}): Promise<DifftasticAPIResponse> {
  return processDiff({
    oldContent: params.oldContent,
    newContent: params.newContent,
    oldPath: params.filePath,
    newPath: params.filePath,
  })
}
