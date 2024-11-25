import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoticiasAdmPage } from './noticiasadm.page';

describe('NoticiasadmPage', () => {
  let component: NoticiasAdmPage;
  let fixture: ComponentFixture<NoticiasAdmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NoticiasAdmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
