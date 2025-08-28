"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    // Set client-side flag
    setIsClient(true)
    
    // Function to check mobile
    const checkIsMobile = () => {
      return window.innerWidth < MOBILE_BREAKPOINT
    }

    // Set initial value
    setIsMobile(checkIsMobile())

    // Create media query listener
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    
    // Handler for media query changes
    const handleChange = (event) => {
      setIsMobile(event.matches)
    }

    // Add listener
    mediaQuery.addEventListener('change', handleChange)

    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  // Return false during SSR, actual value on client
  return isClient ? isMobile : false
}

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