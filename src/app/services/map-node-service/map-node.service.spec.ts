import { TestBed } from '@angular/core/testing';

import { MapNodeServiceService } from './map-node.service';

describe('MapNodeServiceService', () => {
  let service: MapNodeServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MapNodeServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
