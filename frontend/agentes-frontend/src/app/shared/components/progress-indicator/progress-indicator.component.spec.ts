import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressIndicatorComponent } from './progress-indicator.component';
import { ProgressItem } from './progress-indicator.component';

function createKeyboardEvent(key: string): KeyboardEvent {
  return {
    key,
    preventDefault: jasmine.createSpy('preventDefault'),
    stopPropagation: jasmine.createSpy('stopPropagation'),
  } as unknown as KeyboardEvent;
}

describe('ProgressIndicatorComponent', () => {
  let component: ProgressIndicatorComponent;
  let fixture: ComponentFixture<ProgressIndicatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressIndicatorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressIndicatorComponent);
    component = fixture.componentInstance;
  });

  it('should move focus to the next enabled step on keyboard navigation', () => {
    const items: ProgressItem[] = [
      { label: 'Primeiro', state: 'complete' },
      { label: 'Segundo', state: 'disabled' },
      { label: 'Terceiro', state: 'incomplete' },
    ];
    component.items = items;
    fixture.detectChanges();

    const event = createKeyboardEvent('ArrowRight');
    component.onKeydown(event);

    expect(component.focusedIndex).toBe(2);
    expect((event.preventDefault as jasmine.Spy)).toHaveBeenCalled();
    expect((event.stopPropagation as jasmine.Spy)).toHaveBeenCalled();
  });
});
