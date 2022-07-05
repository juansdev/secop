import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtensionPanelComponent } from './extension-panel.component';

describe('ExtensionPanelComponent', () => {
  let component: ExtensionPanelComponent;
  let fixture: ComponentFixture<ExtensionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtensionPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtensionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
