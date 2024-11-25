import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreareventoPage } from './crearevento.page';

describe('CreareventoPage', () => {
  let component: CreareventoPage;
  let fixture: ComponentFixture<CreareventoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CreareventoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
