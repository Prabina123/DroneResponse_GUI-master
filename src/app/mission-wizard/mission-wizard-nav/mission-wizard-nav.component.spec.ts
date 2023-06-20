import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MissionWizardNavComponent } from './mission-wizard-nav.component';

describe('MissionWizardNavComponent', () => {
  let component: MissionWizardNavComponent;
  let fixture: ComponentFixture<MissionWizardNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MissionWizardNavComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MissionWizardNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
