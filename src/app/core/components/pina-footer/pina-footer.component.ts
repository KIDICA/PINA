import {Component} from '@angular/core';

@Component({
  selector: 'app-pina-footer',
  templateUrl: 'pina-footer.component.html',
  styleUrls: ['pina-footer.component.css']
})
export class PinaFooterComponent {

  constructor() {
  }

  getCurrentYear(): string {
    return new Date().getFullYear().toString();
  }

}
