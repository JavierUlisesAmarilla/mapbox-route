import {gpx} from '@tmcw/togeojson'
import MapboxGL from 'mapbox-gl'
import {DOMParser} from 'xmldom'

export class MapRoute {
  constructor(params: { map: MapboxGL.Map; xmlSource: string }) {
    const {map, xmlSource} = params
    const parsedGPX = new DOMParser().parseFromString(xmlSource)
    const geojson = gpx(parsedGPX)

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
  }

  update() {
    //
  }
}
