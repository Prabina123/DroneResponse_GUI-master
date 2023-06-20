import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DroneArmingCheckComponent } from './drone-arming-check.component';

describe('DroneArmingCheckComponent', () => {
  let component: DroneArmingCheckComponent;
  let fixture: ComponentFixture<DroneArmingCheckComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DroneArmingCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroneArmingCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
