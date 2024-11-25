import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReportesadmPage } from './reportesadm.page';

describe('ReportesadmPage', () => {
  let component: ReportesadmPage;
  let fixture: ComponentFixture<ReportesadmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesadmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
