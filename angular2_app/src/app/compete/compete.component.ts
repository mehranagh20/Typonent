import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router'
import {CompetitionService} from '../competition.service'
import {Competition} from '../competition';
import {CompetitionRemainingTime} from '../competition-remaining-time'
import 'rxjs/add/operator/map'
import {min} from "rxjs/operator/min";
import {timeInterval} from "rxjs/operator/timeInterval";
import {MdDialog, MdSnackBar} from '@angular/material'
import {WaitingToStartComponent} from '../waiting-to-start/waiting-to-start.component'
import {setInterval} from "timers";
import {clearInterval} from "timers";

@Component({
  selector: 'app-compete',
  templateUrl: './compete.component.html',
  styleUrls: ['./compete.component.css']
})
export class CompeteComponent implements OnInit {

  constructor(private competitionService: CompetitionService, private dialog: MdDialog, private snackbar: MdSnackBar) { }

  @ViewChild('box') el: ElementRef;
  started: boolean;
  can_start: boolean;
  finished: boolean;
  time_passed = 0;
  competition: Competition;
  interval_id: any;
  correct_num: number; // number of correct characters
  wrong_num: number; // number of wrong characters

  next_wpm: number;
  next_name: string;
  my_rank: number;
  my_wpm: number;
  max_wpm: number;

  snack_bar_showed: boolean;

  text = [];
  typed: string;
  correct_words = [];
  total_keystrokes: number;
  index: number;
  line_char_count = [];
  which_line_to_start = [];
  real_text: string;
  start_line: number;
  gap_start_line: number;

  check(event: any) {
    event.preventDefault();
    event.stopPropagation();
  }

  key_pressed() {
    this.total_keystrokes++;

    if(this.typed.length <= this.real_text.length) {
      this.cal_correct_wrong_words();
      this.my_wpm = (((this.typed.length / 5) - this.wrong_num) * 60) / this.time_passed;
      this.index = this.typed.length;
      this.start_line = this.which_line_to_start[this.index];
    }

  }

  cal_correct_wrong_words() {
    for(let i = this.index; i < this.typed.length; i++) {
      if(i == 0) this.correct_words[0] = this.typed[0] == this.real_text[0];
      else
        this.correct_words[i] = this.correct_words[i - 1] + (this.typed[i] == this.real_text[i]);
    }
    this.correct_num = this.correct_words[this.typed.length - 1];
    this.wrong_num = this.typed.length - this.correct_words[this.typed.length - 1];
  }

  current_class (ind: number) {
    return ind == this.index;
  }

  wrong_class(ind: number, txt: string) {
    if(ind >= this.index) return false;
    return txt[ind] != this.real_text[ind];
  }

  correct_class(ind: number, txt: string) {
    if(ind >= this.index) return false;
    return txt[ind] == this.real_text[ind];
  }

  get_text() {
    this.index = 0;

    this.competitionService.start_competition(this.competition.id).subscribe(
      data => {
        if(data['status'] == 200) {
          console.log(data['text']);
          this.real_text = data['text'];
          let tmp = this.real_text.split('\n');
          this.text = [];
          for (let line of tmp) {
            this.text.push([]);
            let i = 0;
            let str = "";
            while (line[i] == ' ') {
              str += ' ';
              i++;
            }
            this.text[this.text.length - 1] = [str, line.substring(i, line.length - 1)];
          }

          this.real_text = this.text[0][1];
          for(let i = 1; i < this.text.length; i++) {
            this.real_text += '\n' + this.text[i][1];
          }

          // after loading text :
          this.line_char_count = [0];
          for (let e of this.text) {
            this.line_char_count.push(this.line_char_count[this.line_char_count.length - 1] + e[1].length + 1)
          }
          for(let i = 0; i < this.real_text.length; i++) this.correct_words[i] = 0;
          this.cal_line_to_show();
          console.log(this.real_text);
          this.started = true;
          this.open_dialog();
        }
        else
          this.snackbar.open(data['message'], "Failed", {duration:4000});
      },
      error => {console.log('error communicating with server!')}
    );


  }

  cal_line_to_show() {
    let last = this.line_char_count.length - 1;

    for(let i = 0; i < this.gap_start_line; i++) {
      if(i >= last) continue;
      for(let j = this.line_char_count[i]; j < this.line_char_count[i + 1]; j++)
        this.which_line_to_start[j] = 0;
    }

    for(let i = this.gap_start_line; i < last - this.gap_start_line; i++) {
      for (let j = this.line_char_count[i]; j < this.line_char_count[i + 1]; j++)
        this.which_line_to_start[j] = i - (this.gap_start_line - 1);
    }

    for(let i = last - this.gap_start_line; i < last; i++) {
      for (let j = this.line_char_count[i]; j < this.line_char_count[i + 1]; j++)
        this.which_line_to_start[j] = last - 2 * this.gap_start_line;
    }
  }

  start_competition() {
    if(this.competition.has_expired) {
      this.competition.time_representation = "Starting...";
      clearInterval(this.interval_id);
      this.get_text();
    }
    this.competition.update_time();

    if(this.competition.remaining_time.days <= 0 && this.competition.remaining_time.week <= 0 &&
      this.competition.remaining_time.hour <= 0 && this.competition.remaining_time.minute <= 0
        && this.competition.remaining_time.second <= 10 && !this.snack_bar_showed) {
      this.snack_bar_showed = true;
      this.snackbar.open("Competition Is Starting", "Get Ready", {
        duration: (this.competition.remaining_time.second * 1000)
      });
    }
  }

  start_sooner() {
    console.log(this.competition.has_expired);
    this.competition.has_expired = true;
    console.log(this.competition.has_expired);
  }

  before_start() {
    if(this.competition.has_expired) {
      this.competition.has_expired = false;
      clearInterval(this.interval_id);
      this.can_start = true;
      this.interval_id = setInterval(()=>this.start_competition(), 1000);
      this.competitionService.cur_date().subscribe(
        date => {
          this.competition.remaining_time = this.competition.date_to_remaining_time(date['date'], this.competition.competition_close_time);
          this.competition.update_time();
        }, error => {console.log('error getting date from server')}
      );
    }
    this.competition.update_time();
  }

  triger_time() {
    this.competitionService.cur_date().subscribe(
      data => {
        this.competition.time_representation = "00:00:00";
        this.competition.remaining_time = this.competition.date_to_remaining_time(data['date'], this.competition.start_time);
        this.interval_id = setInterval(() => this.before_start(), 1000);
        this.competition.message_for_finish = "Starting...";
      },
      error => {
        console.log('error communicating with server!')
      }
    );
  }

  send_info(finished: boolean) {
    this.competitionService.send_info(this.time_passed, this.correct_num, this.wrong_num, this.total_keystrokes, this.competition.id, finished)
      .subscribe(
        data => {
          data['my_rank'] = this.my_rank;
          this.next_name = data['next_name'];
          this.my_rank = data['rank'];
          this.next_wpm = data['next_wpm'];
          this.max_wpm = data['max_wpm'];
        },
        error => {console.log(error + 'problem sendin and recieving wpm info!')}
      );
  }

  pass_competition() {
    this.time_passed++;
    if(this.competition.duration == this.time_passed) {
      clearInterval(this.interval_id);
      this.finished = true;
      this.snackbar.open("Competition Has Ended", "WPM=" + this.my_wpm, {duration: 4000});
    }
    this.cal_correct_wrong_words();
    this.my_wpm = (((this.typed.length / 5) - this.wrong_num) * 60) / this.time_passed;
    this.send_info(this.finished);
  }

  open_dialog() {
    let ref = this.dialog.open(WaitingToStartComponent, {
      position: 'center'
    });
    ref.afterClosed().subscribe(
      data => {
        this.el.nativeElement.focus();
        this.interval_id = setInterval(()=>this.pass_competition(), 1000);
      }
    );
  }

  ngOnInit() {
    this.snack_bar_showed = false;
    this.can_start = false;
    this.started = false;
    this.finished = false;
    this.competition = this.competitionService.competition;
    this.triger_time();

    this.gap_start_line = 2; // shows after what line number text div will scroll down

    this.typed = "";



    this.start_line = 0;
    this.total_keystrokes = 0;

  }

}
