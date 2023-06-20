import {
    Component,
    Input,
    OnInit,
    ViewEncapsulation,
  } from '@angular/core';
  import { environment } from '../../environments/environment';
  import { MapService } from '../services/map.service';
  import { default as roles } from '../utils/roles';
  import * as mapboxgl from 'mapbox-gl';
  import * as MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
  import {
    faExclamationTriangle,
    faPlane,
    faCircleNotch,
    faTruck,
    faMapMarkerAlt,
    faLayerGroup,
    faDrawPolygon,
    faTrashAlt,
    faExpandArrowsAlt,
    faInfoCircle,
    faThumbsUp,
    faBan,
    faCog,
    faHome,
  } from '@fortawesome/free-solid-svg-icons';
  import { PolygonLayer } from '../map-layers/PolygonLayer';
  import { IconLayer } from '../map-layers/IconLayer';
  import { POILayer } from '../map-layers/POILayer';
  import { DroneLayer } from '../map-layers/DroneLayer';
  import { LayerName } from '../map-layers/CustomMapLayer';
  import { Airmap } from '../map-layers/airmap';
  import { AirmapService } from '../services/airmap-service/airmap-service';
  import { DroneService } from '../services/drone-service/drone.service';
  import { Explain } from '../map-layers/DroneExplain';
  import { FlightPathLayer } from '../map-layers/FlightPathLayer';
  import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
//..........................................................
  import { DndDropEvent } from 'ngx-drag-drop';
  import { GlobalService } from '../services/global.service';
  import { DragRegion, Drone, DroneDrag, DronePosition  } from '../model/Drone';
  import { Region } from '../model/Region';
  import { IRoute } from '../model/Route';
  
  @Component({
    selector: 'map-box',
    providers: [MapService, AirmapService],
    templateUrl: './map-box.component.html',
    styleUrls: ['./map-box.component.less'],
    encapsulation: ViewEncapsulation.None,
  })
  export class MapBoxComponent implements OnInit {
    @Input() map: mapboxgl.Map;
    @Input() flightPathLayer: FlightPathLayer;
    @Input() polygonLayer: PolygonLayer;
    @Input() layers: any[];
    @Input() iconGeojson: any;
    @Input() mainScreen: boolean;
  
    roles = roles.roles;
    currentRole: any;
  
    // Default map settings
    mapboxDraw = new MapboxDraw();
    // style = 'mapbox://styles/mapbox/outdoors-v9';
    style = 'mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp';
    airmap: Airmap;
    explains: Explain[];
    counter = 0;
    styleName = 'Satellite'
    // styleName = 'Streets';
  
    geocoder: MapboxGeocoder;
    lat: number;
    lng: number;
    zoom: number = 16;
  
    toolbox = []; // Array to store all icons
  
    uavidArray = [];
  
    // Layers
    droneLayer: DroneLayer;
    homeLayer: IconLayer;
    pointLayer: IconLayer;
    truckLayer: IconLayer;
    poiLayer: POILayer;
    polygonTool: MapboxDraw; // Polygon tool for drawing
    flightPathTool: MapboxDraw;
  
    // Icons for collapse bars in HTML
    layerIcon = faLayerGroup;
    editIcon = faMapMarkerAlt;
    alertIcon = faExclamationTriangle;
  
    airplaneIcon = faPlane;
    circleIcon = faCircleNotch;
    infoIcon = faInfoCircle;
    rewardIcon = faThumbsUp;
    suspendIcon = faBan;
    configureIcon = faCog;
  
    // GeoJSON creation
    geojson = {
      type: <'FeatureCollection'>'FeatureCollection',
      features: [],
    };

    //start.............................................
    // Drag and drop variables
    dragData: DroneDrag

    // Array with available routes and set to track selected routes
    flightRoutes: IRoute[] = [];
    assignments: any = {};


    // Array with available regions and set to track selected regions
    assignedRegions: Map<string, string[]> = new Map<string, string[]>();
    regions: Region[] = [];
    regionNames: string[] = [];
    routeNumbers: Map<string, number> = new Map<string, number>();
    // drones: Drone[] = [];
    drones: DronePosition[] = [];

    //end.............................................
  
    constructor(
      private mapService: MapService,
      private droneService: DroneService,
      private airmapService: AirmapService,
      //.............................................
      private _globalService: GlobalService,
    ) {
      this.lat = environment.PEPPERMINT_LAT;
      this.lng = environment.PEPPERMINT_LONG;
    }
  
    ngOnInit(): void {
      this.initializeMap();
  
      this.currentRole = this?.roles && this?.roles?.find((e: any) => e.role.role_name);

      //..............................................
      this._globalService.getDragData().subscribe((data: DroneDrag) => {
        console.log(data);
        this.dragData = data
      });
      //..............................................
    }
  
    private initializeMap(isAfterSwitchingStyle = false): void {
      // Load the toolbox for icon placement
      this.loadToolBox();
      this.explains = [new Explain(this.map), new Explain(this.map)];
  
      if (!isAfterSwitchingStyle) {
        this.setMapCenter();
        this.showSearchBar(); // Create 'fly to search' search bar
  
      }
      this.addLayerstoMap();
  
      // Create airmap and pass MAP and AIRMAP SERVICE
      this.airmap = new Airmap(this.map, this.airmapService);
      //start.......................................................
      // Listen for events
      this.map.on('zoom', () => this.updateDragDropRegionsPosition());
      this.map.on('move', () => this.updateDragDropRegionsPosition());
      //end.......................................................
    }
  
    private showSearchBar(): void {
      this.geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
      });
  
      // Add the search bar to the top left
      this.map.addControl(this.geocoder, 'top-left');
  
      // Fly to location that user has entered
      this.map.on('load', (e) => {
        this.geocoder.on('result', (ev: any) => {
          // Store the return search result location
          const searchResult = ev.result.geometry;
          // Center on the search result location (lng, lat)
          this.map.flyTo({
            center: [searchResult.coordinates[0], searchResult.coordinates[1]],
          });
        });
      });
    }
  
    private setMapCenter(): void {
      // Only center map on user location in production
      if (environment.production) {
        /// find the current location of the user
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
  
            // set the location of the user as the center of the map
            this.map.flyTo({
              center: [this.lng, this.lat],
            });
          });
        }
      }
    }
  
    loadToolBox(): void {
      // Create icon objects and set their attributes
      let polygon = {
        name: LayerName.Polygon,
        icon: faDrawPolygon,
        toggle: false,
      };
      let home = { name: LayerName.Home, icon: faHome, toggle: false };
      let truck = { name: LayerName.Truck, icon: faTruck, toggle: false };
      let trash = { name: 'trash', icon: faTrashAlt, toggle: false };
  
      //Add icons to toolbox
      this.toolbox = [];
      // this.toolbox.push(polygon);
      this.toolbox.push(home);
      this.toolbox.push(truck);
      this.toolbox.push(trash);
    }
  
    toolRouter(tool: any): void {
      // Toggle all to in-active except current one clicked
      for (let el of this.toolbox) {
        if (el.name === tool.name) {
          continue;
        }
        el.toggle = false;
      }
      // Toggle current icon
      tool.toggle = !tool.toggle;
      // Decide what action to perform
      if (tool.name === LayerName.Polygon) {
        // Draw the polygon
        this.polygonLayer.Draw.changeMode('draw_polygon');
        this.toggleAllLayers('visible');
        this.map.on('draw.create', () => {
          tool.toggle = false;
        });
      } else {
        // Place/delete an icon
        this.toolAction(tool);
      }
    }
  
    toolAction(tool: any): void {
      const placeIcon = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
        // Turn OFF the listeners if button is IN-ACTIVE
        if (!tool.toggle) {
          this.map.off('touchstart', placeIcon);
          this.map.off('click', placeIcon);
          return;
        }
        // Toggle all layers to on
        this.toggleAllLayers('visible');
  
        // Determine action
        if (tool.name == LayerName.Point) {
          this.homeLayer.addIcon(tool.name, e);
        } else if (tool.name === LayerName.Home) {
          this.homeLayer.addIcon(tool.name, e);
        } else if (tool.name === LayerName.Truck) {
          this.truckLayer.addIcon(tool.name, e);
        } else if (tool.name === 'trash') {
          if (
            this.map.queryRenderedFeatures(e.point)[0].layer.id ===
            LayerName.Polygon
          ) {
            this.polygonLayer.deletePolygon(e);
          } else if (
            this.map.queryRenderedFeatures(e.point)[0].layer.id === LayerName.Home
          ) {
            this.homeLayer.deleteIcon(e);
          } else if (
            this.map.queryRenderedFeatures(e.point)[0].layer.id ===
            LayerName.Truck
          ) {
            this.truckLayer.deleteIcon(e);
          }
        }
      };
  
      // Turn ON listeners if button is ACTIVE
      if (tool.toggle) {
        this.toggleAllLayers('visible');
        this.map.on('touchstart', placeIcon);
        this.map.on('click', placeIcon);
      }
    }
  
    addLayerstoMap(): void {
      // Load drone, icon, and polygon layers on map load
      this.map.on('load', () => {
        // Add home layer
        this.homeLayer = new IconLayer(
          LayerName.Home,
          this.map,
          this.mapService,
          this.iconGeojson['home'],
          faHome
        );
        this.homeLayer.setVisibility('visible');
  
        // Add truck layer
        this.truckLayer = new IconLayer(
          LayerName.Truck,
          this.map,
          this.mapService,
          this.iconGeojson['truck'],
          faTruck
        );
  
        this.truckLayer.setVisibility('visible');
  
        // Add drone layer
        this.droneLayer = new DroneLayer(
          LayerName.Drone,
          this.map,
          this.iconGeojson['drone'],
          this.iconGeojson['heads'],
          faExpandArrowsAlt,
          this.droneService,
          false,
          this.explains
        );
  
        this.droneLayer.setVisibility('visible');
  
        // Add point of interest layer
        this.poiLayer = new POILayer(
          this.map,
          this.mapService,
          {
            type: <'FeatureCollection'>'FeatureCollection',
            features: [],
          }
        );
  
        this.poiLayer.setVisibility('visible');
  
        // Add layers to layer array
        this.layers.push(this.homeLayer);
        this.layers.push(this.truckLayer);
        this.layers.push(this.droneLayer);
        // this.layers.push(this.flightPathLayer);
        // this.layers.push(this.poiLayer);
      });
    }
  
    toggleAllLayers(view: string): void {
      // Do the opposite of the input
      if (view === 'visible') {
        view = 'none';
      } else {
        view = 'visible';
      }
  
      for (let layer of this.layers) {
        layer.setVisibility(view);
        layer.toggleLayer();
      }
    }
  
    reloadLayers(): void {
      this.polygonLayer.loadLayer();
      this.homeLayer.loadLayer();
      this.truckLayer.loadLayer();
      this.droneLayer.loadLayer();
      this.flightPathLayer.loadLayer();
    }
  
    switchMaplayerStyle(style: string): void {
      if (style == this.styleName) {
        return;
      }
      this.map.once('styledata', () => {
        this.reloadLayers();
      });
  
      switch (style) {
        case 'Satellite':
          this.styleName = 'Satellite';
          this.map.setStyle('mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp');
          break;
        case 'Streets':
          this.styleName = 'Streets';
          this.map.setStyle('mapbox://styles/mapbox/outdoors-v9');
        default:
          break;
      }
  
      this.lng = this.map.getCenter().lng;
      this.lat = this.map.getCenter().lat;
      this.zoom = this.map.getZoom();
    }

    //start.......................................................
    onDragover(event: DragEvent) {


    // console.log("dragover", JSON.stringify(event, null, 2));
    }

  onDrop(event: DndDropEvent, region: Region) {
    this.flightPathLayer.clearLayer();
    const drone = event.data as Drone;
    const droneId = drone.uavid;


    // Check if drone is already assigned to region
    // if (this.assignedRegions?.[region._id]?.includes(droneId)) {
    //   return;
    // }

    if (this.drones.findIndex(d => d.uavid == drone.uavid) != -1) {
      return;
    }

    this.drones.push(drone);


    // Just for reference store region in routes
    this.assignments[droneId] = { 'id': region._id, 'type': 'region' };

    // Add drone to assigned regions
    if (!this.assignedRegions[region._id]) {
      this.assignedRegions[region._id] = [droneId];
    } else {
      this.assignedRegions[region._id].push(droneId);
    }

    this.showAssignedRoutesAndRegionsOnMap();
  }


  showAssignedRoutesAndRegionsOnMap(): void {
    // console.log(this.assignedRegions);
    // this.polygonLayer.clearMap();
    // this.flightPathLayer.clearLayer();
    for (const [regionId, assignedDrones] of Object.entries(
      this.assignedRegions
    ) as any) {
      if (assignedDrones.length) {
        const regions = this.dragData.regions.map((region: DragRegion) => region.data)
        // console.log(regionId);
        const region = regions.find((r: Region) => r._id == regionId);
        // this.polygonLayer.showPolygonOnMap(
        //   region.layerGeojson,
        //   region.searchGeojson,
        //   region.startingPoints,
        //   region.layerGeojson.features[0].id as string,
        //   region.name
        // );

        const coordinates = (region.layerGeojson.features[0].geometry as GeoJSON.Polygon).coordinates;
        const regionDrones = this.drones.filter(drone => this.assignedRegions[region._id].includes(drone.uavid));
        // console.log(regionDrones);
        let regionPath = this.polygonLayer.findSearchAreaRoutes(coordinates, region.polygonNumber, regionDrones, region.altitude, region.speed);
        // console.log(regionPath);
        
        // <!---------------------------------------------------------->
        console.log({ startingPoints: regionPath.startingPoints.length, totalDrone: this.drones.length, regionDrones: regionDrones.length });
        // Add Drone Points to Drag Regions
        const dronePoints = regionPath.startingPoints.map((point: any, index: number) => {
          const positionInPx = this.cordsToPixels(point);
          // this.drones[index].x = positionInPx.x;
          // this.drones[index].y = positionInPx.y;
          // this.drones[index].points = point;
          regionDrones[index].x = positionInPx.x;
          regionDrones[index].y = positionInPx.y;
          regionDrones[index].points = point;
          return positionInPx
        });

        // Add stating points to this.dragData.regions where region id matches
        const updatedRegions = this.dragData.regions.map((dragRegion: DragRegion, index: number) => {
          if (dragRegion.id === region._id) {
            console.log('update region with points', dragRegion.name, dronePoints);
            dragRegion.startingPoints = dronePoints;
            dragRegion.drones = regionDrones;
          }
          return dragRegion;
        })

        this._globalService.setDragData({ ...this.dragData, regions: updatedRegions })


        // <!---------------------------------------------------------->

        // for (let i = 0; i < regionPath.pathWaypoints.length; ++i) {
        //   let start = regionPath.pathWaypoints[i];
        //   this.routeNumbers.set(start.uavid, i + 1);
        // }
        this.mapService.updateRegion(
          region._id,
          region
        );
      }
    }
  };
  //end.........................................................
  updateDragDropRegionsPosition(): void {
    if (!this.dragData?.regions?.length) return;
    const regions = this.dragData.regions.map((region: DragRegion) => {
      const polygonPoints: any = region.data.layerGeojson.features[0].geometry
      const polygonCoordinates = polygonPoints.coordinates[0].map((point: any) => {
        const cordsInPixels = this.cordsToPixels(point)
        return cordsInPixels;
      }
      );

      const xValues = polygonCoordinates.map((point: any) => point.x).sort((a: any, b: any) => a - b);
      const yValues = polygonCoordinates.map((point: any) => point.y).sort((a: any, b: any) => a - b);

      const drones = region?.drones?.map((drone: DronePosition) => {
        const cordsInPixels = this.cordsToPixels(drone.points);
        return { ...drone, x: cordsInPixels.x, y: cordsInPixels.y }
      })
      const dragRegion = {
        ...region,
        drones: drones,
        x: xValues.at(0),
        y: yValues.at(0),
        width: Math.abs(xValues.at(-1) - xValues.at(0)),
        height: Math.abs(yValues.at(-1) - yValues.at(0)),
      }
      return dragRegion;
    })
    this._globalService.setDragData({ ...this.dragData, regions: regions })
  }

  cordsToPixels(cords: mapboxgl.LngLatLike): mapboxgl.Point {
    return this.map.project(cords);
  }

  onTrashDrop(event: DndDropEvent) {
    const data: { drone: DronePosition, region: DragRegion } = event.data

    // Remove drone from region
    const regions = this.dragData.regions.map((region: DragRegion) => {
      if (region.id === data.region.id) {
        region.drones = region.drones.filter((drone: Drone) => drone.uavid !== data.drone.uavid)
      }
      return region;
    })

    // remove from assigned regions
    this.assignedRegions[data.region.id] = this.assignedRegions?.[data.region.id]?.filter(id => id !== data.drone.uavid)

    this.drones = this.drones.filter((drone: Drone) => drone.uavid !== data.drone.uavid)


    if (!this.assignedRegions[data.region.id].length) {
      console.log("empty");
      this.polygonLayer.clearMap();
      this.polygonLayer.showPolygonOnMap(
        data.region.data.layerGeojson,
        false,
        false,
        data.region.data.layerGeojson.features[0].id as string,
        data.region.data.name
      );
    }

    this.showAssignedRoutesAndRegionsOnMap()
    this._globalService.setDragData({ regions: regions })
    console.log('onTrashDrop', data);
  }
}

// <!........................................................>