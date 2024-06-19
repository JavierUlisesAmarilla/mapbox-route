import {gpx} from '@tmcw/togeojson'
import MapboxGL from 'mapbox-gl'
import {DOMParser} from 'xmldom'

import {COL_DE_BRAUS_FROM_LUCERAM} from '../asset/gpx'
import {Keyboard} from './Keyboard'
import {Size} from './Size'
import {Time} from './Time'

MapboxGL.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

let instance: MapboxUtil

export class MapboxUtil {
  container?: HTMLElement
  size?: Size
  time?: Time
  keyboard?: Keyboard

  constructor(params?: {
    container?: HTMLElement;
    onProgress?: { (progress: number): void };
  }) {
    if (instance) {
      return instance
    }
    // eslint-disable-next-line @typescript-eslint/no-this-alias -- TODO
    instance = this
    if (!params?.container) {
      return instance
    }
    this.container = params.container
    this.size = new Size()
    this.time = new Time()
    this.keyboard = new Keyboard()
    const parsedGPX = new DOMParser().parseFromString(
        COL_DE_BRAUS_FROM_LUCERAM,
    )
    const geojson = gpx(parsedGPX)
    const map = new MapboxGL.Map({
      container: this.container,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [7.361653, 43.8843],
      zoom: 100,
      pitch: 40,
    })

    map.on('load', () => {
      map.addSource('running-routes', {
        type: 'geojson',
        data: geojson,
      })

      map.addLayer({
        id: 'running-routes-line',
        type: 'line',
        source: 'running-routes',
        paint: {
          'line-color': '#15cc09',
          'line-width': 4,
        },
      })
    })

    this.size.on('resize', () => {
      this.resize()
    })
    this.time.on('tick', () => {
      this.update()
    })
  }

  resize() {
    //
  }

  update() {
    //
  }
}
