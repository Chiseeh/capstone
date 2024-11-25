import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsuariosAdmPage } from './usuariosadm.page';

describe('UsuariosadmPage', () => {
  let component: UsuariosAdmPage;
  let fixture: ComponentFixture<UsuariosAdmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(UsuariosAdmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
