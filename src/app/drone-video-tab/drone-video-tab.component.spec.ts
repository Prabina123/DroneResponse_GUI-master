import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DroneVideoTabComponent } from './drone-video-tab.component';

describe('DroneVideoTabComponent', () => {
  let component: DroneVideoTabComponent;
  let fixture: ComponentFixture<DroneVideoTabComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DroneVideoTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroneVideoTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
