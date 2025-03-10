import { differenceInSeconds, differenceInMinutes, differenceInHours, differenceInDays, differenceInMonths, differenceInYears } from 'date-fns'

// Function to format time in a compact way (e.g., 3d, 2h, 5m)
export function formatCompactTimeAgo(date: Date): string {
  const now = new Date()

  const years = differenceInYears(now, date)
  if (years > 0) return `${years}y`

  const months = differenceInMonths(now, date)
  if (months > 0) return `${months}mo`

  const days = differenceInDays(now, date)
  if (days > 0) return `${days}d`

  const hours = differenceInHours(now, date)
  if (hours > 0) return `${hours}h`

  const minutes = differenceInMinutes(now, date)
  if (minutes > 0) return `${minutes}m`

  const seconds = differenceInSeconds(now, date)
  return `${seconds}s`
}
