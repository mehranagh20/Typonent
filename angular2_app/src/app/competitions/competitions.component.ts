import { Component, OnInit } from '@angular/core';
import {Competition} from '../competition'
import {CompetitionService} from '../competition.service'
import {CompetitionRemainingTime} from '../competition-remaining-time'
import {AuthenticationService} from '../authentication.service'
import {Router} from '@angular/router'
import {Http, Response} from "@angular/http";
import {MdSnackBar} from '@angular/material'
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.css']
})
export class CompetitionsComponent implements OnInit {

  constructor(private compService: CompetitionService,
              private authenticationService: AuthenticationService,
              private route: Router, private http: Http, private snackBar: MdSnackBar) { }

  upcomingNum = 0; // number of loaded upcoming competitions from server.
  pastNum = 0; // number of loaded past competitions from server.
  past_competitions = [];
  upcoming_competitions = [];
  current_date: string;



  cur_date() {
    let date: string;
    this.http.get(this.authenticationService.url + 'getdate').map((res: Response) => res.json()).subscribe(
      data => {
        this.current_date = data['date'];

        // now that current_time is set up we load the competitions.
        this.load_up_comp();
        this.load_past_comp();
      },
      error => {
        console.log("error getting current time from server");
        this.current_date = String(new Date().getTime());
      }
    );
  }

  json_to_competition(js) {
    return new Competition(js['id'], js['name'], js['start_time'], js['duration'], js['user_registered_number'], js['max_competitors']
      , new CompetitionRemainingTime(0, 0, 0, 0, 0), false, "", js['registration_time'], new CompetitionRemainingTime(0, 0, 0, 0, 0), "", false, js['registered']);
  }

  load_up_comp() {
    this.compService.get_upcomming_competitions(this.upcomingNum).subscribe(
      data => {
        for(let js of data['list']) {
          this.upcoming_competitions.push(this.json_to_competition(js));
          this.upcoming_competitions[this.upcoming_competitions.length - 1].date_to_remaining_time(this.current_date);
          // console.log(this.upcoming_competitions[this.upcoming_competitions.length - 1].remaining_time)

        }
        this.upcomingNum += data['numbers'];
      },
      error => {
        console.log(error);
      }
    );
  }

  load_past_comp() {
    this.compService.get_past_competitions(this.pastNum).subscribe(
      data => {
        for(let js of data['list'])
          this.past_competitions.push(this.json_to_competition(js));
        this.pastNum += data['numbers'];
      },
      error => {
        console.log(error);
      }
    )
  }

  update_time() {
    for(let i = 0; i < this.upcoming_competitions.length; i++)
      this.upcoming_competitions[i].update_time();
  }

  register_competition(id: number) {
    this.http.get(this.authenticationService.url + "registerComp/" + id).map((res: Response) => res.json())
      .subscribe(
        data => {
          if(data['status'] == 200) {
            this.openSnackBar(data['message'], "Successful");
            for(let c of this.upcoming_competitions)
              if(c.id == id) c.is_registered = 1;
          }
          else {
            this.openSnackBar(data['message'], "Failed");
          }
        },
        error => {
          console.log(error);
          this.openSnackBar("Problem Communicating With Server", "Failed");

        }
      );
  }

  openSnackBar(message: string, status: string) {
    this.snackBar.open(message, status, {
      duration: 4000,
    });
  }

  ngOnInit() {

    this.upcomingNum = 0;
    this.pastNum = 0;

    this.cur_date();

    setInterval(() => this.update_time(), 1000);

  }

}
