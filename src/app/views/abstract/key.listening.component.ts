import {HostListener} from '@angular/core';
import {ConfigurationState} from '@app/misc/configuration.state';

export abstract class KeyListeningComponent {

  constructor(
    protected currentConfiguration: ConfigurationState
  ) { }

  @HostListener('window:keydown', ['$event'])
  private onKeyDown(event) {
    if (this.currentConfiguration.pressKeyToContinue) {
      this.handleKeyDown(event);
    }
  }

  abstract handleKeyDown(event);

}
