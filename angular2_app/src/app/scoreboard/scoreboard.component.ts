import {Component, OnInit, trigger, style, state, transition, animate} from '@angular/core';
import {CompetitionService} from '../competition.service';
import {ActivatedRoute, Params} from '@angular/router'
import {Involvement} from '../involvement'
import {MdSnackBar} from '@angular/material'

@Component({
  selector: 'app-scoreboard',
  templateUrl: './scoreboard.component.html',
  styleUrls: ['./scoreboard.component.css'],
  animations: [
    trigger('changed', [
      state('false', style({opacity: 1, transform: 'translateX(0)'})),
      state('true', style({opacity: 0, transform: 'translateX(-100%)'})),
      transition('0 => 1', animate('400ms')),
      transition('1 => 0', animate('600ms'))
    ]),
    trigger('changeVal', [
      state('false', style({opacity: 1, transform: 'skewY(0deg)'})),
      state('true', style({opacity: 0, transform: 'skewY(180deg)'})),
      transition('0 => 1', animate('400ms')),
      transition('1 => 0', animate('600ms'))
    ])
  ]
})
export class ScoreboardComponent implements OnInit {

  constructor(private route: ActivatedRoute, private compService: CompetitionService, private snackbar: MdSnackBar) { }

  id: number;
  my_name: string; // change color of row if is me
  invs = [];
  cols = ['Rank', 'Name', 'WPM (Word Per Minute)', 'Correct Characters', 'Wrong Characters', 'Total Keystrokes'];
  loaded: boolean;
  animation_interval_id: any;


  json_go_involver(js: any) {
    let inv = new Involvement();
    inv.name = js['name'];
    inv.rank = js['rank'];
    inv.total = js['total_keystrokes'];
    inv.correct = js['correct_char_number'];
    inv.wrong = js['wrong_char_number'];
    inv.wpm = js['wpm'];
    inv.change = false;
    return inv;
  }

  get_info() {
    this.compService.scoreboard(this.id).subscribe(
      data => {
        console.log(data);
        if(data['status'] == 200) {
          this.my_name = data['name'];

          for(let inv of data['scoreboard'])
            this.invs.push(this.json_go_involver(inv));
          this.loaded = true;

          if(!data['ended'])
            setInterval(()=>this.update_info(), 5000);
        }
        else
          console.log(data['message']);
      },
      error => {
        console.log(error);
        this.snackbar.open("Problem communicating with server, check connection", "Failed", {duration: 5000});
      }
    );
  }

  make_false() {
    clearInterval(this.animation_interval_id);
    clearInterval(this.animation_interval_id);
    for(let c of this.invs) {
      c.change = false;
      c.wpm_change = false;
      c.correct_change = false;
      c.wrong_change = false;
      c.total_change = false;
    }
  }

  update_info() {
    this.compService.scoreboard(this.id).subscribe(
      data => {
        if(data['status'] == 200) {
          for(let i = 0; i < data['scoreboard'].length; i++) {
            let inv = this.json_go_involver(data['scoreboard'][i]);

            if(i >= this.invs.length) {
              this.invs.push(inv);
              continue;
            }

            if(inv.name != this.invs[i].name) {
              this.invs[i].change = true;
              this.invs[i].name = inv.name;
              this.invs[i].rank = inv.rank;
              this.invs[i].total = inv.total;
              this.invs[i].correct = inv.correct;
              this.invs[i].wrong = inv.wrong;
              this.invs[i].wpm = inv.wpm;
            }
            else {
              if(this.invs[i].wpm != inv.wpm) this.invs[i].wpm_change = true;
              if(this.invs[i].correct != inv.correct) this.invs[i].correct_change = true;
              if(this.invs[i].wrong != inv.wrong) this.invs[i].wrong_change = true;
              if(this.invs[i].total != inv.total) this.invs[i].total_change = true;
              this.invs[i].name = inv.name;
              this.invs[i].rank = inv.rank;
              this.invs[i].total = inv.total;
              this.invs[i].correct = inv.correct;
              this.invs[i].wrong = inv.wrong;
              this.invs[i].wpm = inv.wpm;
            }
          }
          this.animation_interval_id = setInterval(()=>this.make_false(), 400);
        }
        else
          console.log(data['message']);
      },
      error => {
        console.log(error);
      }
    );
  }

  ngOnInit() {

    this.loaded = false;

    this.route.params.map((param: Params) => +param['id']).subscribe(
      id => this.id = id
    );

    this.get_info();

  }

}
