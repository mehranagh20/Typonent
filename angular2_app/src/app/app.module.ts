import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';
import {CookieService} from 'angular2-cookie/core';
import {MaterialModule} from '@angular/material';
import {AccordionModule} from 'primeng/primeng';     //accordion and accordion tab
// import {MenuItem} from 'primeng/primeng';            //api

import {DataTableModule, MenuItem} from 'primeng/primeng';

import {AppRouterModule} from './app.routes'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {AuthenticationService} from './authentication.service';
import { CompetitionsComponent } from './competitions/competitions.component';
import {CompetitionService} from './competition.service';
import {AuthGuardService} from './auth-guard.service'

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LoginComponent,
    RegisterComponent,
    LoginComponent,
    CompetitionsComponent,

  ],
  imports: [
    AccordionModule,
    DataTableModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppRouterModule,

  ],
  providers: [
    AuthGuardService,
    AuthenticationService, CookieService,
    { provide: XSRFStrategy, useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken') },
    CompetitionService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
