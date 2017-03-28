import { Injectable } from '@angular/core';
import {CookieService} from 'angular2-cookie/core';
import {XSRFStrategy, Response, Http} from '@angular/http';
import 'rxjs/add/operator/map'
import {Observable} from "rxjs";
import {Competition} from './competition'

@Injectable()
export class CompetitionService {
  url: string = "http://127.0.0.1:8000/";
  competition: Competition;

  constructor(private http: Http, private cookieService: CookieService, private csrf: XSRFStrategy) { }

  get_upcomming_competitions(num: number) {
    return this.http.get(this.url + 'upcomingComps/' + num).map((res: Response) => res.json());
  }

  get_past_competitions(num: number) {
    return this.http.get(this.url + 'pastComps/' + num).map((res: Response) => res.json());
  }

  get_competition(id: string) {
    return this.http.get(this.url + 'getcompetition/' + id).map((res: Response) => res.json());
  }

  cur_date() {
    return this.http.get(this.url + 'getdate').map((res: Response) => res.json());
  }

  start_competition(id: number) {
    return this.http.get(this.url + 'startcompetition/' + id).map((res: Response) => res.json());
  }

  send_info(time: number, cor: number, wro: number, tot: number, id: number, finished: boolean) {
    return this.http.post(this.url + "recieveinfo/", JSON.stringify({'time': time, 'correct': cor, 'wrong': wro, 'total': tot, 'id': id, 'finished': finished}))
      .map((res: Response) => res.json());
  }


}
