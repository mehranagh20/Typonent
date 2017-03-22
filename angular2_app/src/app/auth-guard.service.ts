import { Injectable } from '@angular/core';
import {AuthenticationService} from './authentication.service'
import {Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot} from '@angular/router'

@Injectable()
export class AuthGuardService implements CanActivate {

  constructor(private authService: AuthenticationService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.check(state.url);
  }

  check(url: string) {
    if(this.authService.is_user_logged_in()) return true;

    this.authService.redirectUrl = url;
    this.router.navigate(['/login']);

    return false;
  }


}
