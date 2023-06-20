import { Component, OnInit } from '@angular/core';
import { faMinus, faPlus, faMap, faBars } from '@fortawesome/free-solid-svg-icons';
import { DroneService } from '../services/drone-service/drone.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-virtual-drone-connections',
  templateUrl: './virtual-drone-connections.component.html',
  styleUrls: ['./virtual-drone-connections.component.less']
})
export class VirtualDroneConnectionsComponent implements OnInit {
  drones = new Array(8).fill(null);
  simulatorOptions = ['JMavSim', 'DroneSim', 'DroneSim2']
  selectedDrones = [];
  simulator: string;
  numDrones = 0;
  latitude: string;
  longitude: string;
  scatter = false;
  speedUp = false;

  menuVisible = false;
  menuIcon = faBars;
  minusIcon = faMinus;
  plusIcon = faPlus;
  geofenceIcon = faMap;

  constructor(private droneService: DroneService, private router: Router) { }

  ngOnInit(): void {
    for (let i of this.drones) {
      if (i) {
        this.selectedDrones.push(false);
      }
    }
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

  changeDrones(num: number): void {
    if (this.numDrones + num > 8 || this.numDrones + num < 0) {
      return;
    }
    this.numDrones += num;
  }

  showMap(): void {
    this.router.navigate(['/']);
  }

}
