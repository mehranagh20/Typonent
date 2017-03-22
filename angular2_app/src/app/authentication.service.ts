import { Injectable } from '@angular/core';
import {CookieService} from 'angular2-cookie/core';
import { HttpModule, XSRFStrategy, CookieXSRFStrategy, Headers, Response, Http} from '@angular/http';
import 'rxjs/add/operator/map'

@Injectable()
export class AuthenticationService {
  url: string = "http://127.0.0.1:8000/";
  redirectUrl: string;

  constructor(private http: Http, private cookieService: CookieService, private csrf: XSRFStrategy) { }

  register(email: string, username: string, password: string) {
    return this.http.post(this.url + "register/", JSON.stringify({email: email, username: username, password: password}), {withCredentials: true})
      .map((response: Response) => response.json());
  }

  login(email: string, password: string) {
    let header = new Headers();
    let c = this.cookieService.getAll();
    console.log(c);
    return this.http.post(this.url + "login/", JSON.stringify(({email: email, password: password})))
      .map((response: Response) => response.json());
  }

  is_user_logged_in() {
    return localStorage.getItem('user');
  }

}
