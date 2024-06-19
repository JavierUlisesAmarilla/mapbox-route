import {useEffect, useRef} from 'react'

import {Mapbox} from './Mapbox/Mapbox'

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    new Mapbox({container: containerRef.current!})
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <div ref={containerRef} className="absolute h-full w-full"/>
    </div>
  )
}
