import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MissionWizardComponent } from './mission-wizard.component';

describe('MissionWizardComponent', () => {
  let component: MissionWizardComponent;
  let fixture: ComponentFixture<MissionWizardComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ MissionWizardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MissionWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
