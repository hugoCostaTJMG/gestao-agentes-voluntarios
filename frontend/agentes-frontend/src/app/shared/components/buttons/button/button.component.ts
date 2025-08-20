import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-button',
  standalone: true,
  imports: [NgClass, NgIf, RouterLink],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements OnInit {
  @Input() label: string = '';
  @Input() type: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled: boolean = false;
  @Input() iconLeft?: string;
  @Input() iconRight?: string;
  @Input() buttonType: 'button' | 'submit' | 'reset' = 'button';
  @Input() routerLink?: string | any[];
  @Input() ariaLabel?: string; 

  @Output() clicked = new EventEmitter<Event>();

  ngOnInit(): void {
    console.log('👉 iconLeft recebido:', this.iconLeft);
  }

  onClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      return;
    }
    this.clicked.emit(event);
  }
}
