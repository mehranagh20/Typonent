import {Component, OnInit, Input} from '@angular/core';
import {User} from '../user'
import {AuthenticationService} from '../authentication.service'
import {userInfo} from "os";
import {Http, Response} from "@angular/http";
import {Routes, Router} from '@angular/router'
import {forEach} from "@angular/router/src/utils/collection";
import {MdSnackBar} from "@angular/material";

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
  notRobot: boolean;


  constructor(private authenticationService: AuthenticationService, private http: Http, private route: Router, private snackbar: MdSnackBar) {}

  doregister() {
    this.loading = true;

    this.authenticationService.register(this.user.email, this.user.username, this.user.password).subscribe(
      data => {
        if(data['status'] == 200) {
          //localStorage.setItem('user', JSON.stringify({'email': data['email'], 'username': data['username']}));
          this.snackbar.open("confirmation link will be sent to you email address", "success", {duration: 6000});
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
        console.log(errors);
        this.loading = false;
        this.clearErrors();
        this.snackbar.open("Problem getting info from server", "Failed", {duration: 5000});
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

  handle_not_robot(event: any) {
    this.http.get('https://www.google.com/recaptcha/api/siteverify?secret=' + '6LdN2RoUAAAAAKiSd_rGaLkBAx1gRb2lpZMOragt' + '&' +
      'response=' + event).map((res: Response) => res.json()).subscribe(
      data => {
        if(data['success'])
          this.notRobot = true;
        else
          this.snackbar.open("you didn't pass authentication", "Failed", {duration: 5000});
      },
      error => {
        console.log(error);
        this.snackbar.open("Problem communicating with server, check connection", "Failed", {duration: 5000});
      }
    );
  }

  ngOnInit() {
    this.notRobot = false;
    // let user = localStorage.getItem('user');
    if(this.authenticationService.is_user_logged_in())
      this.route.navigate(['/']);
    else this.isAlreadyLoggedIn = false;
  }

}
