import { Component, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { filter, map } from 'rxjs/operators';
import { NavigationEnd, Router } from '@angular/router';
import { untilDestroyed, UntilDestroy } from '@ngneat/until-destroy';
import { SharedFunctionsService } from './services/shared-functions.service';
import { lastValueFrom, Observable } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  @ViewChild(MatSidenav)
  sidenav!: MatSidenav;
  isHandset$: Observable<Boolean> = this.SharedFunctionsService.isHandset$;

  constructor(public translate: TranslateService, private router: Router, private SharedFunctionsService: SharedFunctionsService) {
    translate.addLangs(['en', 'es']);
    translate.setDefaultLang('en');
  }

  //Switch language
  translateLanguageTo(lang: string) {
    this.translate.use(lang);
  }
  async ngAfterViewInit() {

    await lastValueFrom(this.router.events.pipe(untilDestroyed(this), filter((e) => e instanceof NavigationEnd), map(() => {
        if (!this.isHandset$) {
          this.sidenav.mode = 'side';
          this.sidenav.close();
        } else {
          this.sidenav.mode = 'over';
          this.sidenav.close();
        }
    })));
  }

}
