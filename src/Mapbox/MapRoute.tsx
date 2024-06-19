import {gpx} from '@tmcw/togeojson'
import deepClone from 'deep-clone'
import {FeatureCollection} from 'geojson'
import MapboxGL from 'mapbox-gl'
import {DOMParser} from 'xmldom'

export class MapRoute {
  map: MapboxGL.Map
  geojson: FeatureCollection
  curGeojson: FeatureCollection
  curIndex: number
  altitude: number
  cameraOffset: number

  constructor(params: { map: MapboxGL.Map; xmlSource: string }) {
    const {map, xmlSource} = params
    this.map = map
    const parsedGPX = new DOMParser().parseFromString(xmlSource)
    this.geojson = gpx(parsedGPX)
    // @ts-expect-error -- TODO
    this.curGeojson = deepClone(this.geojson)
    // @ts-expect-error -- TODO
    this.curGeojson.features[0].geometry.coordinates = []
    this.curIndex = 0
    this.altitude = 10000
    this.cameraOffset = this.altitude * 0.000005

    this.map.addSource('running-routes', {
      type: 'geojson',
      data: this.curGeojson,
    })

    this.map.addLayer({
      id: 'running-routes-line',
      type: 'line',
      source: 'running-routes',
      paint: {
        'line-color': 'white',
        'line-width': 3,
      },
    })
  }

  flyTo(lng: number, lat: number, duration = 10000) {
    this.map.flyTo({
      center: [lng, lat],
      zoom: 13,
      bearing: 0,
      pitch: 40,
      duration,
      essential: true,
    })
  }

  update() {
    const coordinates: number[][] =
      // @ts-expect-error -- TODO
      this.geojson.features[0].geometry.coordinates
    if (this.curIndex < coordinates.length) {
      const curCoordinate = coordinates[this.curIndex]
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(curCoordinate)
      // @ts-expect-error -- TODO
      this.map.getSource('running-routes').setData(this.curGeojson)
      if (!(this.curIndex % 150)) {
        this.flyTo(
            curCoordinate[0],
            curCoordinate[1],
          this.curIndex ? 10000 : 0,
        )
      }

      if (this.curIndex >= coordinates.length - 1) {
        const lastCoordinate = coordinates[coordinates.length - 1]
        this.flyTo(lastCoordinate[0], lastCoordinate[1])
      }

      this.curIndex++
    }
  }
}
