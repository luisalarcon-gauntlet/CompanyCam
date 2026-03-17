import { useBreakpoint } from '../../hooks/useBreakpoint'
import { Sidebar } from './Sidebar'

/**
 * Three-mode responsive shell.
 *
 * Mobile  (< 768px):   renders children as-is — pages control their own layout
 * Tablet  (768–1199px): renders children as-is — pages control their own max-width / centering
 * Desktop (≥ 1200px):  fixed 260px Sidebar + scrollable main content area
 */
export function Layout({ children }) {
  const { isDesktop } = useBreakpoint()

  if (!isDesktop) {
    // Mobile & tablet: no structural change — existing page layouts apply
    return <>{children}</>
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <main className="flex-1 overflow-y-auto min-w-0 bg-surface">
        {children}
      </main>
    </div>
  )
}
