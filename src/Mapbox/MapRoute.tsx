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
      tolerance: 0,
    })

    this.mapbox.map?.addLayer({
      id: 'running-routes-line',
      type: 'line',
      source: 'running-routes',
      paint: {
        'line-color': 'white',
        'line-width': 4,
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
      easing: (t) => {
        return t
      },
    })
  }

  update() {
    const coords: number[][] =
      // @ts-expect-error -- TODO
      this.geojson.features[0].geometry.coordinates

    if (this.curCoordIndex < coords.length - 1) {
      // Draw route
      const curCoord = coords[this.curCoordIndex]
      const nextCoord = coords[this.curCoordIndex + 1]
      const coordDiff = [
        (nextCoord[0] - curCoord[0]) / this.granularity,
        (nextCoord[1] - curCoord[1]) / this.granularity,
        (nextCoord[2] - curCoord[2]) / this.granularity,
      ]
      const newCoord = [
        curCoord[0] + coordDiff[0] * this.curGranularityIndex,
        curCoord[1] + coordDiff[1] * this.curGranularityIndex,
        curCoord[2] + coordDiff[2] * this.curGranularityIndex,
      ]
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(newCoord)
      // @ts-expect-error -- TODO
      this.mapbox.map.getSource('running-routes').setData(this.curGeojson)

      // Fly camera
      if (this.curCoordIndex % this.frameNumPerFly === 0) {
        const flyCoord =
          coords[this.curCoordIndex + this.frameNumPerFly] ??
          coords[coords.length - 1]
        if (this.curCoordIndex === 0) {
          this.flyTo(curCoord[0], curCoord[1], 0)
        }
        this.flyTo(
            flyCoord[0],
            flyCoord[1],
            this.frameNumPerFly * this.granularity * 40,
        )
      }

      if (this.curGranularityIndex < this.granularity) {
        this.curGranularityIndex++
      } else {
        this.curGranularityIndex = 0
        this.curCoordIndex++
      }
    }
  }
}
