import MapboxGL from 'mapbox-gl'

export class MapTerrain {
  map: MapboxGL.Map

  constructor(params: { map: MapboxGL.Map }) {
    this.map = params.map

    this.map.addSource('mapbox-dem', {
      type: 'raster-dem',
      url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
      tileSize: 512,
      maxzoom: 14,
    })

    this.map.setTerrain({source: 'mapbox-dem', exaggeration: 1.5})
  }
}
