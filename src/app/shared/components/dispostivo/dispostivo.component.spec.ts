import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DispostivoComponent } from './dispostivo.component';

describe('DispostivoComponent', () => {
  let component: DispostivoComponent;
  let fixture: ComponentFixture<DispostivoComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    imports: [IonicModule.forRoot(), DispostivoComponent]
}).compileComponents();

    fixture = TestBed.createComponent(DispostivoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
