import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should render and compute total pages', () => {
    component.totalItems = 95;
    component.pageSize = 10;
    component.page = 1;
    fixture.detectChanges();
    expect(component.totalPages).toBe(10);
    expect(component.navItems.length).toBeGreaterThan(0);
  });

  it('should emit pageChange when goTo is called', () => {
    component.totalItems = 50;
    component.pageSize = 10;
    component.page = 1;
    fixture.detectChanges();
    let emitted: number | undefined;
    component.pageChange.subscribe(p => emitted = p);
    component.goTo(2);
    expect(emitted).toBe(2);
  });
});

