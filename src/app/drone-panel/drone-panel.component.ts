import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DroneService } from '../services/drone-service/drone.service';
import { MapService } from '../services/map.service';
import { Drone } from '../model/Drone';
import { DndDropEvent } from 'ngx-drag-drop';

@Component({
  selector: 'app-drone-panel',
  templateUrl: './drone-panel.component.html',
  styleUrls: ['./drone-panel.component.less'],
  providers: [MapService],
})
export class DronePanelComponent implements OnChanges {
  @Input() drones: Drone[] = [];

  numDrones: number[] = [];

  constructor(
    public droneService: DroneService,
    public mapService: MapService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    let length = changes.drones.currentValue.length;
    if (this.numDrones.length != length) {
      this.numDrones = Array(length).fill(0).map((x, i) => i);
    }
  }
}
