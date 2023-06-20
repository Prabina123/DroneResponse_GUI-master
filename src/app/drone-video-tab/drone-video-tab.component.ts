import { Component, OnInit } from '@angular/core';
import { DroneService } from '../services/drone-service/drone.service';
import { faAngleDoubleRight, faTimes } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { Drone } from '../model/Drone';

@Component({
  selector: 'app-drone-video-tab',
  templateUrl: './drone-video-tab.component.html',
  styleUrls: ['./drone-video-tab.component.less']
})
export class DroneVideoTabComponent implements OnInit {
  data: Drone[];
  arrowsIcon = faAngleDoubleRight;
  xIcon = faTimes;

  constructor(public droneService: DroneService,
    private router: Router) { }

  ngOnInit(): void {
    this.droneService.getActiveDrones().subscribe((value) => {
      this.data = Array.from(value.values());
    });
  }

  makeActive(index: number): void {
    this.droneService.setActiveTab(index);
  }

  showMap(): void {
    this.router.navigate(['/']);
  }

  closeTab(index: number): void {
    this.droneService.setVisibleTab(index, false);
    let visible = this.droneService.getFirstVisibleTab();
    if (visible < 0) {
      this.showMap();
    }
    else {
      this.droneService.setActiveTab(visible);
    }
  }

}
