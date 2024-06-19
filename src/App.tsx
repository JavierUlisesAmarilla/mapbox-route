import {gpx} from '@tmcw/togeojson'
import MapboxGL from 'mapbox-gl'
import {useEffect} from 'react'
import {DOMParser} from 'xmldom'

import {COL_DE_BRAUS_FROM_LUCERAM} from './asset/gpx'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

export const App = () => {
  useEffect(() => {
    const parsedGPX = new DOMParser().parseFromString(
        COL_DE_BRAUS_FROM_LUCERAM,
    )
    const geojson = gpx(parsedGPX)
    const map = new MapboxGL.Map({
      container: 'mapbox',
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [7.361653, 43.8843],
      zoom: 100,
      pitch: 40,
    })

    map.on('load', () => {
      map.addSource('running-routes', {
        type: 'geojson',
        data: geojson,
      })

      map.addLayer({
        id: 'running-routes-line',
        type: 'line',
        source: 'running-routes',
        paint: {
          'line-color': '#15cc09',
          'line-width': 4,
        },
      })
    })
  }, [])

  return (
    <div className="fixed h-screen w-screen">
      <div id="mapbox" className="absolute h-full w-full"/>
    </div>
  )
}
