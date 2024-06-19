import MapboxGL from 'mapbox-gl'

import {COL_DE_BRAUS_FROM_LUCERAM} from '../asset/gpx'
import {Time} from '../Util/Time'
import {MapRoute} from './MapRoute'
import {MapTerrain} from './MapTerrain'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

let instance: Mapbox

export class Mapbox {
  container?: HTMLElement
  time?: Time
  map?: MapboxGL.Map
  mapRoute?: MapRoute
  mapTerrain?: MapTerrain

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
      if (!this.map) {
        return
      }
      this.mapTerrain = new MapTerrain({map: this.map})
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
