import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuejasadmPage } from './quejasadm.page';

describe('QuejasadmPage', () => {
  let component: QuejasadmPage;
  let fixture: ComponentFixture<QuejasadmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(QuejasadmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
