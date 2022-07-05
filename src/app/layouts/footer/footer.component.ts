import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {

  year_now: number = new Date().getFullYear();

  constructor() { }

  ngOnInit(): void {
  }

}
