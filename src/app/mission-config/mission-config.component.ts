import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-mission-config',
  templateUrl: './mission-config.component.html',
  styleUrls: ['./mission-config.component.less']
})
export class MissionConfigComponent implements OnInit {

  @Input() text: string;
  @Input() wordLimit: Number;
  showMore: Boolean;
  constructor() {
    this.showMore = false;
  }

  ngOnInit() {
  }

}
