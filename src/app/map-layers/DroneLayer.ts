import { CustomMapLayerInterface } from './CustomMapLayerInterface';
import * as mapboxgl from 'mapbox-gl';
import { LayerName } from './CustomMapLayer';
import { MapService } from '../services/map.service';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { DroneService } from '../services/drone-service/drone.service';
import { Explain } from './DroneExplain';
import { Lla } from '../model/Lla';
import { Drone } from '../model/Drone';


export class DroneLayer implements CustomMapLayerInterface {
  map: mapboxgl.Map;
  layerGeojson: GeoJSON.FeatureCollection;
  headGeojson: GeoJSON.FeatureCollection;
  name: LayerName;
  img_path: string;
  iconImage: IconDefinition;
  private view: string;
  explains: Explain[];
  droneExplainVisible = true;
  popupMap: Map<string, mapboxgl.Popup> = new Map();
  geoFenceView: boolean;

  // edit this depending on number of drones, add lighter shade of color for tail
  droneColors = [
    { name: '', color: '#7B4D80', tailcolor: '#ee87fa', popup: '' },
    { name: '', color: '#E1062E', tailcolor: '#fa93a6', popup: '' },
    { name: '', color: '#089B6A', tailcolor: '#cdf7e9', popup: '' },
    { name: '', color: '#E1C306', tailcolor: '#fce860', popup: '' },
    { name: '', color: '#08879B', tailcolor: '#a7effa', popup: '' },
    { name: '', color: '#E17406', tailcolor: '#f7c797', popup: '' }
  ];

  geojson = {
    type: <'FeatureCollection'>'FeatureCollection',
    features: []
  }

  activeDrones: Map<string, Drone> = new Map();
  alerts: Map<string, object[]> = new Map();

  constructor(
    name: LayerName,
    map: mapboxgl.Map,
    droneGeojson: GeoJSON.FeatureCollection,
    headGeojson: GeoJSON.FeatureCollection,
    iconImage: IconDefinition,
    public droneService: DroneService,
    geoFenceView: boolean,
    explains: Explain[]
    ) {

    this.map = map;
    this.layerGeojson = droneGeojson;
    this.headGeojson = headGeojson;
    this.name = name;
    this.img_path = '../../assets/arrow.png';
    this.iconImage = iconImage;
    this.explains = explains;

    // Use different drones on geofence view
    this.geoFenceView = geoFenceView;

    // Setup layer sources and features
    this.loadLayer();
    this.onLoadSync();
    this.openPopupListener();

    this.droneService.loadDrones();
  }

  onLoadSync(): void {
    this.droneService.getActiveDrones().subscribe((value) => {
      this.activeDrones = value;
      this.removeDrones();
      this.moveDrones();
      if (this.activeDrones.size > 0) {
        //this.setMapCenter();
      }
    });

    this.droneService.getAlerts().subscribe((value) => {
      this.alerts = value;
      this.addPopups();

      if (this.droneService.getExplainBoxState() == true) {
        this.closeAllExplain()
      }

    });
  }

  addSource(): void {
    this.map.addSource(this.name, { type: 'geojson', data: this.layerGeojson });
  }

  getLayerGeojson(): any {
    return this.layerGeojson;
  }

  loadLayer(): void {
    this.addSource()
    this.addLayer()
    this.addHeadLayer();
  }

  addLayer(): void {
    let that = this
    // Loads image for icons and matches the color if it is a drone
    this.map.loadImage(that.img_path, function (error, image) {
      if (error) {
        throw error;
      }
      if (!that.map.hasImage(that.name)) {
        that.map.addImage(that.name, image, { sdf: true });
      }

      that.map.addLayer({
        'id': that.name,
        'type': 'symbol',
        'source': that.name,
        'layout': {
          'icon-image': that.name,
          'icon-size': 1,
          'icon-rotate': ['get', 'direction'],
          'icon-allow-overlap': true
        },
        'paint': {
          'icon-color': ['get', 'color'],
        }
      });
    });
  }

  updateLayer(): void {
    let source: mapboxgl.GeoJSONSource = this.map.getSource(this.name) as mapboxgl.GeoJSONSource;
    source.setData(this.layerGeojson);
  }

  // Called on changes to drone status
  moveDrones(): void {
    // Using map iteration rather than indexes
    this.activeDrones.forEach((activeDrone: Drone, key: string) => {
      let geojsonEntry = this.layerGeojson.features.find(obj => obj.properties.droneId === key );

      // Add drone if GeoJSON entry is not defined
      if (geojsonEntry === undefined) {
        this.addDrone(key, activeDrone);
        geojsonEntry = this.layerGeojson.features.find(obj => obj.properties.droneId === key );
      }

      // Update Geojson information
      // Need this conditional to access coordinates
      if (geojsonEntry.geometry.type == 'Point') {
        geojsonEntry.geometry.coordinates = [activeDrone.status.location.longitude, activeDrone.status.location.latitude];
        geojsonEntry.properties.direction = activeDrone.status.drone_heading;
      }
    });

    // Update map with new geojson info
    (this.map.getSource(this.name) as mapboxgl.GeoJSONSource).setData(this.layerGeojson);
  }

  // Called from move drones if there is a new drone in the map
  addDrone(droneId: string, activeDrone: Drone): void {
    this.layerGeojson.features.push(
      {
        'type': 'Feature',
        'properties': {
          'droneId': droneId,
          'direction': activeDrone.status.drone_heading,
          'color': activeDrone.uavid 
        },
        'geometry': {
          'type': 'Point',
          coordinates: [activeDrone.status.location.longitude, activeDrone.status.location.latitude]
        }
      }
    );
  }

  removeDrones() {
    this.layerGeojson.features = this.layerGeojson.features.filter(obj => this.activeDrones.has(obj.properties.droneId));
  }

  addHeadLayer(): void {
    this.map.addSource('heads',
      {
        type: 'geojson',
        data: this.headGeojson
      }
    );

    this.map.addLayer({
      'id': 'heads',
      'type': 'line',
      'source': 'heads',
      'layout': {
        'line-join': 'round',
        'line-cap': 'round'
      },
      'paint': {
        'line-color': ['get', 'color'],
        'line-width': 4,
        'line-dasharray': [2, 2]
      }
    });
  }

  addHeadLine(droneId: string, droneLla: Lla, waypointLla: Lla): void {
    this.headGeojson.features.push(
      {
        'type': 'Feature',
        'properties': {
          'droneId': droneId,
          'color': droneId
        },
        'geometry': {
          'type': 'LineString',
          'coordinates': [
            [droneLla.longitude, droneLla.latitude],
            [waypointLla.longitude, waypointLla.latitude]
          ]
        }
      }
    );

    (this.map.getSource('heads') as mapboxgl.GeoJSONSource).setData(this.headGeojson)
  }

  // Change visibility of layer
  toggleLayer(): void {
    if (this.view === 'none') {
      this.view = 'visible';
    }
    else {
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

  openPopupListener(): void {
    this.map.on('click', this.name, (e) => {
      let droneId = e.features[0].properties.droneId;
      let drone = this.activeDrones.get(droneId);
      let alerts = this.alerts.get(droneId);
      if (alerts) {
        this.addExplainPopup(drone, alerts);
      }
    });
  }

  // Function to add explain popup
  addExplainPopup(activeDrone: any, alerts: any[]) {
    let messages = {
      'mist': 'Mist detected! Flying Lower & Slower',
      'person': 'Person detected! || Tracking ',
      'path': 'Path conflict || Avoiding collision',
      'rtl': 'Mechanical Failure || Landing'
    }
    let alertMessages = '';
    for (let alert of alerts) {
      alertMessages += messages[alert.type];
      alertMessages += '<br>';
    }

    if (alertMessages == '') {
      this.popupMap[activeDrone.uavid].remove();
    }
    else {
      let explainMessage = alerts[0].data.explanation;
      let explainConfidence = alerts[0].data.confidence;

      let droneId = activeDrone.uavid;
      let popupHTML = `<div class='drone-popup' id=popup-${droneId} style=background-color:${droneId}> <h6>${alertMessages}</h6></div>`;
      let popup = new mapboxgl.Popup({ closeOnClick: true })
        .setLngLat([activeDrone.status.location.longitude, activeDrone.status.location.latitude])
        .setHTML(popupHTML)
        .addTo(this.map);

      let that = this;

      popup.getElement().onclick = function () {
        if (that.explains[0].color === undefined || that.explains[0].color === droneId) {
          let explain = that.explains[0];

          explain.setVisibility(true);
          explain.setInformation(activeDrone, alerts[0].type, explainMessage, explainConfidence, 0);
        }
        else {
          let explain = that.explains[1];
          explain.setVisibility(true);
          explain.setInformation(activeDrone, alerts[0].type, explainMessage, explainConfidence, 1);
        }
      }

      // Style popup tip with drone color
      let tips = document.querySelectorAll('.mapboxgl-popup-tip');
      let tip = tips.item(tips.length - 1);
      tip.setAttribute('style', 'border-top-color: ' + droneId);
      this.popupMap[droneId] = popup;


      // Comment this line if you want to show two differnt alerts
      //if(Number(that.explains[0].confidence)<environment.alert_confidence_threshold){
      // if ((that.explains[0].color === undefined || that.explains[0].color === droneId)) {
      //   let explain = that.explains[0];
      //   explain.setVisibility(true);
      //   explain.setInformation(activeDrone, alerts[0].type, explainMessage, explainConfidence, 0);
      // }
      // else {
      //   let explain = that.explains[1];
      //   explain.setVisibility(true);
      //   explain.setInformation(activeDrone, alerts[0].type, explainMessage, explainConfidence, 1);
      // }
      //}

    }
  }

  addPopups(): void {
    this.alerts.forEach((alertArray: object[], key: string) => {
      if (this.popupMap[key]) {
        this.popupMap[key].remove();
      }

      let drone = this.activeDrones.get(key);
      if (drone) {
        this.addExplainPopup(drone, alertArray);

      }
    });
  }

  closeExplain(index: number) {
    this.popupMap[this.explains[index].color].remove();
    this.explains[index] = new Explain(this.map);
  }

  closeAllExplain() {
    //this.popupMap[this.explains[0].color].remove();
    this.explains[0] = new Explain(this.map);


    //this.popupMap[this.explains[1].color].remove();
    this.explains[1] = new Explain(this.map);
  }
}
