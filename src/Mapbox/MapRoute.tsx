import {gpx} from '@tmcw/togeojson'
import * as turf from '@turf/turf'
import {FeatureCollection, LineString} from 'geojson'
import {DOMParser} from 'xmldom'

import {Mapbox} from './Mapbox'

export class MapRoute {
  mapbox: Mapbox
  zoom: number
  granularity: number
  frameNumPerFly: number
  curCoordIndex: number
  curGeojson: FeatureCollection
  line: LineString
  length: number
  curDistance: number

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
    this.frameNumPerFly = frameNumPerFly
    this.curCoordIndex = 0

    // Generate geojson
    const parsedGPX = new DOMParser().parseFromString(xmlSource)
    this.curGeojson = gpx(parsedGPX)
    // @ts-expect-error -- TODO
    this.line = turf.lineString(
        // @ts-expect-error -- TODO
        this.curGeojson.features[0].geometry.coordinates,
    )
    this.length = turf.length(this.curGeojson)
    this.curDistance = 0
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
      curve: 1,
      easing: (t) => {
        return t
      },
    })
  }

  update() {
    if (this.curDistance <= this.length) {
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
