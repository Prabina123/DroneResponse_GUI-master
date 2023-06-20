import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MapComponent } from './map/map.component';
import { DroneVideoTabComponent } from './drone-video-tab/drone-video-tab.component';
import { DroneConnectionsComponent } from './drone-connections/drone-connections.component';
import { VirtualDroneConnectionsComponent } from './virtual-drone-connections/virtual-drone-connections.component';
import { GeoFenceComponent } from './geo-fence/geo-fence.component';
import { MissionWizardComponent } from './mission-wizard/mission-wizard.component';

import { MissionStatusComponent } from './mission-status/mission-status.component';
import { CreateRoleComponent } from './create-role/create-role.component';
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
  { path: '', component: MapComponent },
  { path: 'video', component: DroneVideoTabComponent },
  { path: 'connections', component: DroneConnectionsComponent },
  { path: 'virtual', component: VirtualDroneConnectionsComponent },
  { path: 'mission', component: MissionWizardComponent, },
  { path: 'geofence', component: GeoFenceComponent },
  { path: 'mission-status', component: MissionStatusComponent },
  { path: 'create-role', component: CreateRoleComponent },
  { path: 'dashboard', component: DashboardComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {})],
  exports: [RouterModule],
})
export class AppRoutingModule { }
