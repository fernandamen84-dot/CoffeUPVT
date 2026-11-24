import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalModulePage } from './modal.module.page';

describe('ModalModulePage', () => {
  let component: ModalModulePage;
  let fixture: ComponentFixture<ModalModulePage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ModalModulePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
