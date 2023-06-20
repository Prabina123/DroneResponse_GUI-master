import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { VirtualDroneConnectionsComponent } from './virtual-drone-connections.component';

describe('VirtualDroneConnectionsComponent', () => {
  let component: VirtualDroneConnectionsComponent;
  let fixture: ComponentFixture<VirtualDroneConnectionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualDroneConnectionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDroneConnectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
