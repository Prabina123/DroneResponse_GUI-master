import { Component, Input } from '@angular/core';
import {
  MatDialog,
  MatDialogRef
} from "@angular/material/dialog";
import { Router } from '@angular/router';
import { Drone } from 'src/app/model/Drone';
import { Mission } from 'src/app/model/Mission';
import { MissionService } from 'src/app/services/mission.service';

@Component({
  selector: 'app-mission-wizard-nav',
  templateUrl: './mission-wizard-nav.component.html',
  styleUrls: ['./mission-wizard-nav.component.less']
})
export class MissionWizardNavComponent {
  @Input() mission: Map<string, Mission>;
  @Input() drones: Drone[];

  missionName: string;

  constructor(
    private missionService: MissionService,
    private router: Router,
    public dialog: MatDialog
  ) { }

  openMissionSaveDialog(): void {
    const dialogRef = this.dialog.open(MissionSaveDialog, {
      width: '250px',
      data: { missionName: this.missionName }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.missionName = result;
      this.createMission();
      // Delays to allow time for mission JSONs to send over MQTT
      setTimeout(() => { this.router.navigate(['/']) }, 500);
    });
  }

  createMission(): void {
      const missionList = this.missionService.createMission(this.mission, this.drones);
      if (this.missionName) {
        this.missionService.saveMissionJson(this.missionName, missionList);
      }
  }

  // Returns the drones for a specific role
  getMissionDrones(role: string): any[] {
    let data = this.mission.get(role);
    if (data) {
      return data.getDroneList();
    }
    return [];
  };

  // Decides whether to highlight the current step in the workflow
  selectedConfigureColor(selected: boolean): string {
    if (selected) {
      return 'selectedTabHighlighted';
    }
    return '';
  };

  // Check if any of the selected roles are completed
  checkAnyConfigure(): boolean {
    if (this.mission.size > 0)
      return false;
    return true;
  };

  // Check if all selected roles have been completed
  checkAllCompleted(): boolean {
    if (this.mission.size == 0) {
      return false;
    }
    let isConfiguredAllCompleted = true;
    this.mission.forEach((m: Mission) => {
      if (m.role == 'search_and_detect') {
        if (this.getMissionDrones(m.getRole()).length <= 0) {
          isConfiguredAllCompleted = false
        }
      } else if (m.role == 'saved_mission') {
        const checkEqualSize = m.missionJsons.size == m.getDroneCount();
        const checkEmpty = m.missionJsons.size == 0 || m.getDroneCount() == 0;
        if (checkEmpty || !checkEqualSize) {
          isConfiguredAllCompleted = false
        }
      }
    });
    return isConfiguredAllCompleted;
  };
}

@Component({
  selector: 'mission-save-dialog',
  templateUrl: './mission-save-dialog.html'
})
export class MissionSaveDialog {
  missionName: string;

  constructor(
    public dialogRef: MatDialogRef<MissionSaveDialog>
    ) { }

    closeBox(): void {
      this.dialogRef.close();
    }
}