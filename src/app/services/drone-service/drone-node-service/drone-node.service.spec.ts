import { TestBed } from '@angular/core/testing';

import { DroneNodeService } from './drone-node.service';

describe('DroneNodeService', () => {
  let service: DroneNodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DroneNodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
