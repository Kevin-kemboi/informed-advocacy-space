
import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

interface CountUpProps {
  value: number
  duration?: number
  className?: string
}

export function CountUp({ value, duration = 1, className }: CountUpProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, latest => Math.round(latest))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    const controls = animate(count, value, { duration })
    return controls.stop
  }, [count, value, duration])

  useEffect(() => {
    const unsubscribe = rounded.onChange(setDisplayValue)
    return unsubscribe
  }, [rounded])

  return (
    <motion.span 
      className={className}
      initial={{ scale: 0.8 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
    >
      {displayValue}
    </motion.span>
  )
}
