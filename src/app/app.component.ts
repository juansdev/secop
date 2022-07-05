import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatSidenav } from '@angular/material/sidenav';
import { delay, filter, map } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SharedFunctionsService } from './services/shared-functions.service';
import { lastValueFrom, Observable } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;

  constructor(private observer: BreakpointObserver, private router: Router, private SharedFunctionsService: SharedFunctionsService) {}

  isHandset$: Observable<boolean> = this.SharedFunctionsService.isHandset$;

  async ngAfterViewInit() {
    await lastValueFrom(this.observer.observe(Breakpoints.Handset).pipe(delay(1), untilDestroyed(this), map((res: any) => {
        if (!res.matches) {
          this.sidenav.mode = 'side';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'over';
        }
      }
    )));

    await lastValueFrom(this.router.events.pipe(untilDestroyed(this), filter((e) => e instanceof NavigationEnd), map(() => {
      if (this.sidenav.mode === 'over') {
        this.sidenav.close();
      }
    })));
  }

}
