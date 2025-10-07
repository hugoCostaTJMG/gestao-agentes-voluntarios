import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ButtonComponent } from '../../components/buttons/button/button.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent {
  title = '';
  icon = '';
  showBack = false;

  constructor(private router: Router, private route: ActivatedRoute, private location: Location) {
    // Inicializa com o snapshot atual
    this.updateFromRoute();
    // Atualiza a cada navegação
    this.router.events
      .pipe(filter((ev) => ev instanceof NavigationEnd))
      .subscribe(() => this.updateFromRoute());
  }

  private updateFromRoute(): void {
    const data = this.getDeepestData(this.route);
    this.title = data?.['title'] || '';
    this.icon = data?.['icon'] || '';
    this.showBack = !!data?.['showBack'];
  }

  private getDeepestData(activated: ActivatedRoute): any {
    let r: ActivatedRoute | null = activated;
    while (r?.firstChild) r = r.firstChild;
    return r?.snapshot?.data || {};
  }

  onBack(): void {
    this.location.back();
  }
}
