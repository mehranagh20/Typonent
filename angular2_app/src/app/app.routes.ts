import {Routes, RouterModule} from '@angular/router'
import {NgModule} from '@angular/core'

import {AppComponent} from './app.component'
import {LoginComponent} from './login/login.component'
import {RegisterComponent} from './register/register.component'
import {CompetitionsComponent} from './competitions/competitions.component'
import {AuthGuardService} from './auth-guard.service'
import {CompeteComponent} from './compete/compete.component'
import {CompetitionGuardService} from './competition-guard.service'

const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'competitions', canActivate: [AuthGuardService], component: CompetitionsComponent},
  {path: 'compete/:id', canActivate:[CompetitionGuardService], component: CompeteComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRouterModule {}
