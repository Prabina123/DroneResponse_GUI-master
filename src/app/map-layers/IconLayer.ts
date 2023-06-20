import { CustomMapLayerInterface } from './CustomMapLayerInterface';
import * as mapboxgl from 'mapbox-gl';
import { LayerName } from './CustomMapLayer';
import { MapService } from '../services/map.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

export class IconLayer implements CustomMapLayerInterface {
  map: mapboxgl.Map;
  layerGeojson: GeoJSON.FeatureCollection;

  counter = 0;
  name: LayerName;
  img_path: string;
  iconImage: IconDefinition;
  private view: string;

  iconId = 1;

  geojson = {
    type: <'FeatureCollection'>'FeatureCollection',
    features: [],
  };
  constructor(
    name: LayerName,
    map: mapboxgl.Map,
    private mapService: MapService,
    geojson: GeoJSON.FeatureCollection,
    iconImage: IconDefinition
  ) {
    this.map = map;

    this.name = name;
    this.img_path = '../../assets/' + this.name + '.png';
    this.iconImage = iconImage;
    this.layerGeojson = geojson;

    this.loadLayer();

    this.drawObjectsEventHandler();
    this.onLoadSync();
    this.moveIcon();
  }

  // Update data on the map for all users
  onLoadSync(): void {
    this.mapService.getMapData().subscribe((data) => {
      if (this.name == LayerName.Home) {
        this.layerGeojson = data.home;
      } else if (this.name == LayerName.Point) {
        this.layerGeojson = data.Point;
      } else {
        this.layerGeojson = data.truck;
      }
    });
  }

  addSource(): void {
    this.map.addSource(this.name, { type: 'geojson', data: this.layerGeojson });
  }

  getLayerGeojson(): GeoJSON.FeatureCollection {
    return this.layerGeojson;
  }

  loadLayer(): void {
    this.addSource();
    this.addLayer();
  }

  addLayer(): void {
    let that = this;
    // Loads image for icons and matches the color if it is a drone
    this.map.loadImage(that.img_path, function (error: any, image: HTMLImageElement) {
      if (error) {
        throw error;
      }
      that.map.addImage(`${that.name}-${that.counter}`, image, { sdf: true });

      that.map.addLayer({
        id: that.name,
        type: 'symbol',
        source: that.name,
        layout: {
          'icon-image': `${that.name}-${that.counter}`,
          'icon-size': 1,
          'icon-allow-overlap': true,
        },
        paint: {
          'icon-color':
            that.name === 'Point'
              ? ['get', 'color']
              : [
                'match',
                ['get', 'id'],
                'drone-0',
                '#7B4D80',
                'drone-1',
                '#E1062E',
                'drone-2',
                '#089B6A',
                'drone-3',
                '#E14806',
                'drone-4',
                '#08879B',
                'drone-5',
                '#E17406',
                'drone-6',
                '#309B08',
                'drone-7',
                '#520989',
                'drone-8',
                '#606D9B',
                'drone-9',
                '#E1C306',
                'drone-10',
                '#0D0989',
                'black',
              ],
        },
      });

      that.counter++;
    });
  }

  updateLayer(): void {
    let source: mapboxgl.GeoJSONSource = this.map.getSource(
      this.name
    ) as mapboxgl.GeoJSONSource;
    source.setData(this.layerGeojson);
  }

  toggleLayer(): void {
    if (this.view === 'none') {
      this.view = 'visible';
    } else {
      this.view = 'none';
    }

    this.map.setLayoutProperty(this.name, 'visibility', this.view);
  }

  getVisibility(): string {
    return this.view;
  }

  setVisibility(view: string): void {
    this.view = view;
  }

  // Update GeoJSON with new objects when drawn
  drawObjectsEventHandler(): void {
    this.mapService.getLayerGeojsonData().subscribe((data) => {
      // Update client GeoJSON with GeoJSON data from server
      if (data.layer === this.name) {
        this.layerGeojson = data.geojson;
      }
      this.updateLayer();
    });
  }

  customAddIcon(name: string, e: any, data: any, color: any): void {
    let iconNumber = 0;
    if (data.features.length > 0) {
      iconNumber = data.features[data.features.length - 1].properties.idnum + 1;
    }
    data.features.push({
      type: 'Feature',
      properties: {
        id: `${name}-${color}`,
        //'idnum': data.features[data.features.length-1].properties
        idnum: iconNumber,
        edited: false,
        color,
      },
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      },
    });
    this.mapService.createObject(name, data);
  }

  addIcon(name: string, e: mapboxgl.MapMouseEvent): void {
    let iconNumber = 0;
    if (this.layerGeojson.features.length > 0) {
      iconNumber =
        this.layerGeojson.features[this.layerGeojson.features.length - 1]
          .properties.idnum + 1;
    }
    this.layerGeojson.features.push({
      type: 'Feature',
      properties: {
        id: `${name}-${iconNumber}`,
        //'idnum': this.layerGeojson.features[this.layerGeojson.features.length-1].properties
        idnum: iconNumber,
        edited: false,
      },
      geometry: {
        type: 'Point',
        coordinates: [e.lngLat.lng, e.lngLat.lat],
      },
    });
    this.mapService.createObject(this.name, this.layerGeojson);
  }

  // function to drag icon
  moveIcon(): void {
    let that = this;
    this.map.on('touchstart', this.name, function (e) {
      let canvas = that.map.getCanvasContainer();

      // get the id of the selected icon
      let currentFeatureId = that.map.queryRenderedFeatures(e.point)[0]
        .properties.idnum;
      canvas.style.cursor = 'grab';

      // freeze map from normal dragging behavior
      e.preventDefault();

      // find the point in the geojson
      let currentMarker = that.layerGeojson.features.find((obj) => {
        return obj.properties.idnum === currentFeatureId;
      });
      this.on('touchmove', function onMove(e) {
        let coords = e.lngLat;
        canvas.style.cursor = 'grabbing';
        // need this conditional to access coordinates element
        if (currentMarker.geometry.type === 'Point') {
          currentMarker.geometry.coordinates = [coords.lng, coords.lat];
        }
        // send the update to the map image
        (that.map.getSource(that.name) as mapboxgl.GeoJSONSource).setData(that.layerGeojson);
      });
      this.on('touchend', function () {
        let coords = e.lngLat;
        canvas.style.cursor = '';
        // turn off listeners
        this.off('mousemove', this.onMove);
        this.off('touchmove', this.onMove);
        // send changed locaiton to the server
        that.mapService.createObject(that.name, that.layerGeojson);
      });
    });
  }

  deleteIcon(e: mapboxgl.MapMouseEvent): void {
    // find selected icon in geojson and splice it
    for (let i = 0; i < this.layerGeojson.features.length; i++) {
      if (
        this.map.queryRenderedFeatures(e.point)[0].properties.idnum ===
        this.layerGeojson.features[i].properties.idnum
      ) {
        this.layerGeojson.features.splice(i, 1);
      }
    }
    this.mapService.createObject(this.name, this.layerGeojson);
  }
}
