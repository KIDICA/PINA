import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { PinaAlertService } from '../../../services';
import { PinaAlertTypesAware } from 'src/app/core/modules/pina-alert/pina-alert.enum';

@Component({
    selector: 'app-pina-alert',
    templateUrl: 'pina-alert.component.html',
    styleUrls: ['pina-alert.component.css']
})
@PinaAlertTypesAware
export class PinaAlertComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    message: any;

    constructor(private alertService: PinaAlertService) { }

    ngOnInit() {
        this.subscription = this.alertService.getMessage().subscribe(message => {
            this.message = message;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
