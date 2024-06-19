import {gpx} from '@tmcw/togeojson'
import deepClone from 'deep-clone'
import {FeatureCollection} from 'geojson'
import {DOMParser} from 'xmldom'

import {Mapbox} from './Mapbox'

export class MapRoute {
  mapbox: Mapbox
  zoom: number
  granularity: number
  frameNumPerFly: number
  curCoordIndex: number
  curGranularityIndex: number
  geojson: FeatureCollection
  curGeojson: FeatureCollection

  constructor(params: {
    xmlSource: string;
    zoom: number;
    granularity: number;
    frameNumPerFly: number;
  }) {
    this.mapbox = new Mapbox()
    const {xmlSource, zoom, granularity, frameNumPerFly} = params
    this.zoom = zoom
    this.granularity = granularity
    if (this.granularity < 1) {
      this.granularity = 1
    }
    this.frameNumPerFly = frameNumPerFly
    this.curCoordIndex = 0
    this.curGranularityIndex = 0

    // Generate geojson
    const parsedGPX = new DOMParser().parseFromString(xmlSource)
    this.geojson = gpx(parsedGPX)
    // @ts-expect-error -- TODO
    this.curGeojson = deepClone(this.geojson)
    // @ts-expect-error -- TODO
    this.curGeojson.features[0].geometry.coordinates = []

    this.mapbox.map?.addSource('running-routes', {
      type: 'geojson',
      data: this.curGeojson,
    })

    this.mapbox.map?.addLayer({
      id: 'running-routes-line',
      type: 'line',
      source: 'running-routes',
      paint: {
        'line-color': 'white',
        'line-width': 3,
      },
    })
  }

  flyTo(lng: number, lat: number, duration: number) {
    this.mapbox.map?.flyTo({
      center: [lng, lat],
      zoom: this.zoom,
      bearing: 0,
      pitch: 30,
      duration,
      essential: true,
    })
  }

  update() {
    const coordinates: number[][] =
      // @ts-expect-error -- TODO
      this.geojson.features[0].geometry.coordinates

    if (this.curCoordIndex < coordinates.length) {
      // Draw route
      const curCoordinate = coordinates[this.curCoordIndex]
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(curCoordinate)
      // @ts-expect-error -- TODO
      this.mapbox.map.getSource('running-routes').setData(this.curGeojson)

      // Fly camera
      if (this.curCoordIndex % this.frameNumPerFly === 0) {
        const nextCoordinate =
          coordinates[this.curCoordIndex + this.frameNumPerFly] ??
          coordinates[coordinates.length - 1]
        if (this.curCoordIndex === 0) {
          this.flyTo(curCoordinate[0], curCoordinate[1], 0)
        }
        this.flyTo(
            nextCoordinate[0],
            nextCoordinate[1],
            this.frameNumPerFly * 30,
        )
      }

      this.curCoordIndex++
    }
  }
}
