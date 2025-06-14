
import React from 'react'
import { motion } from 'framer-motion'

interface AnimatedBackgroundProps {
  variant?: 'aurora' | 'particles' | 'grid' | 'liquid'
  children: React.ReactNode
}

export function AnimatedBackground({ variant = 'aurora', children }: AnimatedBackgroundProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {variant === 'aurora' && (
        <>
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 20, repeat: Infinity }}
            className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
              opacity: [0.4, 0.7, 0.4]
            }}
            transition={{ duration: 25, repeat: Infinity }}
            className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              x: [-50, 50, -50],
              y: [-30, 30, -30],
              opacity: [0.2, 0.5, 0.2]
            }}
            transition={{ duration: 30, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-2xl"
          />
        </>
      )}
      
      {variant === 'grid' && (
        <div className="absolute inset-0">
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        </div>
      )}
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
