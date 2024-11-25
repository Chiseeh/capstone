import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetaileventosadmPage } from './detaileventosadm.page';

describe('DetaileventosadmPage', () => {
  let component: DetaileventosadmPage;
  let fixture: ComponentFixture<DetaileventosadmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DetaileventosadmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
