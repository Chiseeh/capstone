import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TiposervicioPage } from './tiposervicio.page';

describe('TiposervicioPage', () => {
  let component: TiposervicioPage;
  let fixture: ComponentFixture<TiposervicioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TiposervicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
