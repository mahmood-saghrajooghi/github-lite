import { ThemeProvider } from '@/components/theme-provider';
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className='rounded-xl mb-2 mr-2 min-h-[unset] grid grid-rows-[auto_1fr] grid-cols-[1fr]'>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ThemeProvider>
  )
}
