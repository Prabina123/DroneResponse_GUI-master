import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { LayerName } from 'src/app/map-layers/CustomMapLayer';
import { FlightPathLayer } from 'src/app/map-layers/FlightPathLayer';
import { MapService } from '../services/map.service';
import { IRoute } from '../model/Route';
import { PolygonLayer } from '../map-layers/PolygonLayer';
import { Observable } from 'rxjs';

@Component({
  selector: 'map-routes',
  templateUrl: './map-routes.component.html',
  styleUrls: ['./map-routes.component.less'],
})
export class MapRoutesComponent implements OnInit, OnChanges {
  // Inputs From Parent Component
  @Input() flightPathLayer: FlightPathLayer;
  @Input() polygonLayer: PolygonLayer;
  @Input() map: mapboxgl.Map;
  @Input() flightRoutes: IRoute[];
  @Input() assignments: any;
  @Input() tabChange: Observable<void>;

  // Routes to display during search
  searchTerm: string = '';
  displayedRoutes: IRoute[];

  popupList = [];
  markerExists: boolean = false;
  tempAlt = 0;
  tempSpeed = 0;
  routeName: string ='';
  checkedNext = false;

  isCreatingNewRoute = false;
  isEditingRoute = false;
  routeNameError: string | null = null;
  selectedRouteObject: null | IRoute = null;

  // Element References
  createRouteClickRef: any;
  createRouteTouchRef: any;
  editRouteClickRef: any;
  editRouteTouchRef: any; 
  dragMouseEditRef: any; 
  dragMouseEditMoveRef: any;
  dragTouchEditRef: any; 
  dragTouchEditMoveRef: any;

  constructor(private mapService: MapService) { }

  ngOnInit(): void {
    this.tabChange.subscribe(() => {
      this.resetValues();
      this.flightPathLayer.updateLayer();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Create separate array for routes to display to enable searching features
    if (changes.flightRoutes != undefined) {
      this.displayedRoutes = changes.flightRoutes.currentValue;
    }
  }

  // Create listeners on the map to allow for new flight routes to be drawn
  drawRouteHandler(): void {
    this.isCreatingNewRoute = true;
    this.flightPathLayer.clearLayer();
    this.popupList = [];
    this.flightPathLayer.newFlightPath();
    this.map.on(
      'click',
      (this.createRouteClickRef = this.createRoute.bind(null, this))
    );
    this.map.on(
      'touchstart',
      (this.createRouteTouchRef = this.createRoute.bind(null, this))
    );
  }

  // Add points to the route and popups for altitude and speed
  createRoute(that: MapRoutesComponent, clickEvent: any): void {
    // Ensure all popups are removed and we only open one
    if (that.markerExists) {
      console.log(document.querySelector('#marker-altitude'));
      // Get previous marker on the map and set it's altitude and speed
      let alt = (document.getElementById('marker-altitude') as HTMLInputElement).value || '25';
      let speed = (document.getElementById('marker-speed') as HTMLInputElement).value || '10';
      that.checkedNext = (document.getElementById('apply-next') as HTMLInputElement).checked;

      that.flightPathLayer.currentRoute.altitude.push(parseFloat(alt));
      that.flightPathLayer.currentRoute.speed.push(parseFloat(speed));

      // Check for the apply to next feature
      if (that.checkedNext) {
        that.tempAlt = parseFloat(alt);
        that.tempSpeed = parseFloat(speed);
      } else {
        that.tempAlt = 0;
        that.tempSpeed = 0;
      }
      that.removePopups();
    }

    // With at least one point, add option to end route drawing
    // Store the lat and lng and send to the flight drawing component
    let lat = clickEvent.lngLat.lat;
    let lng = clickEvent.lngLat.lng;
    // Add new coordinates for point and line for the current flight route
    that.flightPathLayer.updateCurrentPath(lat, lng);
    // HTML for the popup
    let html =
    `
    <form id="flight-marker" class="testy marker-information">
      <div class="input-alt">
        <label for="altitude">Altitude(m):</label>
        <input id="marker-altitude" style="float:right" min="0" max="100" value="${that.tempAlt}" type="number">
      </div>
      <div class="input-speed">
        <label for="speed">Speed(m/s):</label>
        <input id="marker-speed" style="float:right" min="0" max="100" value="${that.tempSpeed}" type="number">
      </div>
      <div style="text-align: center;">
        <label for="apply-next">Apply to next</label>
        <input id="apply-next" style="vertical-align:middle" type="checkbox" id="apply-next" ${that.checkedNext ? "checked" : ""}>
      </div>
    </form>
    `;

    // Display the speed and altitude
    let popup = new mapboxgl.Popup()
      .setLngLat(clickEvent.lngLat)
      .setHTML(html)
      .addTo(that.map);
    // Marker placed and added
    that.markerExists = true;
    // Add the pop up to the list that will eventually remove them
    that.popupList.push(popup);
  }

  // Validator to ensure that the route name is present and unique
  checkRouteName(): void {
    if (!this.routeName) {
      this.routeNameError = 'Route name is required';
      return;
    }

    let notUniqueName = !!this.flightRoutes.find((route: IRoute) => {
      return route.routeName.toLowerCase() === this.routeName.toLowerCase()
    })
    if (notUniqueName) {
      this.routeNameError = 'Route name already exists';
      return;
    }
    this.routeNameError = null;
  }

  // Handling for when the user saves a route that is being drawn
  saveRoute(): void {
    // Check if new route is being created or an edited route
    if (this.isEditingRoute) return this.updateRoute();

    // Validate route name
    if (this.routeNameError) return;
    if (!this.routeName) {
      this.routeNameError = 'Route name is required';
      return;
    }

    // Get last marker on the map and set it's altitude and speed
    let alt = (document.getElementById('marker-altitude') as HTMLInputElement).value || '25';
    let speed = (document.getElementById('marker-speed') as HTMLInputElement).value || '10';
    this.flightPathLayer.currentRoute.altitude.push(parseFloat(alt));
    this.flightPathLayer.currentRoute.speed.push(parseFloat(speed));
    this.markerExists = false;
    this.checkedNext = false;
    // Remove all popups
    this.removePopups();
    // Reset the speed and altitude
    this.tempAlt = 0;
    this.tempSpeed = 0;

    // Disable map click and touch actions
    this.map.off('click', this.createRouteClickRef);
    this.map.off('touchstart', this.createRouteTouchRef);
    // Submit the flight path name and update the value accordingly
    this.flightPathLayer.currentRoute.routeName = this.routeName;
    this.flightPathLayer.finishFlightPath();

    // Turn off flags that signal a route is being created
    this.isCreatingNewRoute = false;
    this.routeName = '';
    this.routeNameError = null;
    this.flightPathLayer.clearLayer();
  }

  // Handler for editing a route
  updateRoute(): void {
    // Clear the layer
    this.flightPathLayer.clearLayer();
    // Turn off the click and touch listener for the editing
    this.map.off(
      'click',
      LayerName.FlightPath + 'points',
      this.editRouteClickRef
    );
    this.map.off(
      'touchstart',
      LayerName.FlightPath + 'points',
      this.editRouteTouchRef
    );
    this.map.off(
      'mousedown',
      LayerName.FlightPath + 'points',
      this.dragMouseEditRef
    );
    this.map.off(
      'touchstart',
      LayerName.FlightPath + 'points',
      this.dragTouchEditRef
    ); //**** BUG ISSUE RELATED TO THE TOUCH CONTROLS  *****

    // Update the route in the flight layer and server
    this.removePopups();
    this.flightPathLayer.updateServer(this.selectedRouteObject.sourceID);
    this.isEditingRoute = false;
    this.selectedRouteObject = null;
  }

  // Allows a route to be edited and sends the update to the server
  editRoute(that: MapRoutesComponent, sourceID: number, event: any): void {
    // Get the route and point by ID
    let currentRoute = that.flightPathLayer.pathSources.get(sourceID);
    let pointID = event.features[0].properties.id;
    // The html for the marker
    var html =
    `
    <form id="flight-marker" class="testy marker-information">
      <div class="input-alt">
        <label for="altitude">Altitude(m):</label>
        <input id="marker-altitude" style="float:right" min="0" max="100" value="${currentRoute.altitude[pointID]}" type="number">
      </div>
      <div class="input-speed">
        <label for="speed">Speed(m/s):</label>
        <input id="marker-speed" style="float:right" min="0" max="100" value="${currentRoute.speed[pointID]}" type="number">
      </div>
    </form>
    `;
    // Ensure all popups are removed and we only open one
    that.removePopups();
    // Add the marker to the map
    var coordinates = event.features[0].geometry.coordinates.slice();
    var popup = new mapboxgl.Popup()
      .setLngLat(coordinates)
      .setHTML(html)
      .addTo(that.map);

    // Event listener for altitude value
    (
      document.getElementById('marker-altitude') as HTMLInputElement
    ).addEventListener('input', function (event) {
      let alt = (<HTMLInputElement>event.target).value;
      if (alt && parseFloat(alt) >= 0) {
        currentRoute.altitude[pointID] = parseFloat(alt);
      }
    });
    // Event listener for speed value
    (
      document.getElementById('marker-speed') as HTMLInputElement
    ).addEventListener('input', function (event) {
      let speed = (<HTMLInputElement>event.target).value;
      if (speed && parseFloat(speed) >= 0) {
        currentRoute.speed[pointID] = parseFloat(speed);
      }
    });

    // Add the pop up to the list that will remove next click or touch
    that.popupList.push(popup);
  }

  // Binds functions for dragging points to edit routes
  dragHandler(that: MapRoutesComponent, sourceID: number, event: any): void {
    event.preventDefault();
    let pointID = event.features[0].properties.id;
    let currentRoute = that.flightPathLayer.pathSources.get(sourceID);
    // On mouse move, move the location of a point on the route
    that.map.on(
      'mousemove',
      (that.dragMouseEditMoveRef = that.onMove.bind(
        null,
        that,
        currentRoute,
        pointID
      ))
    );
    // Stop moving on mouse lift
    that.map.once('mouseup', that.onUp.bind(null, that, sourceID));

    // Support touchscreen moving
    that.map.on(
      'touchmove',
      (that.dragTouchEditMoveRef = that.onMove.bind(
        null,
        that,
        currentRoute,
        pointID
      ))
    );
    that.map.once('touchend', that.onUp.bind(null, that, sourceID));
  }

  // Edit the line and point data for the route being edited
  onMove(that: any, currentRoute: IRoute, pointID: number, event: any) {
    let coords = event.lngLat;
    that.map.getCanvasContainer().style.cursor = 'grabbing';
    // Set the point data for the coordinates
    (currentRoute.pointData[pointID].geometry as GeoJSON.Point).coordinates = [
      coords.lng,
      coords.lat,
    ];
    // Set the line data for the coordinates
    (currentRoute.lineData.geometry as GeoJSON.LineString).coordinates[pointID] = [
      coords.lng,
      coords.lat,
    ];
    // Reset the source data for the point layer
    that.map
      .getSource(LayerName.FlightPath + 'points')
      .setData(that.flightPathLayer.pointLayerGeojson);
    // Reset the source data for the point layer
    that.map
      .getSource(LayerName.FlightPath + 'lines')
      .setData(that.flightPathLayer.lineLayerGeojson);
  }

  // End drag listener for editing routes
  onUp(that: MapRoutesComponent, sourceID: number): void {
    // Turn off the event listener
    that.map.off('mousemove', that.dragMouseEditMoveRef);
    that.map.off('touchmove', that.dragTouchEditMoveRef);
    // Recalculate the distance
    that.flightPathLayer.recalculateDistance(sourceID);
  }

  // Function to check what routes are currently selected
  isAlreadySelectedRoute(sourceId: string): boolean {
    return Object.values(this.assignments).find((a: any) => a.id == sourceId) != undefined;
  }

  // Change the displayed routes based on the searched route name
  searchRoutes(): void {
    this.displayedRoutes = this.flightRoutes.filter(
      route => route.routeName.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0);
  }

  // Handler for selecting routes and displaying them on the map
  handleRouteSelect(route: IRoute): void {
    this.resetValues();
    this.selectedRouteObject = route;
    this.flightPathLayer.displayRoute(this.selectedRouteObject.sourceID, false);

    for (let r of this.flightRoutes) {
      if (this.isAlreadySelectedRoute(r[0])) {
        this.flightPathLayer.displayRoute(r[0], false);
      }
    }
  }

  // Create listeners on the map for editing routes
  handleEditRoute(): void {
    this.polygonLayer.clearMap();
    this.flightPathLayer.displayRoute(this.selectedRouteObject.sourceID);
    this.isEditingRoute = true;
    // Start listen for map click and touch to edit the altitude and speed at each point -
    this.map.on(
      'click',
      LayerName.FlightPath + 'points',
      (this.editRouteClickRef = this.editRoute.bind(
        null,
        this,
        this.selectedRouteObject.sourceID
      ))
    );
    this.map.on(
      'touchend',
      LayerName.FlightPath + 'points',
      (this.editRouteTouchRef = this.editRoute.bind(
        null,
        this,
        this.selectedRouteObject.sourceID
      ))
    );

    // Start listen for map click and touch to drag the points to new locations
    this.map.on(
      'mousedown',
      LayerName.FlightPath + 'points',
      (this.dragMouseEditRef = this.dragHandler.bind(
        null,
        this,
        this.selectedRouteObject.sourceID
      ))
    );
    this.map.on(
      'touchstart',
      LayerName.FlightPath + 'points',
      (this.dragTouchEditRef = this.dragHandler.bind(
        null,
        this,
        this.selectedRouteObject.sourceID
      ))
    );
  }

  // Handler to delete the selected route
  handleDeleteRoute(): void {
    this.flightPathLayer.deleteFlightRoute(this.selectedRouteObject.sourceID);
    this.flightPathLayer.clearLayer();
    this.selectedRouteObject = null;
  }

  cancelAction(): void {
    this.flightPathLayer.clearLayer();
    this.polygonLayer.clearMap();
    this.resetValues();
    this.mapService.reloadMap();
  }

  resetValues(): void {
    // Reset route creation and edit flags
    this.isCreatingNewRoute = false;
    this.routeName = '';
    this.routeNameError = null;
    this.isEditingRoute = false;
    this.selectedRouteObject = null;
    this.markerExists = false;
    this.checkedNext = false;

    // Reset the speed and altitude
    this.tempAlt = 0;
    this.tempSpeed = 0;

    // Remove routes from the map
    this.removePopups();

    // Turn off create and edit listeners
    this.map.off('click', this.createRouteClickRef);
    this.map.off('touchstart', this.createRouteTouchRef);
    this.map.off(
      'click',
      LayerName.FlightPath + 'points',
      this.editRouteClickRef
    );
    this.map.off(
      'touchstart',
      LayerName.FlightPath + 'points',
      this.editRouteTouchRef
    );
    this.map.off(
      'mousedown',
      LayerName.FlightPath + 'points',
      this.dragMouseEditRef
    );
    this.map.off(
      'touchstart',
      LayerName.FlightPath + 'points',
      this.dragTouchEditRef
    );

  }

  // Remove altitude and speed popups from the map
  removePopups(): void {
    for (let p of this.popupList) p.remove();
  }

  // Convert the date object to a human readable date string
  getDate(dateString: string): string {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString();
  }
}
