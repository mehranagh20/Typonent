import { Component, OnInit } from '@angular/core';
import {Competition} from '../competition'
import {CompetitionService} from '../competition.service'
import {CompetitionRemainingTime} from '../competition-remaining-time'
import {AuthenticationService} from '../authentication.service'
import {Router} from '@angular/router'
import {Http, Response} from "@angular/http";
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.css']
})
export class CompetitionsComponent implements OnInit {

  constructor(private compService: CompetitionService, private authenticationService: AuthenticationService, private route: Router, private http: Http) { }

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

  date_to_remaining_time(date: string, len: number) {
    // Find the distance between now an the count down date
    let distance = new Date(date).getTime() - new Date(this.current_date).getTime();


    this.upcoming_competitions[len].remaining_time.week = Math.floor(distance / (1000 * 60 * 60 * 24 * 7));
    this.upcoming_competitions[len].remaining_time.days = Math.floor((distance % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    this.upcoming_competitions[len].remaining_time.hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.upcoming_competitions[len].remaining_time.minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.upcoming_competitions[len].remaining_time.second = Math.floor((distance % (1000 * 60)) / 1000);
  }

  json_to_competition(js) {
    return new Competition(js['name'], js['start_time'], js['duration'], js['user_registered_number'], js['max_competitors']
      , new CompetitionRemainingTime(0, 0, 0, 0, 0), false, "");
  }

  link_to_local_time(date: string) {
    let d = new Date(date);
    let link = "https://www.timeanddate.com/worldclock/fixedtime.html?day=" + d.getUTCDate() +
      "&month=" + d.getUTCMonth() + "&year=" + d.getUTCFullYear() + "&hour=" + d.getUTCHours() +
        "&min=" + d.getUTCMinutes() + "&sec=" + d.getUTCSeconds();
    return link;
  }

  load_up_comp() {
    this.compService.get_upcomming_competitions(this.upcomingNum).subscribe(
      data => {
        for(let js of data['list']) {
          this.upcoming_competitions.push(this.json_to_competition(js));
          this.date_to_remaining_time(js['start_time'], this.upcoming_competitions.length - 1);

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
    for(let cmp of this.upcoming_competitions) {
      if (cmp.remaining_time.days == 0 && cmp.remaining_time.week == 0 && !cmp.has_expired) {
        cmp.remaining_time.second--;
        if (cmp.remaining_time.second < 0) {
          cmp.remaining_time.second = 59;
          cmp.remaining_time.minute--;
          if (cmp.remaining_time.minute < 0) {
            cmp.remaining_time.minute = 59;
            cmp.remaining_time.hour--;
            if (cmp.remaining_time.hour < 0) cmp.has_expired = true;
          }
        }

      }

      if(cmp.has_expired) {cmp.time_representation = "expired!";}
      else if(cmp.remaining_time.week > 0)
        cmp.time_representation = cmp.remaining_time.week + " Week" + (cmp.remaining_time.week > 1 ? "s" : "");
      else if(cmp.remaining_time.days > 0)
        cmp.time_representation = cmp.remaining_time.days + " Day" + (cmp.remaining_time.days > 1 ? "s" : "");
      else
        cmp.time_representation = String("0" + cmp.remaining_time.hour).slice(-2) + ":" + String("0" + cmp.remaining_time.minute).slice(-2) + ":" + String("0" + cmp.remaining_time.second).slice(-2);
    }
  }

  ngOnInit() {

    this.upcomingNum = 0;
    this.pastNum = 0;

    this.cur_date();

    setInterval(() => this.update_time(), 1000);

  }

}
