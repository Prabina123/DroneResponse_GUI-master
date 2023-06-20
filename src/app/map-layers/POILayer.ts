import { CustomMapLayerInterface } from './CustomMapLayerInterface';
import * as mapboxgl from 'mapbox-gl';
import { LayerName } from './CustomMapLayer';
import { MapService } from '../services/map.service';

export class POILayer implements CustomMapLayerInterface {
  map: mapboxgl.Map;
  layerGeojson: GeoJSON.FeatureCollection;
  counter = 0;
  name: LayerName;
  //img_path: string;
  //iconImage: IconDefinition;
  private view: string;

  constructor(
    map: mapboxgl.Map,
    private mapService: MapService,
    geojson: GeoJSON.FeatureCollection) {
    this.name = LayerName.POI
    this.map = map;
    this.layerGeojson = geojson;

    this.loadLayer();
    this.onLoadSync();
    this.getNowPOI();
  }

  onLoadSync(): void {
    this.setVisibility('visible');
    this.mapService.getPoiData().subscribe((data) => {
      if (Object.keys(data).length > 0) {
        if (data.Entries.length > 0) {

          data.Entries.forEach(poi => {
            this.addPOLInLayer(this.name, poi);
          });
        }
        this.updateLayer();

      }
    });
  }

  getNowPOI(): void {
    this.mapService.getPoi().subscribe((data) => {
      if (Object.keys(data).length > 0) {
        this.addPOLInLayer(this.name, data);
        this.updateLayer();
      }
    });

  }
  addSource(): void {
    this.map.addSource(this.name, { type: 'geojson', data: this.layerGeojson });
  }

  getLayerGeojson() {
    return this.layerGeojson;
  }

  loadLayer(): void {
    this.addSource()
    this.addLayer()
  }

  addLayer(): void {
    this.addDangerAreaLayer();
    this.addLocationMarkerLayer();
    this.addPersonMarkerLayer()
    // //console.log(this.map)
    // let that = this
    // // Loads image for icons and matches the color if it is a drone
    // this.map.loadImage(img_path, function (error, image) {
    //   if (error) throw error;
    //   that.map.addImage(`${layer_name}-${that.counter}`, image, { sdf: true });
    //   console.log(layer_name)
    //   that.map.addLayer({
    //     'id': that.name,
    //     'type': 'symbol',
    //     'source': that.name,
    //     'layout': {
    //       'icon-image': `${that.name}-${that.counter}`,
    //       'icon-size': 1,
    //       'icon-allow-overlap': true
    //     },
    //     // 'paint': {
    //     //   'icon-color':
    //     //     ['match',
    //     //       ['get', 'id'],
    //     //       'drone-0', '#7B4D80',
    //     //       'drone-1', '#E1062E',
    //     //       'drone-2', '#089B6A',
    //     //       'drone-3', '#E14806',
    //     //       'drone-4', '#08879B',
    //     //       'drone-5', '#E17406',
    //     //       'drone-6', '#309B08',
    //     //       'drone-7', '#520989',
    //     //       'drone-8', '#606D9B',
    //     //       'drone-9', '#E1C306',
    //     //       'drone-10', '#0D0989',
    //     //       'black'
    //     //     ]
    //     // }
    //   });
    //   that.counter++;
    // });
  }

  updateLayer(): void {
    let source: mapboxgl.GeoJSONSource = this.map.getSource(this.name) as mapboxgl.GeoJSONSource;
    source.setData(this.layerGeojson);
  }

  addDangerAreaLayer(): void {
    let img_path: string = '../../assets/disaster.png';
    let poi_type: string = 'danger';
    let counter: number = 0;
    let icon_size = 0.5;
    this.loadimageAndAddLayer(img_path, poi_type, counter, icon_size)
  }

  addLocationMarkerLayer(): void {
    let img_path: string = '../../assets/fireHydrant.webp';
    let poi_type: string = 'virtualWorld'; //TODO : Update the Dummy string here at Unity server first
    let counter: number = 0;
    let icon_size = 0.15;
    this.loadimageAndAddLayer(img_path, poi_type, counter, icon_size)
  }

  // TODO: I think counter is redundant here: remove it after one round of testing
  addPersonMarkerLayer(): void {
    let img_path: string = '../../assets/PersonNeedHelp.png';
    let poi_type: string = 'person';
    let counter: number = 0;
    let icon_size = 0.5;
    this.loadimageAndAddLayer(img_path, poi_type, counter, icon_size)
  }

  loadimageAndAddLayer(img_path, poi_type, counter, icon_size): void {
    let that = this
    this.map.loadImage(img_path, function (error, image) {
      if (error) {
        console.log(`Error while loading the image: ${error}`)
        throw error;
      }
      that.map.addImage(`${poi_type}-${counter}`, image);

      that.map.addLayer({
        'id': poi_type,
        'type': 'symbol',
        'source': that.name,
        'layout': {
          'icon-image': `${poi_type}-${counter}`,
          'icon-size': icon_size,
          'icon-allow-overlap': true
        },
        'filter': ['==', 'poi_type', poi_type]
      });
      counter++;
    });
  }

  addPOLInLayer(name: string, poi: any): void {
    let poiNumber = 0;
    if (this.layerGeojson.features.length > 0) {
      poiNumber = this.layerGeojson.features[this.layerGeojson.features.length - 1].properties.idnum + 1;
    }
    this.layerGeojson.features.push(
      {
        'type': 'Feature',
        'properties': {
          'id': `${name}-${poiNumber}`,
          'idnum': poiNumber,
          'edited': false,
          'poi_type': poi.Location.Label
        },
        'geometry': {
          'type': 'Point',
          coordinates: [poi.Location.Longitude, poi.Location.Latitude]
        }
      }
    );
  }

  toggleLayer(): void {
    if (this.view === 'none') { this.view = 'visible'; }
    else { this.view = 'none'; }

    this.map.setLayoutProperty(this.name, 'visibility', this.view);
  }

  getVisibility(): string {
    return this.view;
  }

  setVisibility(view: string): void {
    this.view = view;
  }
}