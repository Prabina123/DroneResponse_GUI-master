import * as mapboxgl from 'mapbox-gl';

export interface CustomMapLayerInterface {
  map: mapboxgl.Map;
  layerGeojson: GeoJSON.FeatureCollection;

  onLoadSync(): void

  addSource(): void

  getLayerGeojson(): GeoJSON.FeatureCollection 

  loadLayer(): void

  addLayer(): void

  updateLayer(): void

  toggleLayer(): void

  getVisibility(): string

  setVisibility(view: string): void
}