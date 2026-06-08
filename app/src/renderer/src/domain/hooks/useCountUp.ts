import { useEffect, useRef, useState } from 'react'

export function useCountUp(value: number): number {
  const [disp, setDisp] = useState(value)
  const prev = useRef(value)

  useEffect(() => {
    const from = prev.current
    const to = value
    prev.current = value
    if (from === to) return

    const ms = 620
    let raf: number
    let t0: number | undefined

    const tick = (now: number): void => {
      if (!t0) t0 = now
      const p = Math.min(1, (now - t0) / ms)
      const e = 1 - Math.pow(1 - p, 3)
      setDisp(Math.round(from + (to - from) * e))
      if (p < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value])

  return disp
}
