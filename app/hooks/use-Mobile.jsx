"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
<<<<<<< HEAD:app/hooks/use-mobile.jsx
=======

// Alternative version with user agent detection (more comprehensive)
export function useIsMobileDetailed() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    
    const checkIsMobile = () => {
      // Screen width check
      const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
      
      // User agent check for mobile devices
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)
      
      // Touch support check
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      
      // Combine checks - prioritize screen size but consider other factors
      return isSmallScreen || (isMobileUA && isTouchDevice)
    }

    setIsMobile(checkIsMobile())

    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const handleChange = (event) => {
      setIsMobile(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return isClient ? isMobile : false
}
>>>>>>> 85546b6c4636b115d121b6306050bdb2287fb309:app/hooks/use-Mobile.jsx
