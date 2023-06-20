import { EventEmitter, Injectable } from '@angular/core';
import { GraphvizParseDataService, MissionType, State, grouping } from './graphviz-parse-data.service';

@Injectable()
export class GraphvizFunctionsService {
  render_drones = new EventEmitter<{}>();
  coords_changed = new EventEmitter<number>();

  states: Map<string, State> = new Map();
  merge_transitions_visited: Set<string>;
  graphString: string;
  mission_count: number;

  constructor(private graphvizParseDataService: GraphvizParseDataService) { }

  init() {
    this.graphString = '';
    this.merge_transitions_visited = new Set()
    this.states = this.graphvizParseDataService.getStates();
    this.formatGraph();
  }

  buildGraphString(mission: string, mission_types: MissionType[]) {
    this.init();
    let groupViewList = this.graphvizParseDataService.getGroupViewList();
    this.mission_count = this.getFSM(mission);
    if (this.mission_count === this.graphvizParseDataService.getMissionList().length - 1) {
      for (let i = 0; i < this.mission_count; i++) {
        this.configGraph(mission_types[i], groupViewList);
      }
    }
    else {
      this.configGraph(mission_types[this.mission_count], groupViewList);
    }
    this.finishGraph();
    return this.graphString;
  }

  buildUserGraph(states: Map<string, State>, state_selected: string) {
    this.init();
    let groups = ['Takeoff', 'Mission', 'End'];
    groups.forEach(group => {
      this.buildGroupClusterUser(states, group, false, state_selected);
    })
    this.finishGraph();
    return this.graphString;
  }

  buildGroupCluster(group: string, mission: string, states: State[]) {
    let transitions = this.graphvizParseDataService.getTransitions(mission);
    this.formatGraphCluster(group, group);
    this.addNodes(this.filterNodes(states, group));
    this.addTransitions(this.filterTransitions(transitions, group));
    this.finishGraph();
  }

  buildGroupClusterUser(states: Map<string, State>, group: string, realMission: boolean, state_selected: string) {
    this.formatGraphCluster(group, '');
    states.forEach(state => {
      if (state.view && state.group == group) {
        let selected = (state_selected === state.name)
        this.writeNode(state.name, realMission, selected);
        state.transitions.forEach(trans => {
          if (trans.view && states.get(trans.target).group == group) {
            this.writeLink(state.name, trans.target, trans.condition, realMission);
          }
        });
      }
    });
    this.finishGraph();
  }


  formatGraph() {
    let format = `
        digraph G {
            graph [nodesep=.6, ranksep=.7, fontsize=20, rankdir=TB, compound=true, newrank=true, fontname=Helvetica];
            edge [fontsize=7, arrowsize=.5];
            node [style=filled];
         `
    this.addToGraphString(format);
  }


  formatGraphCluster(group: string, label: string) {
    let format = `
        subgraph cluster_${group} {
            color = black; label="${label}"
            `;
    this.addToGraphString(format);
  }

  filterNodes(nodes: State[], grouping: string) {
    //return nodes.filter(node => this.states[node.name].group === grouping);
    return nodes.filter(node => this.states.get(node.name).group === grouping);
  }

  filterTransitions(nodes: any[], grouping: string) {
    //return nodes.filter(node => this.states[node.target].group === grouping && this.states[node.origin].group === grouping);
    return nodes.filter(node => this.states.get(node.target).group === grouping && this.states.get(node.origin).group === grouping);
  }

  configGraph(mission: MissionType, groupings: Map<string, grouping>) {
    groupings.forEach(grouping => {
      if (grouping.view) {
        this.buildGroupCluster(grouping.name, mission.name, mission.states);
      }
    });
  }

  finishGraph() {
    this.addToGraphString(`}`);
  }

  addToGraphString(text: string,) {
    this.graphString = this.graphString.concat(text);
  }

  getFSM(missionType: string) {
    var count = 0;
    this.graphvizParseDataService.mission_list.every(mission => {
      if (mission === missionType) {
        return false; //return false in a .every() is equivalent to a break in a normal loop
      } else {
        count = count + 1;
        return true; //like a continue statement, without it, the loop exits
      }
    })
    return count;
  }

  addNodes(nodes: any[]) {
    nodes.forEach(node => {
      this.writeNode(node.name, true, false);
    })
  }

  addTransitions(nodesTransition: any[]) {
    nodesTransition.forEach(transition => {
      this.writeLink(
        transition.origin,
        transition.target,
        transition.condition,
        true
      );
    }
    )
  }


  writeNode(name: string, realMission: boolean, selected: boolean) {
    if (realMission) {
      var count = 0
      var text = `subgraph cluster_${name} {
                style=filled; fillcolor=lightgrey; fontsize=12
                `;
      var rank_text = `{rank=same;`
      for (let i = 0; i < 3; i++) {
        text = text.concat(`${name}_drone_${count} [shape=circle, color=transparent, label="", fixedsize=false, height=.08, width=.08]`);
        rank_text = rank_text.concat(` ${name}_drone_${count};`);
        count = count + 1;
      }
      text = text.concat(`${rank_text}}
            label="${name}"}`);

    } else {
      var text = `subgraph cluster_${name} {
                style = filled; color=${selected ? 'lightblue' : 'lightgrey'}; fontsize=12;
                ${name}_drone_1 [label=${name}; style = filled; color=invis; fixedsize=true, height=.2, width=1.5]}`;
    }


    this.addToGraphString(text);

  }

  writeLink(node1: string, node2: string, label: string, realMission: boolean) {
    if (!this.merge_transitions_visited.has(`${node1}_${node2}`)) {
      if (label === 'fake') {
        var text = `
                ${node1}_drone_1 -> ${node2}_drone_1 [ltail=cluster_${node1}, lhead=cluster_${node2}, label="", color=transparent]`;
      } else {
        if (realMission) {
          label = ''
        }
        var text = `
                ${node1}_drone_1 -> ${node2}_drone_1 [ltail=cluster_${node1}, lhead=cluster_${node2}, label="${label}"]`;
      }
      this.addToGraphString(text);
      this.merge_transitions_visited.add(`${node1}_${node2}`)
    }
  }

  getAbsCoord(graph_height: number, graphvizX: number, graphvizY: number, state: string, states: Map<string, State>) {
    if (!states) states = this.states;
    let x_pos = states.get(state)['x'] + graphvizX;
    let y_pos = states.get(state)['y'] + graphvizY + graph_height;
    return [x_pos, y_pos];
  }

  parseCoordinates(coords: object, mission: string, states: Map<string, State>) {
    if (!states) states = this.states;

    states.forEach(state => {
      if (coords[`svg-0.G.cluster_${state.name}.path-0`] !== undefined) {
        state.x = coords[`svg-0.G.cluster_${state.name}.path-0`].bbox.x
        state.y = coords[`svg-0.G.cluster_${state.name}.path-0`].bbox.y
        state.width = coords[`svg-0.G.cluster_${state.name}.path-0`].bbox.width
      }
    })
    this.render_drones.emit(mission);
    return states
  }

  sendOffsets(max_height: number) {
    this.coords_changed.emit(max_height)
  }
}