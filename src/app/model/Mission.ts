import { MissionItem, MissionItemInterface } from './MissionItem';

export class Mission implements MissionInterface {
  role: string;
  droneCount: number;
  droneList: string[];
  missionItems: MissionItem[];
  missionJsons: Map<string, string>;

  constructor(role: string) {
    this.role = role;
    this.droneCount = 0;
    this.droneList = new Array<string>();
    this.missionItems = new Array<MissionItem>();
    this.missionJsons = new Map<string, string>();
  }

  getRole(): string {
    return this.role;
  }

  setRole(role: string) {
    this.role = role;
  }

  getDroneCount(): number {
    return this.droneCount;
  }

  setDroneCount(count: number): void {
    this.droneCount = count;
  }

  getDroneList(): string[] {
    return this.droneList;
  }

  setDroneList(newList: string[]): void {
    this.droneList = newList;
  }

  addDrone(drone: string): void {
    this.droneList.push(drone);
  }

  addMissionItem(item: any): void {
    this.missionItems.push(item);
  }

  getMission(): any {
    return { droneCount: this.droneCount, missionItems: this.missionItems };
  }

  addMissionJson(drone: string, missionJson: string): void {
    this.missionJsons.set(drone, missionJson);
  }

  getMissionJson(drone: string): string {
    return this.missionJsons.get(drone);
  }
}

interface MissionInterface {
  droneCount: number;

  // Information specific to each drone only
  missionItems: Array<MissionItemInterface>;
}
