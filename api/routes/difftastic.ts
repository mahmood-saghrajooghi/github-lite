import { Router } from 'express'
import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'

const execAsync = promisify(exec)
const router = Router()

interface DiffRequest {
  oldContent: string
  newContent: string
  oldPath: string
  newPath: string
  language?: string
}

interface DiffResponse {
  success: boolean
  diff?: unknown
  error?: string
  raw?: string
}

/**
 * POST /api/difftastic
 *
 * Process a diff using difftastic
 */
router.post('/', async (req, res) => {
  try {
    const { oldContent, newContent, oldPath, newPath } = req.body as DiffRequest

    // Validate input
    if (!oldContent || !newContent) {
      return res.status(400).json({
        success: false,
        error: 'Both oldContent and newContent are required'
      })
    }

    if (!oldPath || !newPath) {
      return res.status(400).json({
        success: false,
        error: 'Both oldPath and newPath are required'
      })
    }

    // Create temporary directory for this diff operation
    const sessionId = randomBytes(16).toString('hex')
    const tempDir = join(tmpdir(), 'difftastic', sessionId)
    await mkdir(tempDir, { recursive: true })

    // Write files to temp location
    const oldFilePath = join(tempDir, 'old' + getFileExtension(oldPath))
    const newFilePath = join(tempDir, 'new' + getFileExtension(newPath))

    await writeFile(oldFilePath, oldContent, 'utf-8')
    await writeFile(newFilePath, newContent, 'utf-8')

    try {
      // Build difftastic command
      // Use --display json for structured output
      // Note: Difftastic auto-detects language from file extension
      const command = `difft --display json "${oldFilePath}" "${newFilePath}"`

      // Set parse error limit to be more tolerant
      // Enable JSON output with DFT_UNSTABLE flag
      const env = {
        ...process.env,
        DFT_PARSE_ERROR_LIMIT: '20',
        DFT_UNSTABLE: 'yes'
      }

      console.log('Running difftastic:', command)

      // Execute difftastic
      const { stdout, stderr } = await execAsync(command, {
        env,
        maxBuffer: 10 * 1024 * 1024 // 10MB buffer for large diffs
      })

      if (stderr) {
        console.warn('Difftastic stderr:', stderr)
      }

      // Parse JSON output
      let diffData
      try {
        diffData = JSON.parse(stdout)
      } catch (parseError) {
        // If JSON parsing fails, return the raw output
        console.error('Failed to parse difftastic JSON output:', parseError)
        return res.json({
          success: true,
          raw: stdout,
          error: 'Failed to parse JSON output, returning raw format'
        } as DiffResponse)
      }

      // Return successful response
      res.json({
        success: true,
        diff: diffData
      } as DiffResponse)

    } finally {
      // Cleanup temp files
      try {
        await unlink(oldFilePath)
        await unlink(newFilePath)
      } catch (cleanupError) {
        console.warn('Failed to cleanup temp files:', cleanupError)
      }
    }

  } catch (error) {
    console.error('Difftastic API error:', error)

    // Check if difftastic is installed
    if (error instanceof Error && error.message.includes('difft')) {
      return res.status(500).json({
        success: false,
        error: 'Difftastic binary not found. Please install difftastic: cargo install difftastic'
      } as DiffResponse)
    }

    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    } as DiffResponse)
  }
})

/**
 * GET /api/difftastic/status
 *
 * Check if difftastic is installed and working
 */
router.get('/status', async (req, res) => {
  try {
    const { stdout } = await execAsync('difft --version')
    res.json({
      success: true,
      installed: true,
      version: stdout.trim()
    })
  } catch {
    res.json({
      success: false,
      installed: false,
      error: 'Difftastic not found. Install with: cargo install difftastic'
    })
  }
})

/**
 * Helper function to extract file extension from path
 */
function getFileExtension(filePath: string): string {
  const match = filePath.match(/\.[^.]+$/)
  return match ? match[0] : '.txt'
}

export { router as difftasticRouter }
