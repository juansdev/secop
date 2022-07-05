import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeeDataComponent } from './see-data.component';

describe('SeeDataComponent', () => {
  let component: SeeDataComponent;
  let fixture: ComponentFixture<SeeDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeeDataComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SeeDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
