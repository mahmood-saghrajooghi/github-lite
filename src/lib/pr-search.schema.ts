import { z } from 'zod';

export const prSearchSchema = z.object({
  author: z.string().optional(),
  state: z.string().default('open'),
  sort: z.string().default('created-desc'),
})
