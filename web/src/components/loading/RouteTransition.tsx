import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { useLoadingStore } from '@/stores/useLoadingStore'
import { ROUTES } from '@/app/router/routes'

export interface RouteTransitionProps {
  children: React.ReactNode
}

const getPageLoadingMessage = (pathname: string): string => {
  switch (pathname) {
    case ROUTES.PUBLIC.HOME:
      return 'Loading Kintsugi Home...'
    case ROUTES.PUBLIC.FEATURES:
      return 'Loading Features Ecosystem...'
    case ROUTES.PUBLIC.HOW_IT_WORKS:
      return 'Loading Execution Pipeline...'
    case ROUTES.PUBLIC.AI_COMPANION:
      return 'Initializing AI Empathy Engine...'
    case ROUTES.PUBLIC.TECHNOLOGY:
      return 'Loading Technology Architecture...'
    case ROUTES.PUBLIC.SAFETY:
      return 'Loading Safety Architecture...'
    case ROUTES.PUBLIC.CRISIS_SUPPORT:
      return 'Loading Crisis Support Center...'
    case ROUTES.PUBLIC.FAQ:
      return 'Loading Knowledge Base...'
    case ROUTES.PUBLIC.PRIVACY_POLICY:
      return 'Loading Privacy Policy...'
    case ROUTES.PUBLIC.TERMS:
      return 'Loading Terms of Service...'
    case ROUTES.PUBLIC.MEDICAL_DISCLAIMER:
      return 'Loading Medical Disclaimer...'
    case ROUTES.PUBLIC.ABOUT:
      return 'Loading Kintsugi Story...'
    default:
      return 'Preparing your wellness experience...'
  }
}

export const RouteTransition: React.FC<RouteTransitionProps> = ({ children }) => {
  const location = useLocation()
  const shouldReduceMotion = useReducedMotion()

  /* Listen to browser Back / Forward history navigation */
  useEffect(() => {
    const handlePopState = () => {
      useLoadingStore.getState().show(getPageLoadingMessage(window.location.pathname))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  /* Reset scroll and hide page loader instantly after layout mount (100ms) */
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior })

    const { hide } = useLoadingStore.getState()
    const timer = setTimeout(() => {
      hide()
    }, 100)

    return () => clearTimeout(timer)
  }, [location.pathname])

  return (
    <AnimatePresence>
      <motion.div
        key={location.pathname}
        className="w-full min-h-screen"
        initial={!shouldReduceMotion ? { opacity: 0 } : { opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={!shouldReduceMotion ? { opacity: 0 } : { opacity: 0 }}
        transition={{ duration: 0.18, ease: 'easeInOut' }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

export default RouteTransition
