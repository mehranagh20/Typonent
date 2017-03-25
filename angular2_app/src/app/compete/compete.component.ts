import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router'
import {CompetitionService} from '../competition.service'
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-compete',
  templateUrl: './compete.component.html',
  styleUrls: ['./compete.component.css']
})
export class CompeteComponent implements OnInit {

  constructor(private competitionService: CompetitionService) { }

  ngOnInit() {
    console.log(this.competitionService.competition);
  }

}
