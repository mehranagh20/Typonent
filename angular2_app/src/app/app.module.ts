import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy} from '@angular/http';
import {CookieService} from 'angular2-cookie/core';
import {MaterialModule} from '@angular/material'

import {AppRouterModule} from './app.routes'
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import {AuthenticationService} from './authentication.service';
import { CompetitionsComponent } from './competitions/competitions.component';
import {CompetitionService} from './competition.service';

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
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    AppRouterModule,

  ],
  providers: [
    AuthenticationService, CookieService,
    { provide: XSRFStrategy, useValue: new CookieXSRFStrategy('csrftoken', 'X-CSRFToken') },
    CompetitionService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
