import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import * as mapboxgl from 'mapbox-gl';
import { MapNodeService } from './map-node-service/map-node.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { GraphvizParseDataService } from './graphviz-service/graphviz-parse-data.service';
import { events } from '../utils/events';
import { FeatureCollection, Geometry } from 'geojson';
import { Region } from '../model/Region';
import { IRoute } from '../model/Route';
import { DroneDrag } from '../model/Drone';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  private MapNodeConnectionService: MapNodeService;
  private graphvizParseDataService: GraphvizParseDataService;
  private mapData: BehaviorSubject<any>;
  private layerGeojsonData: BehaviorSubject<any>;
  private flightPathData: BehaviorSubject<IRoute[]>;
  private regionsData: BehaviorSubject<Region[]>;
  private weatherData: BehaviorSubject<any>;
  private poiData: BehaviorSubject<any>;
  private poi: BehaviorSubject<any>;
  private mission_data: any;
  private dragData: BehaviorSubject<boolean>;

  constructor(
    mapNodeService: MapNodeService,
    graphvizParseDataService: GraphvizParseDataService
  ) {
    (mapboxgl as any).accessToken = environment.mapbox.accessToken;
    this.MapNodeConnectionService = mapNodeService;
    this.graphvizParseDataService = graphvizParseDataService;
    this.mapData = new BehaviorSubject<any>({});
    this.layerGeojsonData = new BehaviorSubject<any>({});
    this.flightPathData = new BehaviorSubject<IRoute[]>([]);
    this.weatherData = new BehaviorSubject<any>({});
    this.regionsData = new BehaviorSubject<Region[]>([]);
    this.poiData = new BehaviorSubject<any>({});
    this.poi = new BehaviorSubject<any>({});
    //............................
    this.dragData = new BehaviorSubject<boolean>(false); 
    this.onNewUser();
    this.onDrawingObject();
    this.onWeatherChange();

    // Flight path server methods
    this.onSyncFlightData();
    this.onFlightPathDrawn();
    this.onFlightPathRemoved();

    this.syncRegions();
    this.getRegions();

    this.syncAllPOI();
    this.onNewPoi();
  }

  private setMapData(newMapData: any) {
    this.mapData.next(newMapData);
  }

  public getMapData(): Observable<any> {
    return this.mapData.asObservable();
  }

  onNewUser(): void {
    this.MapNodeConnectionService.socket.on(events.MAP_NEW_USER, (data: any) => {
      this.setMapData(data);
    });
  }

  reloadMap(): void {
    this.MapNodeConnectionService.socket.emit(events.ON_MAP_LOAD);
  }

  private setLayerGeojson(data: any): void {
    this.layerGeojsonData.next(data);
  }

  public getLayerGeojsonData(): Observable<any> {
    return this.layerGeojsonData.asObservable();
  }

  onDrawingObject(): void {
    this.MapNodeConnectionService.socket.on(events.MAP_DRAW_OBJECTS, (data: any) => {
      this.setLayerGeojson(data);
    });
  }

  createObject(name: string, data: FeatureCollection<Geometry, { [name: string]: any; }>): void {
    this.MapNodeConnectionService.socket.emit(events.ON_MAP_CREATION, {
      layer: name,
      geojson: data,
    });
  }

  private setFlightPathData(newFlightData: IRoute[]): void {
    this.flightPathData.next(newFlightData);
  }

  public getFlightPathData(): Observable<IRoute[]> {
    return this.flightPathData.asObservable();
  }

  onSyncFlightData(): void {
    this.MapNodeConnectionService.socket.on(events.FLIGHT_ROUTE_NEW_USER, (data: IRoute[]) => {
      this.setFlightPathData(data);
    });
  }

  onFlightPathDrawn(): void {
    this.MapNodeConnectionService.socket.on(events.FLIGHT_ROUTE_DRAW, (data: IRoute[]) => {
      this.setFlightPathData(data);
    });
  }

  onFlightPathRemoved(): void {
    this.MapNodeConnectionService.socket.on(events.FLIGHT_ROUTE_REMOVED, (data: IRoute[]) => {
      this.setFlightPathData(data);
    });
  }

  updateRouteList(route: IRoute): void {
    this.MapNodeConnectionService.socket.emit(events.FLIGHT_ROUTE_UPDATE, route);
  }

  createFlightRoute(id: number, data: IRoute): void {
    this.MapNodeConnectionService.socket.emit(events.ON_FLIGHT_ROUTE_CREATED, {
      id: id,
      data: data,
    });
  }

  removeFlightRoute(id: number): void {
    this.MapNodeConnectionService.socket.emit(events.ON_FLIGHT_ROUTE_DELETED, id);
  }

  private setWeatherData(weatherData: any): void {
    this.weatherData.next(weatherData);
  }

  public getWeatherData(): Observable<any> {
    return this.weatherData.asObservable();
  }

  //...........................................
  public setDroneDragData(dragData: boolean): void {
    console.log('setDroneDragData:', dragData);
    return this.dragData.next(dragData);
  }

  public getDroneDragData(): Observable<boolean> {
    return this.dragData.asObservable();
  }
  //...........................................

  onWeatherChange(): void {
    this.MapNodeConnectionService.socket.on(events.WEATHER_CONDITION, (data: any) => {
      this.setWeatherData(data);
    });
  }

  private setRegionData(newRegionData: Region[]): void {
    this.regionsData.next(newRegionData);
  }

  public getRegionsData(): Observable<Region[]> {
    return this.regionsData.asObservable();
  }

  // saveRegion(data: Region): void {
  //   this.MapNodeConnectionService.socket.emit(events.SAVE_REGION, data);
  // }

  saveRegion(data: Region): Promise<any> {
    return new Promise((resolve, _) => {
      this.MapNodeConnectionService.socket.emit(events.SAVE_REGION, data, (response) => {
        resolve(response);
      });
    });
  }

  updateRegion(id: any, data: Region): void {
    this.MapNodeConnectionService.socket.emit(events.UPDATE_REGION, {
      id,
      data,
    });
  }

  syncRegions(): void {
    this.MapNodeConnectionService.socket.on(events.DRAW_REGIONS, (data: Region[]) => {
      this.setRegionData(data);
    });
  }

  getRegions(): void {
    this.MapNodeConnectionService.socket.emit(events.GET_REGIONS);
  }

  deleteRegion(id: number): Promise<any> {
    return new Promise((resolve, _) => {
      this.MapNodeConnectionService.socket.emit(events.DELETE_REGION, id, (cb: any) => {
        resolve(id);
      });
    });
  }

  private setPoiData(poidata: any): void {
    this.poiData.next(poidata);
  }

  private setNewPoi(poi: any): void {
    this.poi.next(poi);
  }

  public getPoi(): Observable<any> {
    return this.poi.asObservable();
  }

  public getPoiData(): Observable<any> {
    return this.poiData.asObservable();
  }

  onNewPoi(): void {
    this.MapNodeConnectionService.socket.on(events.SYNC_OBJECT, (data: any) => {
      this.setNewPoi(data);
    });
  }

  syncAllPOI(): void {
    this.MapNodeConnectionService.socket.on(events.SYNC_WORLD, (data: any) => {
      this.setPoiData(data);
    });
  }

  sendMission(data: string): void {
    this.mission_data = data;
    this.MapNodeConnectionService.socket.emit(events.ON_MISSION, data);
    this.graphvizParseDataService.setClickable();
  }

  get_mission_data(): any {
    return this.mission_data;
  }
}
