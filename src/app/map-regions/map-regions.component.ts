import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import * as MapboxDraw from '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw';
import { MapService } from 'src/app/services/map.service';
import { PolygonLayer } from 'src/app/map-layers/PolygonLayer';
import { FlightPathLayer } from '../map-layers/FlightPathLayer';
import { Observable } from 'rxjs';
import { Region } from '../model/Region';
import { GlobalService } from '../services/global.service';

@Component({
  selector: 'map-regions',
  templateUrl: './map-regions.component.html',
  styleUrls: ['./map-regions.component.less'],
})
export class MapRegionsComponent implements OnInit, OnChanges {
  // Inputs From Parent Component
  @Input() map: mapboxgl.Map;
  @Input() flightPathLayer: FlightPathLayer;
  @Input() polygonLayer: PolygonLayer;
  @Input() regions: Region[];
  @Input() tabChange: Observable<void>;

  // Regions to display during search
  searchTerm: string = '';
  displayedRegions: Region[];

  selectedRegionObject: any;
  markerExists: boolean = false;
  regionAltitude: number = 0;
  regionSpeed: number = 0;
  regionName: string = '';
  checkedAll: boolean = false;

  isCreatingRegion: boolean = false;
  isEditingRegion: boolean = false;
  regionNameError: string | null = null;

  // constructor(private mapService: MapService) { }
  constructor(private mapService: MapService, private _globalService: GlobalService) { }

  ngOnInit(): void {
    this.tabChange.subscribe(() => {
      this.resetValues(); 
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Create separate array for regions to display to enable searching features
    if (changes.regions != undefined) {
      this.displayedRegions = changes.regions.currentValue;
    }
  }

  // Show or hide regions on the map
  togglePolygonLayer(view: string): void {
    // Do the opposite of the input
    if (view === 'visible') {
      view = 'none';
    } else {
      view = 'visible';
    }

    this.polygonLayer.setVisibility(view);
    this.polygonLayer.toggleLayer();
  }

  // Enter the map into a mode to allow for regions to be drawn; called on region creation
  drawRegion() {
    this.resetValues();
    this.polygonLayer.clearMap();
    this.isCreatingRegion = true;
    this.polygonLayer.getDrawingTool().changeMode('draw_polygon');
    this.togglePolygonLayer('visible');
    this._globalService.setDragData({ isDragging: false, regions: [] });
  }

  // Change the displayed regions based on the searched region name
  searchRegions() {
    this.displayedRegions = this.regions.filter(
      region => region.name.toLowerCase().indexOf(this.searchTerm.toLowerCase()) >= 0);
  }

  // Shows a region when selected from the list of regions
  // handleRegionSelect(region: Region) {
  //   this.resetValues();
  //   console.log(region);
    //..........................................
    createDragDropRegion(region: Region) {
    const polygonPoints: any = region.layerGeojson.features[0].geometry
    const polygonCoordinates = polygonPoints.coordinates[0].map((point: any) => {
      const cordsInPixels = this.cordsToPixels(point)
      return cordsInPixels;
    });

    const xValues = polygonCoordinates.map((point: any) => point.x).sort((a: any, b: any) => a - b);
    const yValues = polygonCoordinates.map((point: any) => point.y).sort((a: any, b: any) => a - b);

    const dragRegion = {
      id: region._id,
      name: region.name,
      // x: polygonCoordinates[0].x,
      // y: polygonCoordinates[0].y,
      // width: polygonCoordinates[2].x - polygonCoordinates[0].x,
      // height: polygonCoordinates[2].y - polygonCoordinates[0].y,
      x: xValues.at(0),
      y: yValues.at(0),
      width: Math.abs(xValues.at(-1) - xValues.at(0)),
      height: Math.abs(yValues.at(-1) - yValues.at(0)),
      data: region
    }
    const oldDragData = this._globalService.dragData.value

    // check if the region is already in the dragData
    const regionIndex = oldDragData.regions.findIndex((region: any) => region.id === dragRegion.id)
    if (regionIndex > -1) {
      oldDragData.regions.splice(regionIndex, 1)
    }

    oldDragData.regions.push(dragRegion)
    const newDragData = { ...oldDragData }
    this._globalService.setDragData(newDragData)
  }
    // console.log(polygonCoordinates);
    // console.log(dragRegion);
    //..........................................
    handleRegionSelect(region: Region) {
      this.resetValues();
      this.createDragDropRegion(region)
      this.selectedRegionObject = region;
      this.polygonLayer.showPolygonOnMap(
        this.selectedRegionObject.layerGeojson,
      // this.selectedRegionObject.searchGeojson,
      false,
      // this.selectedRegionObject.startingPoints,
      false,
      this.selectedRegionObject.polygonNumber,
      this.selectedRegionObject.name
    );
  }

  // Validator to ensure that the region name is present and unique
  checkDuplicateRegionName(regionName: string): boolean {
    const isDuplicateRegionName = !!this.regions.find(
      (region: any) =>
        region.name.toLowerCase() === regionName.toLowerCase()
    );

    if (
      isDuplicateRegionName &&
      this.selectedRegionObject?.name !== regionName
    ) {
      return false;
    }
    return true;
  }

  // Handling for when the user saves a region that has been drawn 
  // saveRegion(): void {
  async saveRegion(): Promise<void> {
    if (!this.regionName) {
      this.regionNameError = 'Region name is required';
      return;
    } else if (!this.checkDuplicateRegionName(this.regionName)) {
      this.regionNameError = 'Region name already exists';
      return;
    }
    if (this.polygonLayer.polygonCoordinates == undefined) {
      this.regionNameError = 'No complete region has been drawn';
      return;
    }
    if (this.regionAltitude <= 0 || this.regionSpeed <= 0) {
      this.regionNameError = 'Altitude and speed are required';
      return;
    }
    if (this.isEditingRegion) return this.updateRegion();

    // On save, generate the search area routes for the region
    // this.polygonLayer.findSearchAreaRoutes(
    //   this.polygonLayer.polygonCoordinates,
    //   this.polygonLayer.regionObject.polygonNumber,
    //   [], this.regionAltitude, this.regionSpeed
    // );
    let region = this.polygonLayer.regionObject;
    region.name = this.regionName;
    region.altitude = this.regionAltitude;
    region.speed = this.regionSpeed;
    // this.mapService.saveRegion(region);
    const savedRegion = await this.mapService.saveRegion(region);
    this.createDragDropRegion(savedRegion)

    this.resetValues();
  }

  // Sends data about an updated region to the server after editing
  updateRegion(): void {
    this.polygonLayer.findSearchAreaRoutes(
      this.polygonLayer.polygonCoordinates,
      this.polygonLayer.regionObject.polygonNumber,
      [], this.regionAltitude, this.regionSpeed
    );
    const region = this.polygonLayer.regionObject;
    region.name = this.regionName;
    region.name = this.regionName;
    region.altitude = this.regionAltitude;
    region.speed = this.regionSpeed;
    this.mapService.updateRegion(
      this.selectedRegionObject._id,
      region
    );

    this.resetValues();
  }

  // Set the flags for editing a route
  handleEditRegion() {
    this.polygonLayer.clearMap();
    this.polygonLayer.showPolygonOnMap(
      this.selectedRegionObject.layerGeojson,
      this.selectedRegionObject.searchGeojson,
      this.selectedRegionObject.startingPoints,
      this.selectedRegionObject.polygonNumber,
      this.selectedRegionObject.name
    );

    this.regionName = this.selectedRegionObject.name;
    this.regionAltitude = this.selectedRegionObject.altitude;
    this.regionSpeed = this.selectedRegionObject.speed;
    this.isEditingRegion = true;
    let featureId = this.selectedRegionObject.layerGeojson.features[0].id;
    this.polygonLayer.getDrawingTool().changeMode('direct_select', { featureId: featureId });
  }

  cancelAction() {
    this.resetValues();
    this.flightPathLayer.clearLayer();
    this.polygonLayer.clearMap();
  }

  // Resets creation/editing flags after creating or editing a route
  resetValues() {
    this.isCreatingRegion = false;
    this.isEditingRegion = false;
    this.selectedRegionObject = null;
    this.regionNameError = null;
    this.regionName = '';
    this.regionAltitude = 0;
    this.regionSpeed = 0;
    this.polygonLayer.getDrawingTool().changeMode('static');
    this.polygonLayer.polygonCoordinates = undefined;
  }

  // Handler for deleting a region
  handleDeleteRegion() {
    this.mapService.deleteRegion(this.selectedRegionObject._id);
    this.resetValues();
    this.polygonLayer.clearMap();
  }

  // Convert the date object to a human readable date string
  getDate(dateString: string): string {
    const dateObj = new Date(dateString);
    return dateObj.toLocaleDateString();
  }
  cordsToPixels(cords: mapboxgl.LngLatLike): mapboxgl.Point {
    return this.map.project(cords);
  }

}
