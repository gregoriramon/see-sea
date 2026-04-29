import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaPronosticoComponent } from './tabla-pronostico.component';

describe('TablaPronosticoComponent', () => {
  let component: TablaPronosticoComponent;
  let fixture: ComponentFixture<TablaPronosticoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TablaPronosticoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TablaPronosticoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
