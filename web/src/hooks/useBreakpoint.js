import { useState, useEffect } from 'react'

function getBreakpoint(width) {
  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1200,
    isDesktop: width >= 1200,
  }
}

export function useBreakpoint() {
  const [bp, setBp] = useState(() =>
    getBreakpoint(typeof window !== 'undefined' ? window.innerWidth : 1024)
  )

  useEffect(() => {
    const handler = () => setBp(getBreakpoint(window.innerWidth))
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  return bp
}
