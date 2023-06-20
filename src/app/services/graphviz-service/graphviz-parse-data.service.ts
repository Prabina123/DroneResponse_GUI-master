import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GraphvizParseDataService {
  render_graph = new EventEmitter<object>();
  drone_moved = new EventEmitter<any[]>();

  groupView: Map<string, grouping> = new Map();
  mission_drones: Map<string, string[]> = new Map();
  drone_states: Map<string, string> = new Map();
  transitions: Map<string, Transition[]> = new Map();
  states: Map<string, State> = new Map();
  mission_list: string[] = [];
  droneList: string[] = []
  mission_types: MissionType[];
  drone_index: number = 1;
  fake_trans_index: number
  firstTime: boolean = true
  clickable: boolean = true;
  first_state = 'MissionPreparation';

  moveDrone(drone: string, moveTo: string): void {
    let curr_state = this.drone_states.get(drone);
    let droneData = this.states.get(curr_state).drones[drone]
    delete this.states.get(curr_state).drones[drone]
    this.states.get(moveTo).drones[drone] = droneData
    this.drone_states.set(drone, moveTo);
    this.drone_moved.emit([this.states.get(moveTo).drones[drone], moveTo])
  }

  getMissionList(): string[] {
    return this.mission_list
  }

  getMissionDrones(mission: string): string[] {
    return this.mission_drones[mission];
  }

  getGroupViewList(): Map<string, grouping> {
    return this.groupView;
  }

  getTransitions(mission: string): Transition[] {
    return this.transitions.get(mission);
  }

  getMissionTypes(): MissionType[] {
    return this.mission_types;
  }

  parseJSON(root: RootObject): void {
    this.initMissionTypes(root.mission_types);
    this.initMissionRoles(root.mission_roles);
  }

  getStates(): Map<string, State> {
    return this.states;
  }

  getDroneState(color: string): string {
    return this.drone_states.get(color);
  }

  getFirstTime(): boolean {
    return this.firstTime;
  }

  setFirstTime(makeFalse: boolean): void {
    this.firstTime = makeFalse;
  }

  getClickable(): boolean {
    return this.clickable;
  }

  setClickable(): void {
    this.clickable = false;
  }

  initMissionTypes(mission_types: MissionType[]): void {
    this.mission_list = [];
    this.mission_types = mission_types;
    mission_types.forEach(mission => {
      this.fake_trans_index = -1
      this.mission_list.push(mission.name)
      this.transitions.set(mission.name, []);
      this.initStates(mission.states, mission.name);
      this.initStates(mission.states, mission.name);
      this.initStates(mission.states, mission.name);
    });
    this.mission_list.push('merge missions')
  }

  initStates(states: State[], mission: string): void {
    states.forEach(state => {
      if (!this.states.get(state.name)) {
        this.states.set(state.name, state);
        this.states.get(state.name).mission = new Set<string>();
        this.states.get(state.name).drones = {};
      }
      this.states.get(state.name).mission.add(mission);

      this.groupView.set(state.group, {
        name: state.group,
        view: true
      })

      this.initStateTransitions(state, mission)
    });
  }

  initStateTransitions(state: State, mission: string): void {
    if (state.transitions.length === 0) {
      if (this.fake_trans_index > 0) {
        this.transitions.get(mission)[this.fake_trans_index]['target'] = state.name
      }
      this.transitions.get(mission).push({
        origin: state.name,
        target: 'MissionPreparation',
        condition: 'fake'
      })
      this.fake_trans_index = this.transitions.get(mission).length - 1
    } else {
      state.transitions.forEach(transition => {
        this.transitions.get(mission).push({
          origin: state.name,
          target: transition.target,
          condition: transition.condition
        });
      });
    }
  }

  initMissionRoles(mission_roles: MissionRole[]): void {
    mission_roles.forEach(mission => {
      this.mission_drones.set(mission.role, []);
      this.initDroneList(mission.drone_list, mission.role);
      this.initDroneList(mission.drone_list, mission.role);
      this.initDroneList(mission.drone_list, mission.role);
    });
  }

  initDroneList(drone_list: DroneList[], mission: string): void {
    drone_list.forEach(drone => {
      this.initDrone(drone.id, mission);
      this.droneList.push(drone.id)
    });
  }

  initDrone(droneID: string, mission: string): void {
    this.mission_drones.get(mission).push(droneID);
    this.states.get(this.first_state).drones[droneID] = { name: droneID, mission: mission, index: this.drone_index }
    this.drone_index += 1
    this.drone_states.set(droneID, this.first_state);
  }

}

export interface grouping {
  'name': string,
  'view': boolean
}

export interface Mission {
  name: string;
  created_by: string;
  created_date: string;
}

export interface Waypoint {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

export interface Hoverpoint {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
}

export interface DroneList {
  id: string;
  waypoints: Waypoint[];
  hoverpoint: Hoverpoint;
}

export interface MissionRole {
  role: string;
  drone_count: string;
  drone_list: DroneList[];
}

export interface Transition {
  origin?: string;
  target: string;
  condition: string;
  view?: boolean;
}

export interface State {
  name: string;
  group: string;
  mission: Set<string>;
  transitions: Transition[];
  drones: {};
  width: number;
  x: number;
  y: number;
  states_connected: number;
  view: boolean
}

export interface MissionType {
  name: string;
  states: State[];
}

export interface RootObject {
  mission: Mission;
  mission_roles: MissionRole[];
  mission_types: any[];
}