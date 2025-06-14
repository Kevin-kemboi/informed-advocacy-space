
import React from 'react'
import { motion } from 'framer-motion'

interface AuroraBackgroundProps {
  className?: string
}

export function AuroraBackground({ className = '' }: AuroraBackgroundProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 600px 800px at 80% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse 400px 400px at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)
          `
        }}
        animate={{
          background: [
            `
              radial-gradient(ellipse 800px 600px at 20% 40%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 600px 800px at 80% 60%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 400px 400px at 40% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)
            `,
            `
              radial-gradient(ellipse 600px 800px at 60% 20%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse 800px 600px at 20% 80%, rgba(147, 51, 234, 0.4) 0%, transparent 50%),
              radial-gradient(ellipse 400px 400px at 80% 40%, rgba(16, 185, 129, 0.4) 0%, transparent 50%)
            `,
            `
              radial-gradient(ellipse 800px 600px at 80% 60%, rgba(59, 130, 246, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 600px 800px at 40% 20%, rgba(147, 51, 234, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse 400px 400px at 60% 80%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)
            `
          ]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
      />
    </div>
  )
}
