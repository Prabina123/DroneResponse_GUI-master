import { BrowserModule } from "@angular/platform-browser";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatLegacyButtonModule as MatButtonModule } from "@angular/material/legacy-button";
import { MatLegacyCheckboxModule as MatCheckboxModule } from "@angular/material/legacy-checkbox";
import { MatLegacyCardModule as MatCardModule } from "@angular/material/legacy-card";
import { MatLegacyRadioModule as MatRadioModule } from "@angular/material/legacy-radio";
import { MatIconModule } from "@angular/material/icon";
import { MatLegacyMenuModule as MatMenuModule } from "@angular/material/legacy-menu";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { MapComponent } from "./map/map.component";
import { DronePanelComponent } from "./drone-panel/drone-panel.component";
import { MissionConfigComponent } from "./mission-config/mission-config.component";
import { VideoStreamComponent } from "./video-stream/video-stream.component";

import { DroneService } from "./services/drone-service/drone.service";
import { DronePanelListItemComponent } from "./drone-panel-list-item/drone-panel-list-item.component";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { DroneVideoTabComponent } from "./drone-video-tab/drone-video-tab.component";
import { HttpClientModule } from "@angular/common/http";
import { DroneConnectionsComponent } from "./drone-connections/drone-connections.component";
import { DroneArmingCheckComponent } from "./drone-arming-check/drone-arming-check.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { VirtualDroneConnectionsComponent } from "./virtual-drone-connections/virtual-drone-connections.component";
import { DropdownMenuComponent } from "./dropdown-menu/dropdown-menu.component";
import { GeoFenceComponent } from "./geo-fence/geo-fence.component";
import { MatLegacyInputModule as MatInputModule } from "@angular/material/legacy-input";
import { MatButtonToggleModule } from "@angular/material/button-toggle";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatLegacyFormFieldModule as MatFormFieldModule } from "@angular/material/legacy-form-field";
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';

import { registerLocaleData } from "@angular/common";
import en from "@angular/common/locales/en";
import { MissionWizardComponent } from "./mission-wizard/mission-wizard.component";


// import { MoveDroneComponent } from "./mission-status/move-drone/move-drone.component";
// import { MissionsComponent } from "./mission-status/missions/missions.component";
// import { CreateMissionComponent } from "./create-mission/create-mission.component";
// import { MaterialModule } from "./material.module";
// import { NzLayoutModule } from "ng-zorro-antd/layout";
// import { NzModalModule } from "ng-zorro-antd/modal";
// import { NzPageHeaderModule } from "ng-zorro-antd/page-header";
import { MatDialogModule } from "@angular/material/dialog";
import { MatLegacySelectModule as MatSelectModule } from "@angular/material/legacy-select";
import { MatLegacyListModule as MatListModule } from "@angular/material/legacy-list";

// import { MapComponentComponent } from "./map-component/map-component.component";
import { MissionStatusComponent } from "./mission-status/mission-status.component";
import { GraphvizFunctionsService } from "./services/graphviz-service/graphviz-functions.service";
import {
  CreateRoleComponent,
  RoleModal,
} from "./create-role/create-role.component";
import { DronesComponent } from "./mission-status/drones/drones.component";
import { MapRoutesComponent } from "./map-routes/map-routes.component";
import { MapRegionsComponent } from "./map-regions/map-regions.component";
import { MissionWizardNavComponent } from './mission-wizard/mission-wizard-nav/mission-wizard-nav.component';
import { MissionSaveDialog } from "./mission-wizard/mission-wizard-nav/mission-wizard-nav.component";
import { MissionWorkflowsComponent } from './mission-wizard/mission-workflows/mission-workflows.component';
import { MapBoxComponent } from './map-box/map-box.component';
import { MissionRouteRegionComponent } from './mission-route-region/mission-route-region.component';
import { MissionJsonsComponent } from './mission-jsons/mission-jsons.component';
//..............................................
import { DndModule } from 'ngx-drag-drop';
import { GlobalService } from "./services/global.service";
//..............................................
registerLocaleData(en);

@NgModule({
    declarations: [
        AppComponent,
        MapComponent,
        DronePanelComponent,
        MissionConfigComponent,
        VideoStreamComponent,
        DronePanelListItemComponent,
        DroneVideoTabComponent,
        DroneConnectionsComponent,
        DroneArmingCheckComponent,
        VirtualDroneConnectionsComponent,
        DropdownMenuComponent,
        GeoFenceComponent,
        MissionWizardComponent,
        MapRoutesComponent,
        MapRegionsComponent,
        MissionStatusComponent,
        CreateRoleComponent,
        DronesComponent,
        RoleModal,
        MissionWizardNavComponent,
        MissionSaveDialog,
        MissionWorkflowsComponent,
        MapBoxComponent,
        MissionRouteRegionComponent,
        MissionJsonsComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        FontAwesomeModule,
        NgbModule,
        HttpClientModule,
        BrowserAnimationsModule,
        MatDialogModule,
        MatButtonModule,
        MatCheckboxModule,
        MatCardModule,
        MatRadioModule,
        MatIconModule,
        MatMenuModule,
        FormsModule,
        ReactiveFormsModule,
        // NzLayoutModule,
        // NzModalModule,
        // NzPageHeaderModule,
        MatButtonToggleModule,
        MatInputModule,
        MatSelectModule,
        MatListModule,
        MatToolbarModule,
        MatSidenavModule,
        MatFormFieldModule,
        MatTabsModule,
        DndModule
        // MaterialModule,
    ],
    providers: [DroneService, GraphvizFunctionsService, GlobalService],
    bootstrap: [AppComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule {
  constructor(
    private droneStatusConnection: DroneService,
    // private droneNodeConnection: DroneNodeService
  ) { }
}
