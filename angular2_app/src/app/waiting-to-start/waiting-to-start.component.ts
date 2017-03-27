import { Component, OnInit } from '@angular/core';
import {MdDialogRef} from '@angular/material'

@Component({
  selector: 'app-waiting-to-start',
  templateUrl: './waiting-to-start.component.html',
  styleUrls: ['./waiting-to-start.component.css']
})
export class WaitingToStartComponent implements OnInit {

  constructor(private dialogRef: MdDialogRef<WaitingToStartComponent>) { }

  value = 0;
  color = "warn";
  interval_id: any;

  update() {
    this.value += 1;
    if(this.value > 40) this.color = "accent";
    if(this.value > 80) this.color = "primary";
    if(this.value == 100) {
      this.dialogRef.close();
      clearInterval(this.interval_id);
    }
  }

  ngOnInit() {
    this.interval_id = setInterval(() => this.update(), 100);
  }

}
