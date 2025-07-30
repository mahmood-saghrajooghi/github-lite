import { ThemeProvider } from '@/components/theme-provider';
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { useNavigate } from '@tanstack/react-router'
import { useRegisterHotkey } from '@/contexts/hotkey-context'
import { useCallback } from 'react'

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const goToMyPullRequests = useCallback(() => {
    navigate({ to: '/my-prs' })
  }, [navigate])

  useRegisterHotkey('g p', goToMyPullRequests, { 'g': 'Go to', 'g p': 'Go to my pull requests' })

  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className='rounded-xl mb-2 mr-2 min-h-[unset] grid grid-rows-[auto_1fr] grid-cols-[1fr] relative overflow-y-auto pb-8'>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
