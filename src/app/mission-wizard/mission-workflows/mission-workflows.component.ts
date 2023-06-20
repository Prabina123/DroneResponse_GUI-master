import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Drone } from 'src/app/model/Drone';
import { Mission } from 'src/app/model/Mission';
import { default as roles } from '../../utils/roles';

@Component({
  selector: 'app-mission-workflows',
  templateUrl: './mission-workflows.component.html',
  styleUrls: ['./mission-workflows.component.less']
})
export class MissionWorkflowsComponent {
  @Input() mission: Map<string, Mission>;
  @Input() drones: Drone[];
  @Input() mapView: boolean;
  @Output() showMapView: EventEmitter<string> = new EventEmitter<string>();
  @Output() selectedDronesEmitter: EventEmitter<any> = new EventEmitter<any>();

  toggleHideUnselected: boolean = false;
  selectedWorkFlow = [];
  roles = roles.roles;
  selectedDrones: Map<string, string[]> = new Map<string, string[]>;

  // Sends message to the MissionWizard component to switch to the map view
  showMap(id: string) {
    this.showMapView.emit(id);
  }

  // Returns the drones for a specific role
  getMissionDrones(role: string): any[] {
    const data = this.mission.get(role);
    if (role) {
      return data.getDroneList();
    }
    return [];
  };

  // Toggle for hiding unselected roles
  hideUnselectedWorkflow(isSelected: boolean): void {
    if (isSelected) {
      this.toggleHideUnselected = isSelected;
      this.selectedWorkFlow = [];
      this.roles = [];

      this.mission.forEach((e: Mission) => {
        roles.roles.forEach((element) => {
          if (e.getRole() == element.role.role_name) {
            this.roles.push(element);
          }
        });
      });
    } else {
      this.roles = [];
      this.toggleHideUnselected = isSelected;
      this.roles = roles.roles;
    }
  };

  // Returns a style depending on if a given role is completed, meaning all its requirements have been completed
  // TODO: Update for future roles with more requirements
  checkCompleted(role: string): string {
    const data = this.mission.get(role);

    if (data) {
      if (data.getDroneList().length > 0) {
        // return 'background : #56ff5652';
        return 'background : #f1f1f1';
      }
    }
    return '';
  }

  // Check if a role has been selected or not
  checkSelected(role: string): boolean {
    const check = this.mission.get(role);
    return check != undefined ? true : false;
  };

  // Manages mission roles that have been selected when the checkbox state changes
  onRoleToggle(roleName: string, checked: boolean): void {
    if (checked) {
      const missionObj = new Mission(roleName);
      this.mission.set(roleName, missionObj);
    } else {
      this.selectedDrones[roleName] = [];
      this.mission.delete(roleName);
    }
  }

  // Checks if a drone is already assigned to a role in order to disable it in the select list
  isAlreadySelectedDrone(drone: string, role: string): boolean {
    // Don't disable a drone when it is selected in the current role
    const isSelectedInSameRole = this.selectedDrones[role] && this.selectedDrones[role].includes(drone);

    // Creates an array of all of the roles to check if the drone is selected in any role
    const isAlreadySelected = Object.keys(this.selectedDrones)
      .reduce((prev, curr) => {
        prev = [...prev, ...this.selectedDrones[curr]];
        return prev;
      }, [])
      .includes(drone);

    const inMission = this.drones.find((d: Drone) => d.uavid == drone).status.onboard_pilot != 'ReceiveMission';
    return (!isSelectedInSameRole && isAlreadySelected) || inMission;
  }

  // Drone select handler for roles with no map view option
  // TODO: Figure out if this is actually needed, currently used for delivery role
  addSelectedToRole(event: string, name: string): void {
    this.mission.get(name).setDroneList([event.toLowerCase()]);
  }

  // Emits the selected drones to be updated in MissionWizard component
  droneSelectionChange(role: string) {
    this.selectedDronesEmitter.emit({ role: role, selected: this.selectedDrones });
  }
}
