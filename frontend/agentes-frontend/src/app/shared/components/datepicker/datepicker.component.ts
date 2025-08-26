import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-datepicker',
  standalone: true,
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.scss'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgClass],
})
export class DatepickerComponent implements OnInit, OnDestroy {
  @Input() label = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() showTime = false;
  @Input() showTimezone = false;
  @Input() errorMessage?: string;
  @Input() warningMessage?: string;

  @Output() dateChange = new EventEmitter<Date>();
  @Output() timeChange = new EventEmitter<string>();
  @Output() timezoneChange = new EventEmitter<string>();

  form!: FormGroup;
  calendarOpen = false;

  currentMonth!: number;
  currentYear!: number;
  weeks: Date[][] = [];
  selectedDate: Date | null = null;

  readonly timezones = ['UTC', 'GMT-3', 'Eastern Time (ET)'];

  private clickListener = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.datepicker-wrapper')) {
      this.closeCalendar();
    }
  };

  private monthFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  });
  weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });
  weekdayNames = Array.from({ length: 7 }, (_, i) =>
    this.weekdayFormatter.format(new Date(2020, 5, i + 1))
  );

  isToday(day: Date): boolean {
  const today = new Date();
  return day.getDate() === today.getDate() &&
         day.getMonth() === today.getMonth() &&
         day.getFullYear() === today.getFullYear();
}

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [{ value: '', disabled: this.disabled }, Validators.required],
      time: [{ value: '', disabled: this.disabled }],
      timezone: [{ value: this.timezones[0], disabled: this.disabled }],
    });

    const today = new Date();
    this.currentMonth = today.getMonth();
    this.currentYear = today.getFullYear();
    this.generateCalendar(this.currentYear, this.currentMonth);

    document.addEventListener('click', this.clickListener);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickListener);
  }

  get dateId(): string {
    return `${this.label}-date-input`.replace(/\s+/g, '-').toLowerCase();
  }

  get monthLabel(): string {
    return this.monthFormatter.format(
      new Date(this.currentYear, this.currentMonth, 1)
    );
  }

  openCalendar(): void {
    if (!this.disabled) {
      this.calendarOpen = true;
    }
  }

  closeCalendar(): void {
    this.calendarOpen = false;
  }

  selectDate(day: Date): void {
    if (day.getMonth() !== this.currentMonth) return;
    this.selectedDate = day;
    const formatted = this.formatDate(day);
    this.form.get('date')?.setValue(formatted);
    this.dateChange.emit(day);
    this.closeCalendar();
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar(this.currentYear, this.currentMonth);
  }

  onTimeChange(): void {
    const value = this.form.get('time')?.value;
    this.timeChange.emit(value);
  }

  onTimezoneChange(): void {
    const value = this.form.get('timezone')?.value;
    this.timezoneChange.emit(value);
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (!this.calendarOpen) return;
    const prevent = () => event.preventDefault();

    switch (event.key) {
      case 'Escape':
        this.closeCalendar();
        prevent();
        break;
      case 'ArrowLeft':
        this.moveSelection(-1);
        prevent();
        break;
      case 'ArrowRight':
        this.moveSelection(1);
        prevent();
        break;
      case 'ArrowUp':
        this.moveSelection(-7);
        prevent();
        break;
      case 'ArrowDown':
        this.moveSelection(7);
        prevent();
        break;
      case 'PageUp':
        this.prevMonth();
        prevent();
        break;
      case 'PageDown':
        this.nextMonth();
        prevent();
        break;
      case 'Enter':
        if (this.selectedDate) this.selectDate(this.selectedDate);
        prevent();
        break;
    }
  }

  private moveSelection(days: number): void {
    const base =
      this.selectedDate || new Date(this.currentYear, this.currentMonth, 1);
    const newDate = new Date(base);
    newDate.setDate(base.getDate() + days);
    this.currentMonth = newDate.getMonth();
    this.currentYear = newDate.getFullYear();
    this.generateCalendar(this.currentYear, this.currentMonth);
    this.selectedDate = newDate;
  }

  private generateCalendar(year: number, month: number): void {
    const first = new Date(year, month, 1);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay());
    const weeks: Date[][] = [];
    let current = new Date(start);

    for (let w = 0; w < 6; w++) {
      const week: Date[] = [];
      for (let d = 0; d < 7; d++) {
        week.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
    }
    this.weeks = weeks;
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  }
}
