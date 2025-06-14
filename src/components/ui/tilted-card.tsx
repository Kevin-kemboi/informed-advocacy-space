
import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TiltedCardProps {
  children: React.ReactNode
  className?: string
  tiltDegree?: number
}

export function TiltedCard({ children, className, tiltDegree = 2 }: TiltedCardProps) {
  return (
    <motion.div
      className={cn(
        'relative bg-white rounded-lg shadow-lg border border-gray-200',
        className
      )}
      initial={{ rotateZ: 0 }}
      whileHover={{ 
        rotateZ: tiltDegree,
        scale: 1.02,
        y: -5
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      {children}
    </motion.div>
  )
}
