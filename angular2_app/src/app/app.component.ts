import {Component, OnInit, Input} from '@angular/core';
import {Router} from '@angular/router'
import {User} from './user'
import {Http, Response, RequestOptions} from "@angular/http";
import 'rxjs/add/operator/map'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  loggedIn = false;
  user: User;
  title = 'app works!';

  constructor(private router: Router, private http: Http){}

  url = "http://127.0.0.1:8000/";


  logout() {
    localStorage.removeItem('user');

    this.http.get(this.url + 'logout/').map((response: Response) => response.json())
      .subscribe(data => console.log(data));

    this.router.navigate(['/']);
    location.reload();
  }

  ngOnInit() {
    this.http.get(this.url + 'ping/12/', {withCredentials: true}).map((response: Response) => response.json()).subscribe(
      data => {
        console.log(data);
      },
      error => {
        console.log(error);
      }
    );
    this.user = new User();
    let user = localStorage.getItem('user');
    if(user) {
      this.loggedIn = true;
      let json = JSON.parse(user);
      this.user.username = json['username'];
      this.user.email = json['email'];
    }
    else this.loggedIn = false;
  }
}
