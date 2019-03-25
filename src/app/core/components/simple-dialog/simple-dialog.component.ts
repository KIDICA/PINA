import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-simple-dialog',
  templateUrl: 'simple-dialog.component.html',
  styleUrls: ['simple-dialog.component.css']
})
export class SimpleDialogComponent {

  hideComponent = false;
  hideButton = false;
  message = '';

  @Output() eventEmitter = new EventEmitter<void>();

  onSubmit() {
    this.eventEmitter.emit();
  }

  toggleVisibility() {
    this.hideComponent = !this.hideComponent;
  }
}
