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

  lookAt(lng: number, lat: number) {
    const camera = this.map.getFreeCameraOptions()
    camera.position = MapboxGL.MercatorCoordinate.fromLngLat(
        {lng: lng + this.cameraOffset, lat: lat + this.cameraOffset},
        this.altitude,
    )
    camera.lookAtPoint({lng, lat})
    this.map.setFreeCameraOptions(camera)
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
      this.lookAt(curCoordinate[0], curCoordinate[1])
      this.curIndex++
    }
  }
}
