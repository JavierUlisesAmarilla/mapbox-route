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
const GPX: { [key: string]: string } = {
  burgberg: BURGBERG,
  couillole: COUILLOLE,
  fischen: FISCHEN,
  hues: HUEZ,
  luceram: LUCERAM,
  oberjoch: OBERJOCH,
}

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
        xmlSource: GPX[import.meta.env.VITE_GPX],
        zoom: 15,
        granularity: 2,
        frameNumPerFly: 100,
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
