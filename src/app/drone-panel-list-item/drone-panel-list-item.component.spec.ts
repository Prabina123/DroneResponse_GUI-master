import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DronePanelListItemComponent } from './drone-panel-list-item.component';

describe('DronePanelListItemComponent', () => {
  let component: DronePanelListItemComponent;
  let fixture: ComponentFixture<DronePanelListItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ DronePanelListItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DronePanelListItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
