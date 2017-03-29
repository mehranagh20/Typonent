import { Component, OnInit } from '@angular/core';
import {MdSnackBar} from "@angular/material";
import {AuthenticationService} from '../authentication.service';

@Component({
  selector: 'app-activation-link',
  templateUrl: './activation-link.component.html',
  styleUrls: ['./activation-link.component.css']
})
export class ActivationLinkComponent implements OnInit {

  constructor(private snackbar: MdSnackBar, private autService: AuthenticationService) { }

  loading: boolean;

  send_info(email: string) {
    this.loading = true;
    this.autService.generate_link(email).subscribe(
      data => {
        this.snackbar.open("Status", data['message'], {duration:5000});
        this.loading = false;
      },
      error => {
        console.log(error);
      }
    );
  }

  ngOnInit() {
    this.loading = false;
  }

}
