import MapboxGL from 'mapbox-gl'

import {BURGBERG} from '../asset/gpx/burgberg'
import {COUILLOLE} from '../asset/gpx/couillole'
import {FISCHEN} from '../asset/gpx/fischen'
import {HUEZ} from '../asset/gpx/huez'
import {LUCERAM} from '../asset/gpx/luceram'
import {OBERJOCH} from '../asset/gpx/oberjoch'
import {Time} from '../Util/Time'
import {MapRoute} from './MapRoute'
import {MapTerrain} from './MapTerrain'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN
let instance: Mapbox
const GPX: {
  [key: string]: {
    gpx: string;
    duration?: number;
    pitch?: number;
    bearing?: number;
    endCoordIndex?: number;
  };
} = {
  burgberg: {gpx: BURGBERG, duration: 100000},
  couillole: {gpx: COUILLOLE, duration: 100000},
  fischen: {gpx: FISCHEN, duration: 100000},
  hues: {gpx: HUEZ, pitch: 60, endCoordIndex: 1267, duration: 100000},
  luceram: {gpx: LUCERAM, duration: 100000},
  oberjoch: {gpx: OBERJOCH, duration: 100000},
}
const curGPX = GPX[import.meta.env.VITE_GPX]

export class Mapbox {
  container?: HTMLElement
  time?: Time
  map?: MapboxGL.Map
  mapTerrain?: MapTerrain
  mapRoute?: MapRoute

  constructor(params?: { container?: HTMLElement }) {
    if (instance) {
      return instance
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- TODO
    instance = this
    if (!params?.container) {
      return instance
    }
    this.container = params.container
    this.time = new Time()
    this.map = new MapboxGL.Map({
      container: this.container,
      style: 'mapbox://styles/mapbox/satellite-v9',
    })

    this.map.on('load', () => {
      this.mapTerrain = new MapTerrain()
      this.mapRoute = new MapRoute({
        xmlSource: curGPX.gpx,
        duration: curGPX.duration,
        pitch: curGPX.pitch,
        bearing: curGPX.bearing,
        endCoordIndex: curGPX.endCoordIndex,
      })
    })

    this.time.on('tick', () => {
      this.update()
    })
  }

  update() {
    this.mapRoute?.update()
  }
}
