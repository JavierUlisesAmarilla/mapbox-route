import MapboxGL from 'mapbox-gl'
import {useEffect, useRef} from 'react'

import {MapboxUtil} from './Util/MapboxUtil'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

export const App = () => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    new MapboxUtil({container: containerRef.current!})
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <div ref={containerRef} className="absolute h-full w-full"/>
    </div>
  )
}
