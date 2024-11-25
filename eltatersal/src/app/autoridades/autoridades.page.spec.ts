import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AutoridadesPage } from './autoridades.page';

describe('AutoridadesPage', () => {
  let component: AutoridadesPage;
  let fixture: ComponentFixture<AutoridadesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AutoridadesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
