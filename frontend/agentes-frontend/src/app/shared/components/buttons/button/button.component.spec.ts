import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent, RouterTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit clicked event when button is pressed', () => {
    spyOn(component.clicked, 'emit');
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(component.clicked.emit).toHaveBeenCalled();
  });

  it('should set button type attribute based on buttonType input', () => {
    component.buttonType = 'submit';
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('type')).toBe('submit');
  });

  it('should bind routerLink to the button', () => {
    component.routerLink = '/home';
    fixture.detectChanges();
    const debugEl = fixture.debugElement.query(By.directive(RouterLink));
    const routerLinkInstance = debugEl.injector.get(RouterLink);
    expect(routerLinkInstance.routerLink).toBe('/home');
  });
});
