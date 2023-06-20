import { Component, OnInit, OnDestroy } from '@angular/core';
import { MapService } from '../services/map.service';
import { GraphvizFunctionsService } from '../services/graphviz-service/graphviz-functions.service';
import {
  GraphvizParseDataService,
  MissionType,
  RootObject,
  grouping,
} from '../services/graphviz-service/graphviz-parse-data.service';
import data3 from './JSONS/delivery.json';
import data2 from './JSONS/birds_eye_surveillance.json';
import data from './JSONS/search_and_detect.json';
import data4 from './JSONS/Test-1.json';
import { DroneService } from '../services/drone-service/drone.service';
import { Subscription } from 'rxjs';
declare var d3: any;

@Component({
  selector: 'app-mission-status',
  templateUrl: './mission-status.component.html',
  styleUrls: ['./mission-status.component.less'],
})
export class MissionStatusComponent implements OnInit, OnDestroy {
  graphString: string;
  root: RootObject;
  groupings: Map<string, grouping>;

  mission: string;
  missionList: string[];
  obs: Subscription;
  options = [];
  mission_types: MissionType[];

  constructor(
    private graphvizParseDataService: GraphvizParseDataService,
    private graphvizFunctionService: GraphvizFunctionsService,
    private mapService: MapService,
    private droneService: DroneService
  ) { }

  ngOnInit() {
    let firstTime = this.graphvizParseDataService.getFirstTime();
    if (firstTime) {
      this.graphvizParseDataService.setFirstTime(false);
      this.root = JSON.parse(this.mapService.get_mission_data());

      this.root.mission_types = [];
      this.root.mission_roles.forEach((role) => {
        switch (role['role']) {
          case 'search_and_detect':
            this.root.mission_types.push(data);
            break;
          case 'birds_eye_surveillance':
            this.root.mission_types.push(data2);
            break;
          case 'delivery':
            this.root.mission_types.push(data3);
            break;
          case 'test_role':
            this.root.mission_types.push(data4);
            break;
        }
      });
      this.graphvizParseDataService.parseJSON(this.root);
      this.initGraph();
    }

    this.obs = this.droneService.new_mission.subscribe((data: any) => {
      // to account for split up json files, assumes mission.json is sent first
      if (data.mission) {
        this.root = data;
        this.root.mission_types = [];
      } else {
        this.root.mission_types.push(data);
        if (this.root.mission_types.length === this.root.mission_roles.length) {
          this.graphvizParseDataService.parseJSON(this.root);
          this.initGraph();
        }
      }
    });
    this.initGraph();
  }

  ngOnDestroy() {
    this.obs.unsubscribe();
  }

  initGraph() {
    this.groupings = this.graphvizParseDataService.getGroupViewList();
    this.missionList = this.graphvizParseDataService.getMissionList();
    this.mission_types = this.graphvizParseDataService.getMissionTypes();
    if (!this.mission) this.mission = this.missionList[0];
    this.renderGraph();
  }

  renderGraph() {
    this.graphString = this.graphvizFunctionService.buildGraphString(
      this.mission,
      this.mission_types
    );
    var t = d3.transition().duration(750).ease(d3.easeLinear);
    let graphCoordinates = d3
      .select('#graph2')
      .graphviz()
      .transition(t)
      .renderDot(this.graphString, () => {
        this.graphvizFunctionService.parseCoordinates(
          graphCoordinates._dictionary,
          this.mission,
          this.graphvizParseDataService.states
        );
        let max_height = 0;
        this.groupings.forEach((group) => {
          if (group.view === true) {
            max_height =
              max_height <
                graphCoordinates._dictionary[
                  `svg-0.G.cluster_${group.name}.path-0`
                ].bbox.height
                ? graphCoordinates._dictionary[
                  `svg-0.G.cluster_${group.name}.path-0`
                ].bbox.height
                : max_height;
          }
        });
        this.graphvizFunctionService.sendOffsets(max_height);
      })
      .width(1700)
      .height(800)
      .fit(false)
      .zoom(false);

    return 'done';
  }

  onMissionSelect(message: any) {
    this.mission = message.target.value;
    this.renderGraph();
  }
}
