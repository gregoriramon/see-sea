import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DiasPrevisonComponent } from './dias-previson.component';

describe('DiasPrevisonComponent', () => {
  let component: DiasPrevisonComponent;
  let fixture: ComponentFixture<DiasPrevisonComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DiasPrevisonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DiasPrevisonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
