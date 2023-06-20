import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { DroneService } from 'src/app/services/drone-service/drone.service';
import { GraphvizFunctionsService } from 'src/app/services/graphviz-service/graphviz-functions.service';
import { GraphvizParseDataService } from 'src/app/services/graphviz-service/graphviz-parse-data.service';

declare var d3: any;

@Component({
  selector: 'app-drones',
  templateUrl: './drones.component.html',
  styleUrls: ['./drones.component.less']
})
export class DronesComponent implements OnInit, OnDestroy {
  drones: Map<string, string[]> = this.graphvizParseDataService.mission_drones;
  droneList: string[] = this.graphvizParseDataService.droneList;
  mission: string = this.graphvizParseDataService.mission_list[0];
  leftOffset: number = 8.5;
  topOffset: number = 428;
  droneSize: number = .2;

  obs: Subscription;
  obs1: Subscription;
  obs2: Subscription;
  obs3: Subscription;

  constructor(
    private graphvizParseDataService: GraphvizParseDataService,
    private graphvizFunctionService: GraphvizFunctionsService,
    private droneService: DroneService) { }

  ngOnInit() {
    if (this.droneList.length > 5) {
      this.droneSize -= .03 * (this.droneList.length - 5)
    }

    this.obs = this.graphvizFunctionService.coords_changed.subscribe((max_height: number) => {
      this.topOffset = 428 + max_height - 416.8 + 30
    })
    this.obs1 = this.graphvizFunctionService.render_drones.subscribe((mission: string) => {
      this.mission = mission

      this.droneList.forEach(drone => {
        this.renderDrones(drone, 'transparent', 'transparent')
      })

      let states = this.graphvizParseDataService.getStates();
      states.forEach(node => {
        console.log(node)
        console.log(node.group)
        if (this.graphvizParseDataService.groupView.get(node.group).view && (node.mission.has(this.mission) || this.mission === 'merge missions')) {
          // if (this.graphvizParseDataService.groupView[states[node].group].view  && (states[node].mission.has(this.mission) || this.mission==='merge missions')) {
          Object.keys(node.drones).forEach(drone => {
            if (node.drones[drone].mission === this.mission || this.mission === 'merge missions') {
              this.renderDrones(drone, drone, 'black')
            }
          })
        }
      })
    })

    this.obs2 = this.droneService.state_changed.subscribe(data => {
      this.graphvizParseDataService.moveDrone(data['uavid'], data['state'])
    })

    this.obs3 = this.graphvizParseDataService.drone_moved.subscribe(drone => {
      let states = this.graphvizParseDataService.getStates();
      if ((states.get(drone[1]).drones[drone[0].mission] === this.mission || this.mission === 'merge missions') && this.graphvizParseDataService.groupView.get(states.get(drone[1]).group).view === true) {
        this.renderDrones(drone[0].name, drone[0].name, 'black');
      }
    });
  }

  ngOnDestroy() {
    this.obs.unsubscribe();
    this.obs1.unsubscribe();
    this.obs2.unsubscribe();
    this.obs3.unsubscribe();
  }

  renderDrones(drone: string, color: string, outline: string) {
    var t = d3.transition()
      .duration(750)
      .ease(d3.easeLinear);

    d3.select(`#${drone}`)
      .graphviz()
      .renderDot(`digraph G {
      bgcolor=none
      drone [shape=circle, style="filled,solid" fillcolor=${color}, color=${outline}, label="", fixedsize=true, height=${this.droneSize}, width=${this.droneSize}]
    }`)
      .zoom(false)
  }

  getLeft(drone: string) {
    let curr_state = this.graphvizParseDataService.getDroneState(drone)
    //console.log(this.leftOffset + this.graphvizParseDataService.states.get(curr_state).x + (this.graphvizParseDataService.states.get(curr_state).drones[drone].index * this.graphvizParseDataService.states.get(curr_state)['width']/(1+this.droneList.length)))
    return this.leftOffset + this.graphvizParseDataService.states.get(curr_state).x + (this.graphvizParseDataService.states.get(curr_state).drones[drone].index * this.graphvizParseDataService.states.get(curr_state)['width'] / (1 + this.droneList.length))
  }

  getTop(drone: string) {
    let curr_state = this.graphvizParseDataService.getDroneState(drone)
    return this.topOffset + this.graphvizFunctionService.states.get(curr_state)['y']
  }
}