import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {PinaAlertService} from 'src/app/core/modules/pina-alert/pina-alert.service';
import {PinaAlertComponent} from 'src/app/core/modules/pina-alert/pina-alert.component';

@NgModule({
  imports: [CommonModule],
  declarations: [
    PinaAlertComponent
  ],
  providers: [PinaAlertService],
  exports: [PinaAlertComponent]
})
export class PinaAlertModule {}
