import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { FlightPathLayer } from '../map-layers/FlightPathLayer';
import { MissionService } from '../services/mission.service';
import { PolygonLayer } from '../map-layers/PolygonLayer';
import { Observable } from 'rxjs';
import { MissionJson } from '../model/MissionJson';

@Component({
  selector: 'mission-jsons',
  templateUrl: './mission-jsons.component.html',
  styleUrls: ['./mission-jsons.component.less']
})
export class MissionJsonsComponent implements OnInit, OnChanges {
  @Input() flightPathLayer: FlightPathLayer;
  @Input() polygonLayer: PolygonLayer;
  @Input() map: mapboxgl.Map;
  @Input() missionJsons: MissionJson[];
  @Input() tabChange: Observable<void>;

  // File upload variables
  fileName: string = '';
  fileContents: string | ArrayBuffer = null;
  isUploadingMission: boolean = false;
  missionName: string = '';
  missionNameError: string | null = null;

  // Mission to display
  selectedMission: any;

  // Missions to display during search
  searchTerm: string = '';
  displayedMissions: any[];

  constructor(private missionService: MissionService, private http: HttpClient) { }

  ngOnInit(): void {
    this.tabChange.subscribe(() => {
      this.resetValues();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Create separate array for missions to display to enable searching features
    if (changes.missionJsons != undefined) {
      this.displayedMissions = changes.missionJsons.currentValue;
    }
  }

  selectJsonFile(fileInputEvent: any): void {
    const file = fileInputEvent.target.files[0];
    if (!file) {
      return;
    }

    this.isUploadingMission = true;
    this.fileName = file.name;
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.fileContents = fileReader.result;
    };
    fileReader.readAsText(file);
  }

  checkMissionName(): void {
    if (!this.missionName) {
      this.missionNameError = 'Mission name is required';
      return;
    }

    let notUniqueName = !!this.missionJsons.find((missionJson: MissionJson) => 
      missionJson.name.toLowerCase() == this.missionName.toLowerCase()
    );
    if (notUniqueName) {
      this.missionNameError = 'Route name already exists';
      return;
    }
    this.missionNameError = null;
  }

  saveUploadedMission(): void {
    if (this.missionNameError) return;
    if (!this.missionName) {
      this.missionNameError = 'Mission name is required';
      return;
    }
    const missionList = [this.fileContents];
    if (this.missionName) {
      this.missionService.saveMissionJson(this.missionName, missionList);
    }
    this.cancelAction();
  }

  cancelAction(): void {
    this.flightPathLayer.clearLayer();
    this.polygonLayer.clearMap();
  }

  resetValues(): void {
    this.fileName = '';
    this.fileContents = null;
    this.isUploadingMission = false;
    this.missionName = '';
    this.missionNameError = null;
  }

  // Change the displayed missions based on the searched mission name
  searchMissions(): void {
    this.displayedMissions = this.missionJsons.filter(
      mission => mission.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0);
  }

  handleMissionSelect(mission: MissionJson): void {
    console.log(typeof mission.created)
    this.polygonLayer.clearMap();
    let pointData = [];
    this.selectedMission = mission;
    this.selectedMission.missionList.forEach((missionJson: string, index: number) => {
      const missionObj = JSON.parse(missionJson);
      const displayData = this.missionService.getMissionDisplayData(missionObj, index, pointData);
      // Display the mission on the map, do not clear map if there are multiple drones for a mission
      this.flightPathLayer.showRouteUsingData(displayData.lines, displayData.points, index == 0);
    });
  }

  // Send a message to delete the mission from the database
  handleDeleteMission(): void {
    this.missionService.deleteMissionJson(this.selectedMission.name);
    this.selectedMission = null;
    this.flightPathLayer.clearLayer()
  }

  // Convert the date object to a human readable date string
  getDate(dateString: string): string {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString();
  }
}
