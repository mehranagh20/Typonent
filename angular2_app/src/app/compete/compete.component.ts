import {Component, OnInit, ElementRef, ViewChild} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router'
import {CompetitionService} from '../competition.service'
import {Competition} from '../competition';
import 'rxjs/add/operator/map'
import {min} from "rxjs/operator/min";
import {timeInterval} from "rxjs/operator/timeInterval";
import {MdDialog, MdDialogRef} from '@angular/material'
import {WaitingToStartComponent} from '../waiting-to-start/waiting-to-start.component'

@Component({
  selector: 'app-compete',
  templateUrl: './compete.component.html',
  styleUrls: ['./compete.component.css']
})
export class CompeteComponent implements OnInit {

  constructor(private competitionService: CompetitionService, private dialog: MdDialog) { }

  @ViewChild('box') el: ElementRef;
  started: boolean;
  competition: Competition;
  interval_id: any;

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

  key_pressed() {
    this.total_keystrokes++;

    if(this.typed.length <= this.real_text.length) {
      this.cal_correct_wrong_words();
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
    console.log("correct words: " + this.correct_words[this.typed.length - 1]);
    console.log("wrong words: " + (this.typed.length - this.correct_words[this.typed.length - 1]));
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
    this.text = [["    ", 'Hi this is merhan'],["", ""], ["          ", 'Fuck you Borther'], ["", "Sample Text 1"],
      ["", "Sample Text 2"], ["", "Sample Text 3"], ["", "Sample Text 4"], ["", "Sample Text 5"], ["", "Sample Text 6"],
      ["", "Sample Text 2"], ["", "Sample Text 3"], ["", "Sample Text 4"], ["", "Sample Text 5"], ["", "Sample Text 6"]];


    // after loading text :
    this.line_char_count = [0];
    for (let e of this.text) {
      this.line_char_count.push(this.line_char_count[this.line_char_count.length - 1] + e[1].length + 1)
    }

    this.real_text = this.text[0][1];
    for (let i = 1; i < this.text.length; i++) this.real_text += '\n' + this.text[i][1];


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
    console.log('calling');
    if(this.competition.has_expired) {
      this.competition.time_representation = "Starting...";
      clearInterval(this.interval_id);
      this.started = true;
      console.log('calling');
      this.open_dialog();
    }
    this.competition.update_time();
  }

  triger_time() {
    this.competitionService.cur_date().subscribe(
      data => {
        this.competition.date_to_remaining_time(data['date']);
        this.interval_id = setInterval(() => this.start_competition(), 1000);
        this.competition.message_for_finish = "Starting...";
      },
      error => {
        console.log('error communicating with server!')
      }
    );
  }

  open_dialog() {
    let ref = this.dialog.open(WaitingToStartComponent, {
      position: 'center'
    });
    ref.afterClosed().subscribe(
      data => {
        console.log('closed');
        this.el.nativeElement.focus();
      }
    );
  }

  ngOnInit() {
    this.started = false;
    this.competition = this.competitionService.competition;
    this.triger_time();

    this.gap_start_line = 5; // shows after what line number text div will scroll down

    this.typed = "";

    this.get_text();
    this.cal_line_to_show();

    this.start_line = 0;
    this.total_keystrokes = 0;

    for(let i = 0; i < this.real_text.length; i++) this.correct_words[i] = 0;

  }

}
