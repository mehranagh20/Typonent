import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';
import {CookieService} from 'angular2-cookie/core';
import {MaterialModule, MdSnackBar} from '@angular/material';
import {ActivatedRoute} from '@angular/router'

import {DataTableModule, MenuItem} from 'primeng/primeng';

import {AppRouterModule} from './app.routes'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {AuthenticationService} from './authentication.service';
import { CompetitionsComponent } from './competitions/competitions.component';
import {CompetitionService} from './competition.service';
import {AuthGuardService} from './auth-guard.service';
import { CompeteComponent } from './compete/compete.component'
import {CompetitionGuardService} from './competition-guard.service';
import { WaitingToStartComponent } from './waiting-to-start/waiting-to-start.component'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginComponent,
    RegisterComponent,
    LoginComponent,
    CompetitionsComponent,
    CompeteComponent,
    WaitingToStartComponent,

  ],
  imports: [
    DataTableModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppRouterModule,

  ],
  providers: [
    CompetitionGuardService,
    MdSnackBar,
    AuthGuardService,
    AuthenticationService, CookieService,

    CompetitionService,
  ],
  bootstrap: [AppComponent],

  entryComponents: [
    WaitingToStartComponent,
  ],
})
export class AppModule { }
