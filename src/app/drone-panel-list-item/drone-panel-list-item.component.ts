// import { Component, Input, ViewEncapsulation } from '@angular/core';
// import { Drone } from '../model/Drone';
import { MapService } from 'src/app/services/map.service';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Drone, DroneDrag } from '../model/Drone';
import { faArrowsAltV, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons';
import { faArrowsAlt } from '@fortawesome/free-solid-svg-icons';
import { faBatteryEmpty, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters, faBatteryFull } from '@fortawesome/free-solid-svg-icons';
import { DndDropEvent } from 'ngx-drag-drop';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'app-drone-panel-list-item',
  templateUrl: './drone-panel-list-item.component.html',
  styleUrls: ['./drone-panel-list-item.component.less'],
  encapsulation: ViewEncapsulation.None
})
export class DronePanelListItemComponent implements OnInit {
  droneIcon = faArrowsAlt;
  speedIcon = faTachometerAlt;
  altitudeIcon = faArrowsAltV;

  dragData: DroneDrag;


  draggable = {
    // note that data is handled with JSON.stringify/JSON.parse
    // only set simple data or POJO's as methods will be lost
    data: "myDragData",
    effectAllowed: "all",
    disable: false,
    handle: true
  };

  @Input() drone: Drone;
  @Input() index: number;

  constructor(private mapService: MapService, private _globalService: GlobalService) { }
  ngOnInit(): void {

    this._globalService.getDragData().subscribe((data: DroneDrag) => {
      this.dragData = data
    });
  }


  get batteryIcon(): IconDefinition {
    /*
    Find the battery icon that is nearest to the battery level.

    For example, if the battery level is 26% then
      the distance from faBatteryFull is 74% because 100% - 26% = 76%
      the distance from faBatteryThreeQuarters is 49%
      the distance from faBatteryHalf is 24%
      the distance from faBatteryQuarter is 1%
      the distance from faBatteryEmpty is 26%
    therefore the icon returned in this case is faBatteryQuarter because 1% is the smallest distance 
    */
    let batteryLevel = this.drone.status.battery.level;
    let icons = [faBatteryEmpty, faBatteryQuarter, faBatteryHalf, faBatteryThreeQuarters, faBatteryFull];
    let levels = [0, .25, .5, .75, 1]
    let distance = levels.map((l) => {
      return Math.abs(batteryLevel - l)
    })

    let smallestDistanceIndex = 0;
    for (let i = 0; i < distance.length; ++i) {
      if (distance[i] < distance[smallestDistanceIndex]) {
        smallestDistanceIndex = i;
      }
    }

    return icons[smallestDistanceIndex];
  }

  get batteryStyleClasses(): string {
    let result = [];
    let batteryLevel = this.drone.status.battery.level;
    if (batteryLevel <= 0.25) {
      result.push('battery-low');
    }
    result.push('battery-icon');
    return result.join(' ');
  }

  get get_border_style(): string {
    return '2px solid ' + this.drone.uavid;
  }

  onDragEnd(event: DragEvent) {

    this._globalService.setDragData({
      drone: this.drone,
      isDragging: false
    })
    // console.log("drag ended", JSON.stringify(event, null, 2));
  }

  onDragStart(event: DragEvent) {
    this._globalService.setDragData({
      drone: this.drone,
      isDragging: true
    })
    // console.log("drag started", JSON.stringify(event, null, 2));
  }
}
