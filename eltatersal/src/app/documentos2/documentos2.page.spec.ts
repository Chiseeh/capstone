import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Documentos2Page } from './documentos2.page';

describe('Documentos2Page', () => {
  let component: Documentos2Page;
  let fixture: ComponentFixture<Documentos2Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Documentos2Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
