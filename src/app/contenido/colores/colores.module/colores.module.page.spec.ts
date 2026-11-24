import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ColoresModulePage } from './colores.module.page';

describe('ColoresModulePage', () => {
  let component: ColoresModulePage;
  let fixture: ComponentFixture<ColoresModulePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ColoresModulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
