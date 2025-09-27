import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Homelogin } from './homelogin';

describe('Homelogin', () => {
  let component: Homelogin;
  let fixture: ComponentFixture<Homelogin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Homelogin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Homelogin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
