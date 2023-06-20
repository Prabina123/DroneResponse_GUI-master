import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DroneService } from '../services/drone-service/drone.service';
import { faArrowsAlt, faArrowsAltV, faLocationArrow, faBatteryFull, faMap } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-drone-connections',
  templateUrl: './drone-connections.component.html',
  styleUrls: ['./drone-connections.component.less']
})
export class DroneConnectionsComponent implements OnInit {
  data = [];
  statuses: Map<string, object[]> = new Map();
  droneIcon = faArrowsAlt;
  batteryIcon = faBatteryFull;
  altitudeIcon = faArrowsAltV;
  longLatIcon = faLocationArrow;
  geofenceIcon = faMap;
  selectedIndex = 0;
  selectedDrones = [];

  constructor(private droneService: DroneService,
    private router: Router) { }

  ngOnInit(): void {
    this.droneService.loadDrones();
    this.droneService.getActiveDrones().subscribe((value) => {
      // Set data and selected drones on drone updates
      [this.data, this.selectedDrones] = this.droneService.setActiveDroneData(value, this.selectedDrones);
    });

    this.droneService.getArmingStatus().subscribe((value) => {
      this.statuses = value;
    });
  }

  showDrone(index: number): void {
    this.selectedIndex = index;
  }

  toggleCheckbox(index: number): void {
    this.selectedDrones[index] = !this.selectedDrones[index];
  }

  selectAll(): void {
    for (let i = 0; i < this.selectedDrones.length; ++i) {
      this.selectedDrones[i] = true;
    }
  }

  clearAll(): void {
    for (let i = 0; i < this.selectedDrones.length; ++i) {
      this.selectedDrones[i] = false;
    }
  }

  sendCommand(cmd: string): void {
    let drones = [];
    for (let i = 0; i < this.selectedDrones.length; ++i) {
      if (this.selectedDrones[i]) {
        drones.push(this.data[i].uavid);
      }
    }
    if (drones.length > 0) {
      this.droneService.sendCommandToServer(cmd, drones);
    }
    this.clearAll();
  }

  setGeoFence(): void {
    let drones = [];
    for (let i = 0; i < this.selectedDrones.length; ++i) {
      if (this.selectedDrones[i]) {
        drones.push(this.data[i].uavid);
      }
    }
    if (drones.length > 0) {
      this.droneService.setGeoFenceDrones(drones);
      this.router.navigate(['/geofence']);
    }
  }

  showMap(): void {
    this.router.navigate(['/']);
  }
}
