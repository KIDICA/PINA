import {Component, OnInit} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {Router} from '@angular/router';
import {take} from 'rxjs/operators';
import { FaceTrainingService } from '@app/services';
import { PlayersState } from '@app/services/players.state';
import { RecognitionPersonComponent } from '../recognition-person';

@Component({
  templateUrl: 'training.component.html',
  styleUrls: ['training.component.css']
})
export class TrainingComponent implements OnInit {

  constructor(
    private faceTrainingService: FaceTrainingService,
    private currentPlayers: PlayersState,
    private router: Router
  ) {}

  runCircleFillAnimation = false;

  public ngOnInit() {

    console.log('TrainingComponent', this.currentPlayers);

    if (!this.currentPlayers.trainingNeeded) {

      this.done();

    } else {

      this.runCircleFillAnimation = true;
      this.faceTrainingService.beginPersonGroupTraining(
        RecognitionPersonComponent.personGroupId,
        this.done,
        this.working
      );

    }
  }

  private done = () => {
    this.runCircleFillAnimation = false;
    this.currentPlayers.reset();
    this.router.navigate(['person']);
  }

  private working = () => {
    // I don't care
  }

}
