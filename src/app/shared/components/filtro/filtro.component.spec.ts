import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FiltroComponent } from './filtro.component';

describe('FiltroComponent', () => {
  let component: FiltroComponent;
  let fixture: ComponentFixture<FiltroComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FiltroComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FiltroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
