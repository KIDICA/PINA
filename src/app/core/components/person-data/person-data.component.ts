import { Component, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PersonData } from '../../model';


@Component({
  selector: 'app-person-data',
  templateUrl: 'person-data.component.html',
  styleUrls: ['person-data.component.css']
})
export class PersonDataComponent {

  hideComponent = false;

  personData = new FormGroup({
    name: new FormControl('Falk'),
    age: new FormControl('29')
  });

  @Output() personDataEmitter = new EventEmitter<PersonData>();

  onSubmit() {
    const personData = new PersonData();
    personData.age = this.personData.value.age;
    personData.name = this.personData.value.name;
    this.personDataEmitter.emit(personData);
  }

  toggleVisibility() {
    this.hideComponent = !this.hideComponent;
  }
}
