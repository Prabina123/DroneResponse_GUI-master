# Map Components

### MapBoxComponent
The core component where the MapBox map is actually rendered is the [MapBoxComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-box/map-box.component.ts). This contains some controls, such as buttons to switch between street and satellite views, a search bar to find locations, and layer toggling. The layer toggling seems to be an older feature that is not used much anymore. There are buttons that enable icons to be placed and toggled, but these may not be needed anymore. Additionally, there is toggling for airspace layers, though these are not currently compatible with the custom MapBox layer that was created for more accurate satellite imagery.

The main layers that are displayed on the map are the [DroneLayer](#dronelayer) for the active drones, the [PolygonLayer](#polygonlayer) for regions, and the [FlightPathLayer](#flightpathlayer) for routes.

### MapComponent
[MapComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map/map.component.ts) is a container for the [MapBoxComponent](#mapboxcomponent) and the sidebar that contains tabs for the drones, routes, regions, and missions. This loads in the drone, route, region, and mission data to be passed to the [MapBoxComponent](#mapboxcomponent), [DronePanelComponent](#dronepanelcomponent), [MapRoutesComponent](#maproutescomponent), [MapRegionsComponent](#mapregionscomponent), and [MissionJsonsComponent](#missionjsonscomponent).

The MapComponent also initializes a MapBox map to be used in the MapBox component and creates the [PolygonLayer](#polygonlayer) and [FlightPathLayer](#flightpathlayer).

### DronePanelComponent

The [DronePanelComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/drone-panel/drone-panel.component.ts) contains a [DronePanelListItemComponent](#dronepanellistitemcomponent) for each active drone. Each list item displays information about the drone, like location, altitude, battery, mission status, mode, etc. Within each of these list items, there is also a [VideoStreamComponent](#videostreamcomponent) that provides a spot for streaming videos from the drone.

### VideoStreamComponent
The [VideoStreamComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/video-stream/video-stream.component.ts) contains a video element meant to display a thumbnail of the live video stream from the drone. Currently, this is just a placeholder for each drone where the video file that is displayed is `video_{uavid}.mp4` but eventually this should be changed to actually stream video, likely from a WebRTC connection. There is also a [DroneVideoTabComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/drone-video-tab/drone-video-tab.component.ts) that has not been updated recently, but is meant to provide tabs that show full screen video streams for each drone. This also uses a VideoStreamComponent and styles the video element differently, but this will need to be updated to support new changes to the frontend.

### MapRoutesComponent

The [MapRoutesComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-routes/map-routes.component.ts) contains controls for creating, editing, and deleting routes as well as a list of routes that contains information like the distance, number of waypoints, altitudes, and speeds. Clicking on these routes displays them on the map. In order for this to work, the MapBox map object, flight routes, and [FlightPathLayer](#flightpathlayer) are passed from the [MapComponent](#mapcomponent) as well as the [PolygonLayer](#polygonlayer) so that regions can be cleared from the map.

### MapRegionsComponent

The [MapRegionsComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-regions/map-regions.component.ts) contains controls for creating, editing, and deleting regions as well as a list of regions that contains information about the altitude and speed of the region. Clicking on these regions displays them on the map. In order for this to work, the MapBox map object, regions, and [PolygonLayer](#polygonlayer) are passed from the [MapComponent](#mapcomponent) as well as the [FlightPathLayer](#flightpathlayer) so that flight routes can also be cleared from the map.

### MissionJsonsComponent
The [MissionJsonsComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-jsons/mission-jsons.component.ts) contains controls for uploading and deleting JSON files containing missions. The list of missions contains the mission's name and how many drones the mission is for. Clicking on these missions displays them on the map, but it currently only supports displaying BriarWaypoint states in missions so long as these waypoints are in the correct order. In order for this to work, the MapBox map object, missions JSON strings, and [FlightPathLayer](#flightpathlayer) are passed from the [MapComponent](#mapcomponent) as well as the [PolygonLayer](#polygonlayer) so that regions can also be cleared from the map.

### CustomMapLayerInterface
The [CustomMapLayerInterface](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-layers/CustomMapLayerInterface.ts) is the interface that the other layers, primarily the [DroneLayer](#dronelayer), [PolygonLayer](#polygonlayer), and [FlightPathLayer](#flightpathlayer), implement. The functions that must be implemented are:
- `onLoadSync()` - Sets up listeners to observables to return the data that will be displayed by a layer.
- `addSource()` - Adds the sources to the MapBox map so that the data is available to be added to the map and styled.
- `getLayerGeojson()` - Getter method for the main data being displayed (more relevant for icon layers which are not typically used now).
- `loadLayer()` - Calls the methods to add the sources and layers that are displayed by this layer.
- `addLayer()` - Adds the layer itself to the map, using the source with the same ID as the data.
- `updateLayer()` - This updates the layer's data sources and is primarily called when the data is changed.

There are also some functions for toggling the visibility of layers but this is not used as often now.

### PolygonLayer
The [PolygonLayer](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-layers/PolygonLayer.ts) controls the drawing of flight regions. It initializes a MapboxDraw object that specifies the styling for different drawing components (points, polygon, etc.). There are are polygon creation and update handlers that manage adding and editing the coordinates of the regions. The regions, starting points, and flight paths are show by adding the coordinates to 3 different GeoJSON feature collections. To make the actual routes for drones within the polygon, the [RegionPath](#regionpath) class is used.

### FlightPathLayer
The [FlightPathLayer](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-layers/FlightPathLayer.ts) controls the creation and updating of individual flight paths, as opposed to the automatically generated [RegionPaths](#regionpath). When flight routes are created, this class creates objects that hold the coordinates and altitude/speed for each point in the flight. There are also two different GeoJSON feature collections for holding the actual lines as well as the points on each route.

### DroneLayer

The [DroneLayer](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-layers/DroneLayer.ts) controls the displaying and updating of location for the active drones. There are also previously supported layers for the heads and tails of drones, but these are no longer used on the map. When the active drones move and a message is received from MQTT, then the map is updated with the new positions of the drones.

### RegionPath
The [RegionPath](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/map-layers/RegionPath.ts) generates flight routes for some number of drones with a given region polygon created through the [PolygonLayer](#polygonlayer). It works by incrementing the longitude value and then going vertically from the bottom of the region to the top of the region at a specific longitudinal values. When multiple drones are assigned to a region, the distance of the total path in the region is split equally among the drones and each drone is given a starting point. These starting points are assigned based off of drone distance to each starting point. There is some work done on attempting to avoid intersections, but this still needs to be fully implemented and tested.

### MapService
The [MapService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/map.service.ts) contains a lot of functions for connecting to the backend server and loading in routes and regions, as well as (now unused) icons.

# Mission Wizard Components

### MissionWizardComponent

The [MissionWizardComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-wizard/mission-wizard.component.ts) is another container component for the mission creation workflow. It renders the [MissionWizardNavComponent](#missionwizardnavcomponent) at the top to show the workflow progress and then either a [MapBoxComponent](#mapboxcomponent) or a [MissionWorkflowsComponent](#missionworkflowscomponent) in the main area of the screen depending on if the user is selecting the type of mission or attempting to create/choose routes, regions, or mission JSONs. In the sidebar, either a [MissionRouteRegionComponent](#missionrouteregioncomponent) or a [DronePanelComponent](#dronepanelcomponent) will be rendered with the MapBoxComponenet or the MissionWorkflowsComponent, respectively.

Similar to the [MapComponent](#mapcomponent), it also initializes a MapBox map to be used in the MapBox component and creates the [PolygonLayer](#polygonlayer) and [FlightPathLayer](#flightpathlayer).

### MissionWizardNavComponent
The [MissionWizardNavComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-wizard/mission-wizard-nav/mission-wizard-nav.component.ts) contains the steps of building a mission and notifies the user what point they are at in the configuration process. Once a valid mission has been configured, the user can click the "Create Mission" and choose to save the mission in a new JSON file so that it can be used later without needing to go through route and region selection.

### MissionWorkflowsComponent
The [MissionWorkflowsComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-wizard/mission-workflows/mission-workflows.component.ts) show the types of missions that can be created in the mission wizard based on the currently listed [roles](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/utils/roles.ts). Currently only the search and detect and saved missions roles are supported by the front-end. For search and detect missions, the user can select from the currently active drones shown in the [DronePanelComponent](#dronepanelcomponent) and click configure to be brought the map and [MissionRouteRegionComponent](#missionrouteregioncomponent) for route and region selection. For saved missions, the user also selects active drones that have not yet been assigned to a different role and choose a saved mission JSON that supports the number of selected drones.

The text for each mission is displayed by a [MissionConfigComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-config/mission-config.component.ts). This could potentially be removed and just have the text rendered in the MissionWorkflowsComponent itself.

### MissionRouteRegionComponent
The [MissionRouteRegionComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/mission-route-region/mission-route-region.component.ts) contains, for the search and detect role, both the [MapRoutesComponent](#maproutescomponent) and [MapRegionsComponent](#mapregionscomponent) in tabs and a dropdown for each drone selected for the role. It loads in the routes and regions from the database so that they can be passed to the components. When a region is selected for a drone, the starting points are adjusted depending on how many drones are assigned to that region. 

For the saved missions role, the [MissionJsonsComponent](#missionjsonscomponent) is rendered and there is a single dropdown where the user can select a mission that supports the number of drones selected for the role in the [MissionWorkflowsComponent](#missionworkflowscomponent). 

The save button is enabled when routes and regions have been selected for each drone or a valid saved mission JSON has been selected. When saving, a [Mission](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/model/Mission.ts) object is created containing [MissionItems](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/model/MissionItem.ts) for each drone in a search and detect mission, or containing mission JSONs when the saved mission role was selected.

### MissionService
Many of these components utilize functions in the [MissionService](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/services/mission.service.ts). Loading in saved missions, displaying saved missions, building MissionItems, and creating new mission JSONs file are all controlled by this service.

# Other Components

### DroneConnectionsComponent
The [DroneConnectionsComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/drone-connections/drone-connections.component.ts) contains a layout of all of the drones and displays information about them like mode, location, status, etc. This page has not been updated recently and should be updated to include all of the information in the most recent version of the [Drone](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/model/Drone.ts) model. The sidebar is the [DroneArmingCheckComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/drone-arming-check/drone-arming-check.component.ts).

### DroneArmingCheckComponent
The [DroneArmingCheckComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/drone-arming-check/drone-arming-check.component.ts) displays status messages that are sent from the drone over MQTT. Previously, this was used for sensor and status checks for the preflight state but can also be used to display all status messages that are sent from the drone so that the logs can be evaluated in real-time on the front-end.

### CreateRoleComponent
The [CreateRoleComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/create-role/create-role.component.ts) was originally created to develop a mission by selecting individual states. It has not been worked on in a long time but could be a useful tool for creating missions in the future. It makes use of 2 different [GraphVizServices](https://github.com/DroneResponse/DR-GUI/tree/master/src/app/services/graphviz-service).

### DropdownMenuComponent
The [DropdownMenuComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/dropdown-menu/dropdown-menu.component.ts) is used in all sidebars as a simple navigation menu to navigate to the different pages on the application.

# Currently unused components

### GeoFenceComponent
The [GeoFenceComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/geo-fence/geo-fence.component.ts) was a previously created component that was meant to allow users to draw and display geofences to be assigned to the drones. This is currently unused.

### VirtualDroneConnectionsComponent
The [VirtualDroneConnectionsComponent](https://github.com/DroneResponse/DR-GUI/blob/master/src/app/virtual-drone-connections/virtual-drone-connections.component.ts) that was meant to spin up drone simulations and display simulated drone data. This was never finished and is currently unused.