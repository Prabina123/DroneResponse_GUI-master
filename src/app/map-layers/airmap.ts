import ContextualAirspacePlugin from 'airmap-contextual-airspace-plugin'
import { AirmapService } from '../services/airmap-service/airmap-service';
import { faTree, faLock, faUsers } from '@fortawesome/free-solid-svg-icons';
import * as mapboxgl from 'mapbox-gl';

const options = {
  preferredRulesets: [],
  overrideRulesets: [],
  // Altitude, call air traffic control tower
  enableRecommendedRulesets: false,
  theme: 'light'
}

export class Airmap {
  map: mapboxgl.Map;
  airmapLayers = [];
  air_info = [];
  AirMapPlugin: any;
  alertVisible: boolean = false;
  closeVisible: boolean = false;

  constructor(map: mapboxgl.Map, private airMapService: AirmapService) {
    this.map = map;
    // Build all of the airmap layers and rules 
    this.buildAirMapLayers();
    // Add the AirMap plugin 
    this.AirMapPlugin = new ContextualAirspacePlugin(airMapService.getAirMapConfig(), options);
    this.map.addControl(this.AirMapPlugin);
    // Load the correct airspace view
    this.loadAirSpaceView();
    // Get AirSpace Information
    this.getAirSpaceInfo();
  }

  getAirSpaceInfo(): void {
    // Air space click listener
    this.AirMapPlugin.on('airspaceLayerClick', (data) => {
      this.air_info = [];         //Reset warnins
      this.alertVisible = true;   //Set visibility of alert box
      this.closeVisible = false;  //Set visiblity of close icon
      // Add objects to main array
      for (let e of data.layers) {
        // Get properties
        let alertName = e.properties.name;
        let alertCategory = e.properties.category;
        let alertFloor = e.properties.floor;
        let alertCeiling = e.properties.ceiling;
        let alertRule: string = e.properties.ruleset_id;

        // Logic for properties
        if (alertFloor === 0) {
          alertFloor = 'NO FLY';
          alertCeiling = 'NO FLY';
        } else {
          alertFloor += ' ft.';
          alertCeiling += ' ft.';
        }

        // Set proper category
        for (let layer of this.airmapLayers) {
          if (layer.rules.includes(alertRule)) {
            alertRule = layer.ruleText;
          }
        }

        // Create object
        let entry = {
          name: alertName,
          category: alertCategory,
          floor: alertFloor,
          ceiling: alertCeiling,
          rule: alertRule
        }

        // Push onto array
        this.air_info.push(entry);
      }
    });
  }


  buildAirMapLayers(): void {
    // Rule objects - rule name, icon used, and current visibility
    let recreationFly = {
      rules: ['usa_airmap_rules', 'usa_sec_91', 'usa_ama'],
      ruleText: 'Recreation Fly',
      icon: faUsers,
      view: 'none'
    };
    let part107 = {
      rules: ['usa_part_107'],
      ruleText: 'Section 107',
      icon: faLock,
      view: 'none'
    };
    let nationalParks = {
      rules: ['usa_national_park', 'usa_national_marine_sanctuary', 'usa_fish_wildlife_refuge', 'usa_wilderness_area'],
      ruleText: 'National Parks',
      icon: faTree,
      view: 'none'
    };

    this.airmapLayers = [];
    // Add each rule to the big array
    this.airmapLayers.push(part107);
    this.airmapLayers.push(recreationFly);
    this.airmapLayers.push(nationalParks);

    // Copy over all the rules to the plugin to ensure we have rule consistency
    // Ensure there are no copies
    for (let layer of this.airmapLayers) {
      for (let rule of layer.rules) {
        if (!options.overrideRulesets.includes(rule)) {
          options.overrideRulesets.push(rule);
        }
      }
    }
  }

  toggleAirSpace(layer: any): void {
    //Toggle the view of each layer 
    if (layer.view === 'none') {
      layer.view = 'visible';
    }
    else {
      layer.view = 'none';
    }

    // Display the airspace appropriately
    this.displayAirSpace(layer);
  }

  loadAirSpaceView(): void {
    const changeView = () => {
      // Check to see if AirMap base MapBox layer has loaded
      if (this.map.getStyle().sources.jurisdictions) {
        // Loop through layers and display appropriately
        for (let layer of this.airmapLayers) {
          // layer.view = 'none';
          this.displayAirSpace(layer);
        }
      }

      // Turn off the listener
      this.map.off('idle', changeView);
    };

    // Listen for a complete load of data
    this.map.on('idle', changeView);
  }

  displayAirSpace(layer: any): void {
    // Loop through all layers of map 
    // Layers have source sets - airmap layers have rule as source set
    // If current layer has same rule name as source set - change view
    for (let mapLayer of this.map.getStyle().layers) {
      for (let rule of layer.rules) {
        if ((mapLayer as mapboxgl.Layer).source === rule) {
          this.map.setLayoutProperty(mapLayer.id, 'visibility', layer.view)
        }
      }
    }
  }
}
