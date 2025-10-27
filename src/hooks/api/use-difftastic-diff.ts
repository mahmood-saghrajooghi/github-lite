import { useQuery } from '@tanstack/react-query'
import { processDiff } from '../../lib/difftastic-client'
import { transformDifftasticOutput } from '../../lib/difftastic-transformer'
import type { DifftasticAPIRequest, DifftasticNormalizedDiff } from '../../types/difftastic'

export interface UseDifftasticDiffOptions {
  oldContent: string
  newContent: string
  oldPath: string
  newPath: string
  enabled?: boolean
}

/**
 * Hook to fetch and transform difftastic diff
 */
export function useDifftasticDiff(options: UseDifftasticDiffOptions) {
  const { oldContent, newContent, oldPath, newPath, enabled = true } = options

  return useQuery({
    queryKey: ['difftastic', oldPath, newPath, oldContent, newContent],
    queryFn: async (): Promise<DifftasticNormalizedDiff | null> => {
      const request: DifftasticAPIRequest = {
        oldContent,
        newContent,
        oldPath,
        newPath,
      }

      const response = await processDiff(request)

      if (!response.success || !response.diff) {
        throw new Error(response.error || 'Failed to process diff')
      }

      // Transform the raw output to normalized format
      const normalized = transformDifftasticOutput(response.diff, oldPath, newPath)

      return normalized
    },
    enabled: enabled && !!oldContent && !!newContent,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 2,
  })
}

/**
 * Hook to check difftastic status
 */
export function useDifftasticStatus() {
  return useQuery({
    queryKey: ['difftastic-status'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3001/api/difftastic/status')
      return await response.json()
    },
    staleTime: Infinity, // Status rarely changes
    gcTime: Infinity,
    retry: false,
  })
}
