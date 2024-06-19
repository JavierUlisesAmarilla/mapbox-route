import MapboxGL from 'mapbox-gl'

import {COL_DE_BRAUS_FROM_LUCERAM} from '../asset/gpx'
import {MapRoute} from './MapRoute'
import {Time} from './Time'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

let instance: MapboxUtil

export class MapboxUtil {
  container?: HTMLElement
  time?: Time
  map?: MapboxGL.Map
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
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [7.361653, 43.8843],
      zoom: 12,
      pitch: 40,
    })

    this.map.on('load', () => {
      if (!this.map) {
        return
      }
      this.mapRoute = new MapRoute({
        map: this.map,
        xmlSource: COL_DE_BRAUS_FROM_LUCERAM,
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
