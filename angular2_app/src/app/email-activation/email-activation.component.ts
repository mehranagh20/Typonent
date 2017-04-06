import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router'
import {AuthenticationService} from '../authentication.service'
import {MdSnackBar} from '@angular/material'

@Component({
  selector: 'app-email-activation',
  templateUrl: './email-activation.component.html',
  styleUrls: ['./email-activation.component.css']
})
export class EmailActivationComponent implements OnInit {

  constructor(private route: ActivatedRoute, private authService: AuthenticationService, private router: Router, private snackbar: MdSnackBar) { }

  data: string;
  emailPat: string = "^[_a-z0-9]+(\.[_a-z0-9]+)*@[a-z0-9-]+(\.[a-z0-9-]+)*(\.[a-z]{2,4})$";

  send_request(id: string, hash: string) {
    this.authService.activate(id, hash).subscribe(
      data => {
        if(data['status'] == 200)
          this.router.navigate(['login']);
        else this.data = data['message'];
      },
      error => {
        console.log(error);
        this.snackbar.open("Error", "Problem communicating with server, check connection", {duration: 5000});
      }
    );
  }

  ngOnInit() {
    this.data = "please wait...";

    this.route.params.map((param: Params) => param).subscribe(
      data => {
        this.send_request(data['id'], data['hash']);
      },
      error => {
        console.log(error);
        this.snackbar.open("Error", "Problem with url provided, wrong link", {duration: 5000});
      }
    );
  }

}
