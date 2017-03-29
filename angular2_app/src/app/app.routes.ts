import {Routes, RouterModule} from '@angular/router'
import {NgModule} from '@angular/core'

import {AppComponent} from './app.component'
import {LoginComponent} from './login/login.component'
import {RegisterComponent} from './register/register.component'
import {CompetitionsComponent} from './competitions/competitions.component'
import {AuthGuardService} from './auth-guard.service'
import {CompeteComponent} from './compete/compete.component'
import {CompetitionGuardService} from './competition-guard.service';
import {ScoreboardComponent} from './scoreboard/scoreboard.component';
import {EmailActivationComponent} from './email-activation/email-activation.component';
import {ActivationLinkComponent} from './activation-link/activation-link.component';

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'competitions', canActivate: [AuthGuardService], component: CompetitionsComponent},
  {path: 'compete/:id', canActivate:[AuthGuardService, CompetitionGuardService], component: CompeteComponent},
  {path: 'scoreboard/:id', canActivate:[AuthGuardService], component: ScoreboardComponent},
  {path: 'emailactivation/:id/:hash', component: EmailActivationComponent},
  {path: 'activate', component: ActivationLinkComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRouterModule {}
