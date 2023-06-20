import { Component, OnInit, Input } from '@angular/core';
import { Drone } from '../model/Drone';

@Component({
  selector: 'app-drone-arming-check',
  templateUrl: './drone-arming-check.component.html',
  styleUrls: ['./drone-arming-check.component.less']
})
export class DroneArmingCheckComponent implements OnInit {
  @Input() drone: any;
  @Input() status: object[];
  @Input() index: number;

  constructor() { }

  ngOnInit(): void {
  }

  connectionCheck(state: boolean): string {
    return state ? 'Connected' : 'Not Connected';
  }

  gpsCheck(type: number): string {
    let conditions = {
      0: 'No GPS connected',
      1: 'GPS is connected, no position information',
      2: '2D position',
      3: '3D position',
      4: 'DGPS/SBAS aided 3D position',
      5: 'RTK float, 3D position',
      6: 'RTX fixed, 3D position'
    };

    return conditions[type];
  }

  healthCheck(state: boolean): string {
    return state ? 'Ready' : 'Not calibrated/set-up correctly';
  }

  reversed(a: object[]): object[] {
    if (a) {
      return a.slice().reverse();
    }
  }

}
