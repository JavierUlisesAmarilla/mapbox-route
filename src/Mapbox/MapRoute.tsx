import {gpx} from '@tmcw/togeojson'
import * as turf from '@turf/turf'
import {FeatureCollection, LineString} from 'geojson'
import {DOMParser} from 'xmldom'

import {IS_DEV_MODE} from '../constant'
import {Mapbox} from './Mapbox'

export class MapRoute {
  mapbox: Mapbox
  zoom: number
  frameNumPerFly: number
  pitch: number
  bearing: number
  curCoordIndex: number
  curGeojson: FeatureCollection
  line: LineString
  length: number
  curDistance: number
  canDraw: boolean
  granularity: number

  constructor(params: {
    xmlSource: string;
    zoom?: number;
    duration?: number;
    frameNumPerFly?: number;
    pitch?: number;
    bearing?: number;
    endCoordIndex?: number;
  }) {
    this.mapbox = new Mapbox()
    const {xmlSource, zoom, duration, frameNumPerFly} = params
    this.zoom = zoom ?? 15
    this.frameNumPerFly = frameNumPerFly ?? 100
    this.pitch = params.pitch ?? 45
    this.bearing = params.bearing ?? 0
    this.curCoordIndex = 0

    // Generate geojson
    const parsedGPX = new DOMParser().parseFromString(xmlSource)
    this.curGeojson = gpx(parsedGPX)
    // @ts-expect-error -- TODO
    const coords: [] = this.curGeojson.features[0].geometry.coordinates
    if (params.endCoordIndex) {
      coords.splice(params.endCoordIndex)
    }
    // @ts-expect-error -- TODO
    this.line = turf.lineString(coords)
    this.length = turf.length(this.curGeojson)
    this.curDistance = 0
    this.canDraw = false
    this.granularity = duration ? this.length / (duration / 17) : 0.002
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
        'line-width': 3,
      },
    })

    // Init
    if (IS_DEV_MODE) {
      this.canDraw = true
    } else {
      const flyCoord = turf.along(this.line, 0).geometry.coordinates
      this.flyTo(flyCoord[0], flyCoord[1], 5000)
      setTimeout(() => {
        this.canDraw = true
      }, 10000)
    }
  }

  flyTo(lng: number, lat: number, duration: number) {
    this.mapbox.map?.flyTo({
      center: [lng, lat],
      zoom: this.zoom,
      bearing: this.bearing,
      pitch: this.pitch,
      duration,
      essential: true,
      curve: 1,
      easing: (t) => {
        return t
      },
    })
  }

  update() {
    if (this.canDraw && this.curDistance <= this.length) {
      const coord = turf.along(this.line, this.curDistance).geometry
          .coordinates
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(coord)
      // @ts-expect-error -- TODO
      this.mapbox.map.getSource('running-routes').setData(this.curGeojson)

      // Fly camera
      if (this.curCoordIndex % this.frameNumPerFly === 0) {
        const flyCoord = turf.along(
            this.line,
            this.curDistance + this.frameNumPerFly * this.granularity,
        ).geometry.coordinates
        if (this.curCoordIndex === 0) {
          this.flyTo(coord[0], coord[1], 0)
        }
        this.flyTo(flyCoord[0], flyCoord[1], this.frameNumPerFly * 30)
      }

      this.curDistance += this.granularity
      this.curCoordIndex++
    }
  }
}
