import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearNoticiasPage } from './crear-noticias.page';

describe('CrearNoticiasPage', () => {
  let component: CrearNoticiasPage;
  let fixture: ComponentFixture<CrearNoticiasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CrearNoticiasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
