import { Injectable } from '@angular/core';
import {CompetitionService} from './competition.service'
import {Params,Router, ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, ActivatedRoute} from '@angular/router';
import 'rxjs/add/operator/map'
import {isNumeric} from "rxjs/util/isNumeric";
import {checkBinding} from "@angular/core/src/linker/view_utils";
import {Competition} from './competition'
import {CompetitionRemainingTime} from './competition-remaining-time'
import {Observable} from "rxjs";


@Injectable()
export class CompetitionGuardService implements CanActivate {

  constructor(private competitionService: CompetitionService, private router: Router, private route: ActivatedRoute) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    // if(route.url.length < 2 || !isNumeric(route.url[1]['path'])) return false;
    return this.check(route.url[1]['path']);
  }

  json_to_competition(js) {
    return new Competition(js['id'], js['name'], js['start_time'], js['duration'], js['max_competitors']
      , new CompetitionRemainingTime(0, 0, 0, 0, 0), false, "", js['registration_time'], new CompetitionRemainingTime(0, 0, 0, 0, 0), "", false, js['registered']);
  }

  isok = false;

  check(id: string) {
    return this.competitionService.get_competition(id).map(
      data => {
        if(data['status'] == 200) {
          this.competitionService.competition = this.json_to_competition(data);
          return true;
        }
        else {
          console.log(data);
          return false;
        }
      },
      error => {
        console.log(error);
        return false;
      }
    );
  }


}
