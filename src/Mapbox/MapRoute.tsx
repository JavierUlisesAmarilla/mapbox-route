import {gpx} from "@tmcw/togeojson"
import deepClone from "deep-clone"
import {FeatureCollection} from "geojson"
import {DOMParser} from "xmldom"
import {Mapbox} from "./Mapbox"

export class MapRoute {
  mapbox: Mapbox;
  geojson: FeatureCollection;
  curGeojson: FeatureCollection;
  curIndex: number;

  constructor(params: { xmlSource: string }) {
    this.mapbox = new Mapbox();
    const { xmlSource } = params;
    const parsedGPX = new DOMParser().parseFromString(xmlSource);
    this.geojson = gpx(parsedGPX);
    // @ts-expect-error -- TODO
    this.curGeojson = deepClone(this.geojson);
    // @ts-expect-error -- TODO
    this.curGeojson.features[0].geometry.coordinates = [];
    this.curIndex = 0;

    this.mapbox.map?.addSource("running-routes", {
      type: "geojson",
      data: this.curGeojson,
    });

    this.mapbox.map?.addLayer({
      id: "running-routes-line",
      type: "line",
      source: "running-routes",
      paint: {
        "line-color": "white",
        "line-width": 3,
      },
    });

    // @ts-expect-error -- TODO
    const coordinates = this.geojson.features[0].geometry.coordinates;
    const firstCoordinate = coordinates[0];
    const middleCoordinate = coordinates[(coordinates.length / 2).toFixed()];
    const lastCoordinate = coordinates[coordinates.length - 1];
    const duration = coordinates.length * 10;
    this.flyTo(firstCoordinate[0], firstCoordinate[1], 0);
    this.flyTo(middleCoordinate[0], middleCoordinate[1], duration);
    setTimeout(() => {
      this.flyTo(lastCoordinate[0], lastCoordinate[1], duration);
    }, duration);
  }

  flyTo(lng: number, lat: number, duration: number) {
    this.mapbox.map?.flyTo({
      center: [lng, lat],
      zoom: 14,
      bearing: 0,
      pitch: 40,
      duration,
      essential: true,
    });
  }

  update() {
    const coordinates: number[][] =
      // @ts-expect-error -- TODO
      this.geojson.features[0].geometry.coordinates;
    if (this.curIndex < coordinates.length) {
      const curCoordinate = coordinates[this.curIndex];
      // @ts-expect-error -- TODO
      this.curGeojson.features[0].geometry.coordinates.push(curCoordinate);
      // @ts-expect-error -- TODO
      this.mapbox.map.getSource("running-routes").setData(this.curGeojson);
      this.curIndex++;
    }
  }
}
