import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

export type ProgressBarItemStatus = 'default' | 'success' | 'error' | 'neutral';

@Component({
  selector: 'app-progress-bar-item',
  standalone: true,
  templateUrl: './progress-bar-item.component.html',
  styleUrls: ['./progress-bar-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBarItemComponent {
  @Input() label?: string;
  @Input() value: number = 0;
  @Input() status: ProgressBarItemStatus = 'default';
  @Input() tooltip?: string;
  @Input() icon?: string;
  @Input() ariaLabel?: string;
}
