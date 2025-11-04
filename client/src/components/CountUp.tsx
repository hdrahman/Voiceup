import { useEffect, useState } from 'react'

interface CountUpProps {
  end: number
  duration?: number
}

export default function CountUp({ end, duration = 2 }: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const increment = end / (duration * 60)
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= end) {
        setCount(end)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, 1000 / 60)

    return () => clearInterval(timer)
  }, [end, duration])

  return <>{count}</>
}
