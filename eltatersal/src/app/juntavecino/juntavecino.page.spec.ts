import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JuntavecinoPage } from './juntavecino.page';

describe('JuntavecinoPage', () => {
  let component: JuntavecinoPage;
  let fixture: ComponentFixture<JuntavecinoPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(JuntavecinoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
