import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { events } from '../../utils/events';
import { Drone } from '../../model/Drone';
import { DroneNodeService } from './drone-node-service/drone-node.service';

@Injectable({
  providedIn: 'root'
})
export class DroneService {
  private activeDrones: BehaviorSubject<Map<string, Drone>>;
  private alerts: BehaviorSubject<Map<string, object[]>>;
  private armingStatus: BehaviorSubject<Map<string, object[]>>;
  private visibleTabs: boolean[] = [];
  private activeTab: number = 0;
  private geoFenceDrones = [];
  data: Map<string, Drone> = new Map();
  activeDroneData: Map<string, Drone> = new Map();
  droneAlerts: Map<string, object[]> = new Map();
  armingStatusData: Map<string, object[]> = new Map();
  droneNodeConnectionService: DroneNodeService;
  private ws: WebSocket;
  private closeAllExplainBox: boolean;

  new_mission = new EventEmitter<object>();
  drone_update = new EventEmitter<object>();
  state_changed = new EventEmitter<object>();

  constructor(droneNodeService: DroneNodeService) {
    this.activeDrones = new BehaviorSubject<Map<string, Drone>>(new Map());
    this.alerts = new BehaviorSubject<Map<string, object[]>>(new Map());
    this.armingStatus = new BehaviorSubject<Map<string, object[]>>(new Map());
    this.droneNodeConnectionService = droneNodeService;
    this.closeAllExplainBox = false;
    this.onNewActiveDroneUser();
    this.onNewActiveDrone();
    this.onRemoveActiveDrone();
    this.onAlert()
    this.onRemoveAlert();
    this.onArmingStatus();
    this.onStateChanged();
  }

  getExplainBoxState(): boolean {
    return this.closeAllExplainBox;
  }

  // Tab helper functions
  setTabsVisibility(): void {
    if (this.visibleTabs.length !== this.data.size) {
      this.visibleTabs = [];
      for (let i = 0; i < this.data.size; ++i) {
        this.visibleTabs.push(true);
      }
    }
  }

  setVisibleTab(index: number, bool: boolean): void {
    this.visibleTabs[index] = bool;
  }

  getTabVisibility(index: number): boolean {
    return this.visibleTabs[index];
  }

  getFirstVisibleTab(): number {
    return this.visibleTabs.indexOf(true);
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }

  getActiveTab(): number {
    return this.activeTab;
  }

  // Functions for selected drones for setting GeoFences
  getGeoFenceDrones(): number[] {
    return this.geoFenceDrones;
  }

  setGeoFenceDrones(value: number[]): void {
    this.geoFenceDrones = value;
  }

  // Python script drone functions
  loadDrones(): void {
    this.droneNodeConnectionService.socket.emit(events.DRONE_LOAD);
    this.droneNodeConnectionService.socket.emit(events.ON_LOAD_ARMING_STATUSES);
  }

  // WebSocket listeners for drones from python script
  onNewActiveDroneUser(): void {
    this.droneNodeConnectionService.socket.on(events.DRONE_UPDATE, (data: Object) => {
      for (let drone of Object.values(data)) {
        this.activeDroneData.set(drone.uavid, drone);
        this.setActiveDrones(this.activeDroneData);
      }
    });
  }

  onNewActiveDrone(): void {
    this.droneNodeConnectionService.socket.on(events.DRONE_ADD, (drone) => {
      this.activeDroneData.set(drone.uavid, drone);
      this.setActiveDrones(this.activeDroneData);
    });
  }

  onRemoveActiveDrone(): void {
    this.droneNodeConnectionService.socket.on(events.DRONE_REMOVE, (uavid) => {
      this.activeDroneData.delete(uavid);
      this.setActiveDrones(this.activeDroneData);
      this.armingStatusData.delete(uavid);
      this.setArmingStatus(this.armingStatusData);
    });
  }

  onStateChanged(): void {
    this.droneNodeConnectionService.socket.on(events.STATE_CHANGED, (data) => {
      this.state_changed.emit(data);
    })
  }

  setActiveDrones(newValue: any): void {
    this.activeDrones.next(newValue);
  }

  getActiveDrones(): Observable<Map<string, Drone>> {
    return this.activeDrones.asObservable();
  }

  // Sets data within observable on components
  setActiveDroneData(value: any, selectedDrones: any) {
    let data = Array.from(value.values());
    let selectedCopy = [...selectedDrones]
    selectedDrones = [];
    for (let i = 0; i < data.length; ++i) {
      if (i < selectedCopy.length) {
        selectedDrones.push(selectedCopy[i]);
      }
      else {
        selectedDrones.push(false);
      }
    }
    return [data, selectedDrones];
  }

  // Send commands to the Node.js server
  sendCommandToServer(cmd: string, drones: any[], data = undefined): void {
    let cmdData = {
      type: cmd,
      uavids: drones,
      info: data
    }
    this.droneNodeConnectionService.socket.emit(events.ON_DRONE_COMMAND, cmdData);
  }

  // Listener for alerts from Node.js server
  onAlert(): void {
    this.droneNodeConnectionService.socket.on(events.DRONE_SEND_ALERT, (data: any) => {
      if (this.droneAlerts.get(data.uavid)) {
        this.droneAlerts.get(data.uavid).push(data);
      }
      else {
        this.droneAlerts.set(data.uavid, [data]);
      }
      this.closeAllExplainBox = false;
      this.setAlerts(this.droneAlerts);
    });
  }

  onRemoveAlert(): void {
    this.droneNodeConnectionService.socket.on(events.DRONE_REMOVE_ALERT, (data: any) => {
      let currentAlerts = this.droneAlerts.get(data.uavid);
      for (let i = 0; i < currentAlerts.length; ++i) {
        if (currentAlerts[i]['type'] === data.type) {
          currentAlerts.splice(i, 1);
          break;
        }
      }
      this.closeAllExplainBox = true;
      this.setAlerts(this.droneAlerts);
    });
  }

  // Get/set alert observable
  getAlerts(): Observable<Map<string, object[]>> {
    return this.alerts.asObservable();
  }

  setAlerts(newValue: any): void {
    this.alerts.next(newValue);
  }

  onArmingStatus(): any {
    this.droneNodeConnectionService.socket.on(events.UPDATE_STATUS, (data: any) => {

      if (this.armingStatusData.get(data.uavid)) {
        this.armingStatusData.get(data.uavid).push(data.data);
      }
      else {
        this.armingStatusData.set(data.uavid, [data.data]);
      }
      this.setArmingStatus(this.armingStatusData);

    });
  }

  getArmingStatus(): Observable<Map<string, object[]>> {
    return this.armingStatus.asObservable();
  }

  setArmingStatus(newValue: any): void {
    this.armingStatus.next(newValue);
  }
}