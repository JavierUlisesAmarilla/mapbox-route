import MapboxGL from 'mapbox-gl'
import {useEffect} from 'react'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

export const App = () => {
  useEffect(() => {
    new MapboxGL.Map({
      container: 'mapbox',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [-96, 37.8],
      zoom: 3,
      pitch: 40,
    })
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <div id="mapbox" className="absolute h-full w-full"/>
    </div>
  )
}
