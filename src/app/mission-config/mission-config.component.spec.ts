import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MissionConfigComponent } from './mission-config.component';

describe('MissionConfigComponent', () => {
  let component: MissionConfigComponent;
  let fixture: ComponentFixture<MissionConfigComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionConfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
