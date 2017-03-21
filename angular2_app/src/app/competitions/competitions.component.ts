import { Component, OnInit } from '@angular/core';
import {Competition} from '../competition'
import {CompetitionService} from '../competition.service'

@Component({
  selector: 'app-competitions',
  templateUrl: './competitions.component.html',
  styleUrls: ['./competitions.component.css']
})
export class CompetitionsComponent implements OnInit {

  constructor(private compService: CompetitionService) { }

  upcomingNum = 0; // number of loaded upcoming competitions from server.
  pastNum = 0; // number of loaded past competitions from server.
  past_competitions = [];
  upcomming_competitions = [];

  json_to_competition(js) {
    return new Competition(js['name'], js['start_time'], js['duration'], js['user_registered_number'], js['max_competitors'])
  }

  load_up_comp() {
    this.compService.get_upcomming_competitions(this.upcomingNum).subscribe(
      data => {
        for(let js of data['list'])
          this.upcomming_competitions.push(this.json_to_competition(js));
        this.upcomingNum += data['numbers'];
      },
      error => {
        console.log(error);
      }
    )
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

  ngOnInit() {
    this.upcomingNum = 0;
    this.pastNum = 0;
    this.load_up_comp();
    this.load_past_comp();

  }

}
