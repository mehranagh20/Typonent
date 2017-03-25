import {CompetitionRemainingTime} from './competition-remaining-time'

export class Competition {

  constructor(public id: number,
              public name: string,
              public start_time: string,
              public duration: number,
              public user_registered_number: number,
              public max_competitors: number,
              public remaining_time: CompetitionRemainingTime,
              public has_expired: boolean,
              public time_representation: string,
              public registration_time: string,
              public registration_remaining_time: CompetitionRemainingTime,
              public registration_time_representation: string,
              public registration_open: boolean,
              public is_registered: boolean

    ) {
  }


  date_to_remaining_time(current_date: string) {
    // deal with start time of competition
    // Find the distance between now an the count down date
    let distance = new Date(this.start_time).getTime() - new Date(current_date).getTime();

    this.remaining_time.week = Math.floor(distance / (1000 * 60 * 60 * 24 * 7));
    this.remaining_time.days = Math.floor((distance % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    this.remaining_time.hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.remaining_time.minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.remaining_time.second = Math.floor((distance % (1000 * 60)) / 1000);


    // deal with start registration time of competition
    distance = new Date(this.registration_time).getTime() - new Date(current_date).getTime();

    this.registration_remaining_time.week = Math.floor(distance / (1000 * 60 * 60 * 24 * 7));
    this.registration_remaining_time.days = Math.floor((distance % (1000 * 60 * 60 * 24 * 7)) / (1000 * 60 * 60 * 24));
    this.registration_remaining_time.hour = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.registration_remaining_time.minute = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.registration_remaining_time.second = Math.floor((distance % (1000 * 60)) / 1000);
  }


  update_time() {
    // deal with registration start time of competition
    if (this.registration_remaining_time.days <= 0 && this.registration_remaining_time.week <= 0 && !this.registration_open) {
      this.registration_remaining_time.second--;
      if (this.registration_remaining_time.second < 0) {
        this.registration_remaining_time.second = 59;
        this.registration_remaining_time.minute--;
        if (this.registration_remaining_time.minute < 0) {
          this.registration_remaining_time.minute = 59;
          this.registration_remaining_time.hour--;
          if (this.registration_remaining_time.hour < 0) this.registration_open = true;
        }
      }
      /**/

      if (this.registration_remaining_time.week > 0)
        this.registration_time_representation = this.registration_remaining_time.week + " Week" + (this.registration_remaining_time.week > 1 ? "s" : "");
      else if (this.registration_remaining_time.days > 0)
        this.registration_time_representation = this.registration_remaining_time.days + " Day" + (this.registration_remaining_time.days > 1 ? "s" : "");
      else
        this.registration_time_representation = String("0" + this.registration_remaining_time.hour).slice(-2) + ":" + String("0" + this.registration_remaining_time.minute).slice(-2) + ":" + String("0" + this.registration_remaining_time.second).slice(-2);
    }

      // deal with start_time of competition
      // console.log(this.remaining_time);
      if (this.remaining_time.days == 0 && this.remaining_time.week == 0 && !this.has_expired) {
        this.remaining_time.second--;
        // console.log('substractin');
        if (this.remaining_time.second < 0) {
          this.remaining_time.second = 59;
          this.remaining_time.minute--;
          if (this.remaining_time.minute < 0) {
            this.remaining_time.minute = 59;
            this.remaining_time.hour--;
            if (this.remaining_time.hour < 0) this.has_expired = true;
          }
        }
      }

      if (this.has_expired) {
        this.time_representation = "expired!";
      }
      else if (this.remaining_time.week > 0)
        this.time_representation = this.remaining_time.week + " Week" + (this.remaining_time.week > 1 ? "s" : "");
      else if (this.remaining_time.days > 0)
        this.time_representation = this.remaining_time.days + " Day" + (this.remaining_time.days > 1 ? "s" : "");
      else
        this.time_representation = String("0" + this.remaining_time.hour).slice(-2) + ":" + String("0" + this.remaining_time.minute).slice(-2) + ":" + String("0" + this.remaining_time.second).slice(-2);

  }

  link_to_local_time() {
    let d = new Date(this.start_time);
    let link = "https://www.timeanddate.com/worldclock/fixedtime.html?day=" + d.getUTCDate() +
      "&month=" + d.getUTCMonth() + "&year=" + d.getUTCFullYear() + "&hour=" + d.getUTCHours() +
      "&min=" + d.getUTCMinutes() + "&sec=" + d.getUTCSeconds();
    return link;
  }

}
