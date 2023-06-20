import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionRouteRegionComponent } from './mission-route-region.component';

describe('MissionRouteRegionComponent', () => {
  let component: MissionRouteRegionComponent;
  let fixture: ComponentFixture<MissionRouteRegionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionRouteRegionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionRouteRegionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
