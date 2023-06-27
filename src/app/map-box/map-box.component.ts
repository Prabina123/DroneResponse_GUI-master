import { Component, Input, OnInit, ViewEncapsulation } from "@angular/core";
import { environment } from "../../environments/environment";
import { MapService } from "../services/map.service";
import { default as roles } from "../utils/roles";
import * as mapboxgl from "mapbox-gl";
import * as MapboxDraw from "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw";
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
} from "@fortawesome/free-solid-svg-icons";
import { PolygonLayer } from "../map-layers/PolygonLayer";
import { IconLayer } from "../map-layers/IconLayer";
import { POILayer } from "../map-layers/POILayer";
import { DroneLayer } from "../map-layers/DroneLayer";
import { LayerName } from "../map-layers/CustomMapLayer";
import { Airmap } from "../map-layers/airmap";
import { AirmapService } from "../services/airmap-service/airmap-service";
import { DroneService } from "../services/drone-service/drone.service";
import { Explain } from "../map-layers/DroneExplain";
import { FlightPathLayer } from "../map-layers/FlightPathLayer";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { DndDropEvent } from "ngx-drag-drop";
import { GlobalService } from "../services/global.service";
import {
  DragRegion,
  DragRoute,
  Drone,
  DroneDrag,
  DronePosition,
} from "../model/Drone";
import { Region } from "../model/Region";
import { IRoute } from "../model/Route";

@Component({
  selector: "map-box",
  providers: [MapService, AirmapService],
  templateUrl: "./map-box.component.html",
  styleUrls: ["./map-box.component.less"],
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
  style = "mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp";
  airmap: Airmap;
  explains: Explain[];
  counter = 0;
  styleName = "Satellite";
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
    type: <"FeatureCollection">"FeatureCollection",
    features: [],
  };

  // Drag and drop variables
  dragData: DroneDrag;

  // Array with available routes and set to track selected routes
  flightRoutes: IRoute[] = [];
  assignments: any = {};

  // Array with available regions and set to track selected regions
  assignedRegions: Map<string, string[]> = new Map<string, string[]>();
  regions: Region[] = [];
  regionNames: string[] = [];
  routeNumbers: Map<string, number> = new Map<string, number>();
  drones: DronePosition[] = [];

  constructor(
    private mapService: MapService,
    private droneService: DroneService,
    private airmapService: AirmapService,
    private _globalService: GlobalService
  ) {
    this.lat = environment.PEPPERMINT_LAT;
    this.lng = environment.PEPPERMINT_LONG;
  }

  ngOnInit(): void {
    this.initializeMap();

    this.currentRole =
      this?.roles && this?.roles?.find((e: any) => e.role.role_name);

    this._globalService.getDragData().subscribe((data: DroneDrag) => {
      // console.log(data);
      this.dragData = data;
    });
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

    // Listen for events
    this.map.on("zoom", () => {
      this.updateDragDropRegionsPosition();
      this.updateDragDropRoutesPosition();
    });
    this.map.on("move", () => {
      this.updateDragDropRegionsPosition();
      this.updateDragDropRoutesPosition();
    });
  }

  private showSearchBar(): void {
    this.geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
    });

    // Add the search bar to the top left
    this.map.addControl(this.geocoder, "top-left");

    // Fly to location that user has entered
    this.map.on("load", (e) => {
      this.geocoder.on("result", (ev: any) => {
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
    let trash = { name: "trash", icon: faTrashAlt, toggle: false };

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
      this.polygonLayer.Draw.changeMode("draw_polygon");
      this.toggleAllLayers("visible");
      this.map.on("draw.create", () => {
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
        this.map.off("touchstart", placeIcon);
        this.map.off("click", placeIcon);
        return;
      }
      // Toggle all layers to on
      this.toggleAllLayers("visible");

      // Determine action
      if (tool.name == LayerName.Point) {
        this.homeLayer.addIcon(tool.name, e);
      } else if (tool.name === LayerName.Home) {
        this.homeLayer.addIcon(tool.name, e);
      } else if (tool.name === LayerName.Truck) {
        this.truckLayer.addIcon(tool.name, e);
      } else if (tool.name === "trash") {
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
      this.toggleAllLayers("visible");
      this.map.on("touchstart", placeIcon);
      this.map.on("click", placeIcon);
    }
  }

  addLayerstoMap(): void {
    // Load drone, icon, and polygon layers on map load
    this.map.on("load", () => {
      // Add home layer
      this.homeLayer = new IconLayer(
        LayerName.Home,
        this.map,
        this.mapService,
        this.iconGeojson["home"],
        faHome
      );
      this.homeLayer.setVisibility("visible");

      // Add truck layer
      this.truckLayer = new IconLayer(
        LayerName.Truck,
        this.map,
        this.mapService,
        this.iconGeojson["truck"],
        faTruck
      );

      this.truckLayer.setVisibility("visible");

      // Add drone layer
      this.droneLayer = new DroneLayer(
        LayerName.Drone,
        this.map,
        this.iconGeojson["drone"],
        this.iconGeojson["heads"],
        faExpandArrowsAlt,
        this.droneService,
        false,
        this.explains
      );

      this.droneLayer.setVisibility("visible");

      // Add point of interest layer
      this.poiLayer = new POILayer(this.map, this.mapService, {
        type: <"FeatureCollection">"FeatureCollection",
        features: [],
      });

      this.poiLayer.setVisibility("visible");

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
    if (view === "visible") {
      view = "none";
    } else {
      view = "visible";
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
    this.map.once("styledata", () => {
      this.reloadLayers();
    });

    switch (style) {
      case "Satellite":
        this.styleName = "Satellite";
        this.map.setStyle("mapbox://styles/mprieto2/clgmduw4p000u01qtaa0a4rdp");
        break;
      case "Streets":
        this.styleName = "Streets";
        this.map.setStyle("mapbox://styles/mapbox/outdoors-v9");
      default:
        break;
    }

    this.lng = this.map.getCenter().lng;
    this.lat = this.map.getCenter().lat;
    this.zoom = this.map.getZoom();
  }

  onDragover(event: DragEvent) {
    // console.log("dragover", JSON.stringify(event, null, 2));
  }

  onDrop(event: DndDropEvent, region: Region) {
    // this.flightPathLayer.clearLayer();
    const drone: Drone = event.data?.drone ? event.data.drone : event.data;
    const droneId = drone.uavid;

    if (this.drones.findIndex((d) => d.uavid == drone.uavid) != -1) {
      return;
    }

    this.drones.push(drone);

    // Remove drone from route if it was assigned to one
    if (this.assignments[droneId]?.type === "route") {
      this.removeDroneFromRoute(droneId);
    }

    // Just for reference store region in routes
    this.assignments[droneId] = { id: region._id, type: "region" };

    // Add drone to assigned regions
    if (!this.assignedRegions[region._id]) {
      this.assignedRegions[region._id] = [droneId];
    } else {
      this.assignedRegions[region._id].push(droneId);
    }

    this.showAssignedRoutesAndRegionsOnMap();
  }

  onDroneDropOnRoute(event: DndDropEvent, route: IRoute) {
    // this.flightPathLayer.clearLayer();
    const drone: Drone = event.data?.drone ? event.data.drone : event.data;
    const droneId = drone.uavid;

    // Remove drone from any other route if it was assigned to one
    if (this.assignments[droneId]?.type === "route") {
      const routeId = this.assignments[droneId].id;
      this.removeDroneFromRoute(droneId);
    }

    // Remove drone from region if it was assigned to one
    if (this.assignments[droneId]?.type === "region") {
      const regionId = this.assignments[droneId].id;
      this.removeDroneFromRegion(regionId, droneId);
    }

    const updatedRoutes = this.dragData.routes.map(
      (dragRoute: DragRoute, index: number) => {
        if (dragRoute.sourceId === route.sourceID) {
          dragRoute.drone = drone;
        }
        return dragRoute;
      }
    );

    this.assignments[droneId] = { id: route.sourceID, type: "route" };

    this._globalService.setDragData({
      ...this.dragData,
      routes: updatedRoutes,
    });
  }

  removeDroneFromRegion(regionId: string, droneId: string) {
    const region = this.dragData.regions.find(
      (dragRegion: DragRegion) => dragRegion.data._id === regionId
    );
    const updatedRegions = this.dragData.regions.map(
      (dragRegion: DragRegion) => {
        if (dragRegion.data._id === regionId) {
          dragRegion.drones = dragRegion.drones.filter(
            (d: Drone) => d.uavid !== droneId
          );
        }
        return dragRegion;
      }
    );
    this._globalService.setDragData({
      ...this.dragData,
      regions: updatedRegions,
      isDragging: false,
    });
    this.assignedRegions[regionId] = this.assignedRegions?.[regionId]?.filter(
      (id) => id !== droneId
    );
    this.drones = this.drones.filter((drone: Drone) => drone.uavid !== droneId);

    if (!this.assignedRegions[regionId].length) {
      this.polygonLayer.clearMap();
      this.polygonLayer.showPolygonOnMap(
        region.data.layerGeojson,
        false,
        false,
        region.data.layerGeojson.features[0].id as string,
        region.data.name
      );
    }
    this.drones = this.drones.filter((drone: Drone) => drone.uavid !== droneId);
    this.showAssignedRoutesAndRegionsOnMap();
  }

  removeDroneFromRoute(droneId) {
    const updatedRoutes = this.dragData.routes.map((dragRoute: DragRoute) => {
      if (dragRoute.drone?.uavid === droneId) {
        dragRoute.drone = null;
      }
      return dragRoute;
    });

    this._globalService.setDragData({
      ...this.dragData,
      routes: updatedRoutes,
      isDragging: false,
    });
  }

  showAssignedRoutesAndRegionsOnMap(): void {
    // console.log(this.assignedRegions);
    // this.polygonLayer.clearMap();
    // this.flightPathLayer.clearLayer();
    for (const [regionId, assignedDrones] of Object.entries(
      this.assignedRegions
    ) as any) {
      if (assignedDrones.length) {
        const regions = this.dragData.regions.map(
          (region: DragRegion) => region.data
        );
        const region = regions.find((r: Region) => r._id == regionId);

        const coordinates = (
          region.layerGeojson.features[0].geometry as GeoJSON.Polygon
        ).coordinates;
        const regionDrones = this.drones.filter((drone) =>
          this.assignedRegions[region._id].includes(drone.uavid)
        );

        let regionPath = this.polygonLayer.findSearchAreaRoutes(
          coordinates,
          region.polygonNumber,
          regionDrones,
          region.altitude,
          region.speed
        );

        console.log({
          startingPoints: regionPath.startingPoints.length,
          totalDrone: this.drones.length,
          regionDrones: regionDrones.length,
        });
        // Add Drone Points to Drag Regions
        const dronePoints = regionPath.startingPoints.map(
          (point: any, index: number) => {
            const positionInPx = this.cordsToPixels(point);
            regionDrones[index].x = positionInPx.x;
            regionDrones[index].y = positionInPx.y;
            regionDrones[index].points = point;
            return positionInPx;
          }
        );
        // console.log('dronePoints', dronePoints);

        // Add stating points to this.dragData.regions where region id matches
        const updatedRegions = this.dragData.regions.map(
          (dragRegion: DragRegion, index: number) => {
            if (dragRegion.id === region._id) {
              console.log(
                "update region with points",
                dragRegion.name,
                dronePoints
              );
              dragRegion.startingPoints = dronePoints;
              dragRegion.drones = regionDrones;
            }
            return dragRegion;
          }
        );

        this._globalService.setDragData({
          ...this.dragData,
          regions: updatedRegions,
        });

        // for (let i = 0; i < regionPath.pathWaypoints.length; ++i) {
        //   let start = regionPath.pathWaypoints[i];
        //   this.routeNumbers.set(start.uavid, i + 1);
        // }

        this.mapService.updateRegion(region._id, region);
      }
    }
  }

  updateDragDropRegionsPosition(): void {
    if (!this.dragData?.regions?.length) return;

    const regions = this.dragData.regions.map((region: DragRegion) => {
      const polygonPoints: any = region.data.layerGeojson.features[0].geometry;
      const polygonCoordinates = polygonPoints.coordinates[0].map(
        (point: any) => {
          const cordsInPixels = this.cordsToPixels(point);
          return cordsInPixels;
        }
      );

      const xValues = polygonCoordinates
        .map((point: any) => point.x)
        .sort((a: any, b: any) => a - b);
      const yValues = polygonCoordinates
        .map((point: any) => point.y)
        .sort((a: any, b: any) => a - b);

      const drones = region?.drones?.map((drone: DronePosition) => {
        const cordsInPixels = this.cordsToPixels(drone.points);
        return { ...drone, x: cordsInPixels.x, y: cordsInPixels.y };
      });
      const dragRegion = {
        ...region,
        drones: drones,
        x: xValues.at(0),
        y: yValues.at(0),
        width: Math.abs(xValues.at(-1) - xValues.at(0)),
        height: Math.abs(yValues.at(-1) - yValues.at(0)),
      };
      return dragRegion;
    });
    this._globalService.setDragData({ ...this.dragData, regions: regions });
  }

  updateDragDropRoutesPosition(): void {
    if (!this.dragData?.routes?.length) return;

    const routes = this.dragData.routes.map((dragRoute: DragRoute) => {
      const route: IRoute = dragRoute.data;
      const coordinatesInPixels = route.pointData.map((point: any) => {
        const coordinates = point.geometry.coordinates;
        return this.map.project(coordinates);
      });

      const pointsWithAngles = coordinatesInPixels
        .map((point: any, index: number) => {
          const nextPoint = coordinatesInPixels[index + 1];
          if (!nextPoint) return;
          const distance = this.calculateDistance(nextPoint, point);
          const angle = this.calculateAngle(nextPoint, point);
          return {
            x: nextPoint.x,
            y: nextPoint.y + 6,
            angle,
            width: distance,
          };
        })
        .filter((point: any) => point);

      const _dragRoute: DragRoute = {
        ...dragRoute,
        points: pointsWithAngles,
        data: route,
      };
      return _dragRoute;
    });
    this._globalService.setDragData({ ...this.dragData, routes: routes });
  }

  /**
   * Calculates the distance between two points
   * @param point1 the first point
   * @param point2 the second point
   * @returns the distance between the two points
   */
  calculateDistance(point1: mapboxgl.Point, point2: mapboxgl.Point): number {
    const xDiff = point2.x - point1.x;
    const yDiff = point2.y - point1.y;
    return Math.sqrt(xDiff * xDiff + yDiff * yDiff);
  }

  /**
   * Calculates the angle between two points
   * @param point1 the first point
   * @param point2 the second point
   * @returns the angle between the two points
   */
  calculateAngle(point1: mapboxgl.Point, point2: mapboxgl.Point): number {
    const xDiff: number = point2.x - point1.x;
    const yDiff: number = point2.y - point1.y;
    return (Math.atan2(yDiff, xDiff) * 180) / Math.PI;
  }

  /**
   * Returns the pixel coordinates of the given
   * @param cords the coordinates to convert to pixels
   */
  cordsToPixels(cords: mapboxgl.LngLatLike): mapboxgl.Point {
    return this.map.project(cords);
  }

  /**
   * Called when a drone is dropped on trash can icon to remove it from the region or route
   * @param event the event that triggered the drop
   */
  onTrashDrop(event: DndDropEvent) {
    const { drone, type }: { drone: Drone; type: string } = event.data;
    if (type === "region") {
      const region: DragRegion = this.dragData.regions.find(
        (region: DragRegion) => {
          return region.drones.find((drone: DronePosition) => {
            return drone.uavid === drone.uavid;
          });
        }
      );
      this.removeDroneFromRegion(region.id, drone.uavid);
    }

    if (type === "route") {
      this.removeDroneFromRoute(drone.uavid);
    }
  }

  onDragStart(event: DragEvent) {
    console.log(event);
    this._globalService.setDragData({
      drone: null,
      isDragging: true,
    });
  }
  onDragEnd(event: DragEvent) {
    console.log(event);
    this._globalService.setDragData({
      drone: null,
      isDragging: false,
    });
  }
}
