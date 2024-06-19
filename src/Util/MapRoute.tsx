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

  update() {
    const coordinates: number[][] =
      // @ts-expect-error -- TODO
      this.geojson.features[0].geometry.coordinates
    if (this.curIndex < coordinates.length) {
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(
          coordinates[this.curIndex],
      )
      // @ts-expect-error -- TODO
      this.map.getSource('running-routes').setData(this.curGeojson)
      this.curIndex++
    }
  }
}
