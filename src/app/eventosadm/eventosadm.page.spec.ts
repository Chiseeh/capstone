import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EventosAdmPage } from './eventosadm.page';

describe('EventosadmPage', () => {
  let component: EventosAdmPage;
  let fixture: ComponentFixture<EventosAdmPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EventosAdmPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
