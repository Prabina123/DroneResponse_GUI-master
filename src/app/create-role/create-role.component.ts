import { Component, Inject, OnInit } from '@angular/core';
import { GraphvizFunctionsService } from '../services/graphviz-service/graphviz-functions.service';
import {
  State,
  Transition,
} from '../services/graphviz-service/graphviz-parse-data.service';
import states from './states.json';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
declare var d3: any;

@Component({
  selector: 'app-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.less'],
})
export class CreateRoleComponent implements OnInit {
  states: Map<string, State>;
  trans_options: Transition[];
  show_options: boolean;
  positions: {};
  state_selected: string;
  roleModal = false;

  constructor(
    private graphvizFunctionService: GraphvizFunctionsService,
    public dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.states = new Map();
    this.show_options = true;
    this.positions = {};
    this.state_selected = '';

    states['states'].forEach((state: State) => {
      this.states.set(state.name, state);
      this.states.get(state.name).view = false;
      this.states.get(state.name).states_connected = 0;
    });

    this.states.get('MISSION_PREPARATION').view = true;
    this.showOptions('MISSION_PREPARATION');
  }

  roleCompletionModal(): void {
    const dialogRef = this.dialog.open(RoleModal, {
      width: '250px',
      data: { roleName: '' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log({ result });
    });
  }

  renderGraph(): void {
    let graphString = this.graphvizFunctionService.buildUserGraph(
      this.states,
      this.state_selected
    );
    var t = d3.transition().duration(450).ease(d3.easeLinear);

    let graphCoordinates = d3
      .select('#graph')
      .graphviz()
      .transition(t)
      .renderDot(graphString, () => {
        this.graphvizFunctionService.parseCoordinates(
          graphCoordinates._dictionary,
          '',
          this.states
        );

        var height_str =
          graphCoordinates._dictionary[`svg-0.G.path-0`].parent.parent
            .attributes.height;
        var height = parseInt(height_str, 10);
        var offsets = $('#container1').offset();
        this.states.forEach((state: State) => {
          let coords = this.graphvizFunctionService.getAbsCoord(
            height,
            offsets.left * 0.75,
            offsets.top * 0.75,
            state.name,
            this.states
          );
          this.positions[state.name] = coords;
        });
      })
      .zoom(false);
  }

  getLeft(state: string): number {
    return !this.positions[state] ? 0 : this.positions[state][0];
  }

  getTop(state: string): number {
    return !this.positions[state] ? 0 : this.positions[state][1];
  }

  showOptions(state: string): void {
    if (
      this.states.get(state).name == this.state_selected ||
      !this.show_options
    ) {
      this.show_options = !this.show_options;
    }
    this.state_selected = this.states.get(state).name;
    this.trans_options = this.states.get(state).transitions;
    this.renderGraph();
  }

  updateView(trans_index: number): void {
    let transition = this.states.get(this.state_selected).transitions[
      trans_index
    ];
    let target = this.states.get(transition.target);
    let old_view = transition.view;

    target.states_connected = target.states_connected + (old_view ? -1 : 1);
    transition.view = !old_view;

    let remove = this.checkNode(target.name);
    target.view = !remove;
  }

  checkNode(state: string): boolean {
    let curr_state = this.states.get(state);

    if (curr_state.states_connected == 0) {
      curr_state.transitions.forEach((trans: Transition) => {
        let target = this.states.get(trans.target);
        if (trans.view) {
          target.states_connected = target.states_connected - 1;
          let remove = this.checkNode(trans.target);
          if (remove) trans.view = false;
        }
      });
      curr_state.view = false;
      return true;
    }
    return false;
  }

  addNode(state: State, new_mission: {}, states_visited: Set<string>): void {
    if (states_visited.has(state.name)) return;
    states_visited.add(state.name);
    let trans_list = [];
    let index = new_mission['states'].push({
      name: state.name,
      group: state.group,
      transitions: trans_list,
    });

    state.transitions.forEach((trans: Transition) => {
      if (trans.view) {
        new_mission['states'][index - 1]['transitions'].push({
          target: trans.target,
          condition: trans.condition,
        });
        this.addNode(
          this.states.get(trans.target),
          new_mission,
          states_visited
        );
      }
    });
  }

  submitGraph(new_mission_name: string): void {
    let new_mission = {
      name: new_mission_name,
      states: [],
    };

    let states_visited = new Set<string>();
    this.addNode(
      this.states.get('MISSION_PREPARATION'),
      new_mission,
      states_visited
    );

    console.log(JSON.stringify(new_mission));
  }
}

export interface DialogData {
  roleName: string;
}

@Component({
  selector: 'role-modal-component',
  templateUrl: 'role-modal.component.html',
})
export class RoleModal {
  constructor(
    public dialogRef: MatDialogRef<RoleModal>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  nameChange(e: any): void {
    this.data.roleName = e.target.value;
  }
  onNoClick(): void {
    this.dialogRef.close(this.data.roleName);
  }
}
