
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface GradientTextProps {
  children: React.ReactNode
  className?: string
  variant?: 'civic' | 'government' | 'admin' | 'rainbow'
}

export function GradientText({ children, className, variant = 'civic' }: GradientTextProps) {
  const variants = {
    civic: 'bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600',
    government: 'bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600',
    admin: 'bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600',
    rainbow: 'bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500'
  }

  return (
    <motion.span
      initial={{ backgroundPosition: '0%' }}
      animate={{ backgroundPosition: '200%' }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        repeatType: 'reverse',
        ease: 'linear'
      }}
      className={cn(
        variants[variant],
        'bg-[length:200%_100%] bg-clip-text text-transparent font-bold',
        className
      )}
    >
      {children}
    </motion.span>
  )
}
