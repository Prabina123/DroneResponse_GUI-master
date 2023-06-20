import { Component } from '@angular/core';
import { DroneService } from './services/drone-service/drone.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less'],
})
export class AppComponent {
  title = 'DroneResponse';

  constructor(public droneService: DroneService) {

  }

}
