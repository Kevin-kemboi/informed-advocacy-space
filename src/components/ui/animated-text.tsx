
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedTextProps {
  text: string
  variant?: 'gradient' | 'glitch' | 'shimmer' | 'count'
  className?: string
  duration?: number
}

export function AnimatedText({ text, variant = 'gradient', className, duration = 1 }: AnimatedTextProps) {
  switch (variant) {
    case 'gradient':
      return (
        <motion.span
          initial={{ backgroundPosition: '0%' }}
          animate={{ backgroundPosition: '100%' }}
          transition={{ duration, repeat: Infinity, repeatType: 'reverse' }}
          className={cn(
            'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%] bg-clip-text text-transparent',
            className
          )}
        >
          {text}
        </motion.span>
      )
    
    case 'shimmer':
      return (
        <motion.span
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
          className={cn('text-white drop-shadow-lg', className)}
        >
          {text}
        </motion.span>
      )
    
    case 'glitch':
      return (
        <motion.span
          animate={{
            textShadow: [
              '0 0 0 transparent',
              '2px 0 0 #ff0000, -2px 0 0 #00ff00',
              '0 0 0 transparent'
            ]
          }}
          transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
          className={cn('font-bold', className)}
        >
          {text}
        </motion.span>
      )
    
    default:
      return <span className={className}>{text}</span>
  }
}
