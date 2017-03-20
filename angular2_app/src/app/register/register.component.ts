import {Component, OnInit, Input} from '@angular/core';
import {User} from '../user'
import {AuthenticationService} from '../authentication.service'
import {userInfo} from "os";
import {Http, Response} from "@angular/http";
import {Routes, Router} from '@angular/router'
import {forEach} from "@angular/router/src/utils/collection";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  user: User = new User();
  emailPat: string = "^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$";
  emailErrors = [];
  passErrors = [];
  usernameErrors = [];
  globErrors = [];
  isAlreadyLoggedIn: boolean;
  loading: boolean;


  constructor(private authenticationService: AuthenticationService, private http: Http, private route: Router) {}

  doregister() {
    this.loading = true;

    this.authenticationService.register(this.user.email, this.user.username, this.user.password).subscribe(
      data => {
        if(data['status'] == 200) {
          //localStorage.setItem('user', JSON.stringify({'email': data['email'], 'username': data['username']}));
          this.route.navigate(['/login']);
        }
        else {
          this.clearErrors();
          for (let key in data) {
            for (let er of data[key]) {
              if (key == 'email') this.emailErrors.push(er);
              else if (key == 'username') this.usernameErrors.push(er);
              else if (key == 'password') this.passErrors.push(er);
            }
          }
        }
        this.loading = false;
      },
      errors => {
        this.loading = false;
        this.clearErrors();
        this.globErrors = ['Problem Communicating With Server!!'];
      }
    );
  }

  setcol(name: any) {
    if(name.valid) return "primary";
    return "warn";
  }

  clearErrors() {
    this.emailErrors = [];
    this.passErrors = [];
    this.usernameErrors = [];
    this.globErrors = [];
  }

  ngOnInit() {
    let user = localStorage.getItem('user');
    if(user)
      this.route.navigate(['/']);
    else this.isAlreadyLoggedIn = false;
  }

}
