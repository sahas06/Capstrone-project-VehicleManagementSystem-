import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LoadingService } from './services/loading.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MatProgressSpinnerModule, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('VehicleUI');

  constructor(public loadingService: LoadingService, private router: Router) {
    this.router.events.subscribe(() => {
      if (!localStorage.getItem('token')) {
        history.pushState(null, '', location.href);
      }
    });
  }
}
