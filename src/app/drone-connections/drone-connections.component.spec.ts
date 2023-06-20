import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DroneConnectionsComponent } from './drone-connections.component';

describe('DroneConnectionsComponent', () => {
  let component: DroneConnectionsComponent;
  let fixture: ComponentFixture<DroneConnectionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DroneConnectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DroneConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
