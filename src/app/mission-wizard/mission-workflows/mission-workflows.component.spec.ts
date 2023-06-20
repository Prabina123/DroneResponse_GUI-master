import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionWorkflowsComponent } from './mission-workflows.component';

describe('MissionWorkflowsComponent', () => {
  let component: MissionWorkflowsComponent;
  let fixture: ComponentFixture<MissionWorkflowsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionWorkflowsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionWorkflowsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
