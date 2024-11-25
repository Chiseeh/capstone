import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocalesAdmPage } from './localesadm.page';

describe('LocalesadmPage', () => {
  let component: LocalesAdmPage;
  let fixture: ComponentFixture<LocalesAdmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LocalesAdmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
