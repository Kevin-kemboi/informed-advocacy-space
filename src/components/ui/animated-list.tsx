
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface AnimatedListProps {
  children: React.ReactNode[]
  className?: string
  staggerDelay?: number
}

export function AnimatedList({ children, className = '', staggerDelay = 0.1 }: AnimatedListProps) {
  return (
    <div className={className}>
      <AnimatePresence>
        {children.map((child, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 10 }}
            transition={{
              duration: 0.4,
              delay: index * staggerDelay,
              ease: "easeOut"
            }}
            whileHover={{ scale: 1.02, x: 5 }}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
