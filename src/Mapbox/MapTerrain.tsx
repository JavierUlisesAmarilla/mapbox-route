import {Mapbox} from './Mapbox'

export class MapTerrain {
  mapbox: Mapbox

  constructor() {
    this.mapbox = new Mapbox()

    this.mapbox.map?.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    })

    this.mapbox.map?.setTerrain({source: 'mapbox-dem', exaggeration: 1.5})
  }
}
