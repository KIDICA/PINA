import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {SoundService, PinaAlertService, ConfigService, FaceDetectionService, PlayerService, RCCarService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, interval, Subscription} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {FaceContainer} from '../../core/model/FaceContainer';
import {Router} from '@angular/router';
import { take } from 'rxjs/operators';
import { AzureVisionFaceApiService } from '@app/services/azureVisionFaceApi.service';
import { PlayerData } from '@app/core/model/PlayerData';
import { PlayerCreator } from './player.creator';
import { PlayersState } from '@app/misc/players.state';
import { PlayerPositionService } from '@app/services/player.position.service';
import { ConfigurationState } from '@app/misc/configuration.state';
import { refreshDescendantViews } from '@angular/core/src/render3/instructions';

@Component({
  templateUrl: 'recognition.person.component.html',
  styleUrls: ['../../../assets/css/global.css', 'recognition.person.component.css']
})
export class RecognitionPersonComponent implements OnInit {

  // TODO
  static readonly personGroupId = 'pina-test-1';

  @ViewChild('videoPerson') private videoElm: ElementRef;
  @ViewChild('canvasPerson') private canvasElm: ElementRef;

  private subscription: Subscription;
  private playerPositionService: PlayerPositionService;

  playerOne = new PlayerData();
  playerTwo = new PlayerData();
  areMultipleCamerasAvailable = false;

  constructor(
    private configService: ConfigService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private faceDetectionService: FaceDetectionService,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private playerService: PlayerService,
    private faceApiService: AzureVisionFaceApiService,
    private currentPlayers: PlayersState,
    private currentConfiguration: ConfigurationState,
    private rcCarService: RCCarService,
    private soundService: SoundService
  ) { }

  // TODO
  private recreate = () => {

    const id = RecognitionPersonComponent.personGroupId;

    this.faceApiService.deletePersonGroup(id)
      .toPromise()
      .then(() => this.faceApiService.createPersonGroup(id, id)
      .toPromise())
      .then(() => console.log('recreated'));
  }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {

      // this.recreate();
      this.soundService.playMusic();

this.rcCarService.stop(this.currentConfiguration.rcCar1Uri);

      // initialisation
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
      this.playerPositionService = new PlayerPositionService(this.canvasElm);

      // launch person recognition logic
      this.subscription = interval(1000).subscribe(val => {
        this.faceDetectionService.takeSnapshotAndDetectFaces(
          RecognitionPersonComponent.personGroupId,
          this.videoElm,
          this.canvasElm,
          this.analyzeResponse,
          this.analyzeError
        );
      });

    });
  }

  private initError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private analyzeError = (error) => {
    // TODO
  }

  private analyzeResponse = (data: FaceContainer) => {
    if (this.isAlive()) {
      this.mapFoundFaces(data);
      this.mayLearnNewFaces();
      this.mayMoveToNextPage();
    }
  }

  private mapFoundFaces(data: FaceContainer) {

    // remember state just for playing sound
    const noPlayer1FoundBefore = this.currentPlayers.currentPlayerOne.isNoPlayerFound();
    const noPlayer2FoundBefore = this.currentPlayers.currentPlayerTwo.isNoPlayerFound();

    // reset state and run new recognition
    this.currentPlayers.reset();
    this.playerOne.noPlayerFound();
    this.playerTwo.noPlayerFound();
    const faces = data.singleLineResults();

    if (faces === undefined || faces.length === 0) {

      // no faces found, nothing to do

    } else if (faces.length > 2) {

      // TODO
      this.alertService.error('more then 2 persons found');

    } else {

      faces.forEach(face => {

        if (this.playerPositionService.isLeftPlayerRectangle(face.rectangle)) {

          this.mayPlaySound(noPlayer1FoundBefore);

          // left player?
          if (face.name === FaceContainer.UNKNOWN) {
            this.playerOne.unkownPlayerFound();
          } else {
            this.playerOne.adopt(this.playerService.buildPlayerFrom(face));
            this.currentPlayers.currentPlayerOne = this.playerOne;
          }

        } else if (this.playerPositionService.isRightPlayerRectangle(face.rectangle)) {

          this.mayPlaySound(noPlayer2FoundBefore);

          // right player?
          if (face.name === FaceContainer.UNKNOWN) {
            this.playerTwo.unkownPlayerFound();
          } else {
            this.playerTwo.adopt(this.playerService.buildPlayerFrom(face));
            this.currentPlayers.currentPlayerTwo = this.playerTwo;
          }

        }
      });
    }
  }

  private mayPlaySound(noPlayerFoundBefore) {
    if (noPlayerFoundBefore) {
      this.soundService.playPlayerRecognized();
    }
  }

  private mayLearnNewFaces() {

    if (!this.playerOne.isNoPlayerFound() && !this.playerTwo.isNoPlayerFound()) {

      const playerCreator: PlayerCreator = new PlayerCreator(
        RecognitionPersonComponent.personGroupId,
        this.playerPositionService,
        this.rtcService,
        this.faceApiService,
        this.playerService);

      if (this.playerOne.isUnknownPlayerFound()) {
        playerCreator.createNewPlayerWithRandomName(this.videoElm, this.canvasElm, true, freshPlayer => {
          this.playerOne.adopt(freshPlayer);
          this.currentPlayers.currentPlayerOne.adopt(freshPlayer);
          this.currentPlayers.trainingNeeded = true;
        });
      }

      if (this.playerTwo.isUnknownPlayerFound()) {
        playerCreator.createNewPlayerWithRandomName(this.videoElm, this.canvasElm, false, freshPlayer => {
            this.playerTwo.adopt(freshPlayer);
            this.currentPlayers.currentPlayerTwo.adopt(freshPlayer);
            this.currentPlayers.trainingNeeded = true;
        });
      }
    }
  }

  private isAlive() {
    return this.subscription !== undefined && !this.subscription.closed;
  }

  private mayMoveToNextPage() {

     if (!this.playerOne.isNoPlayerFound() && !this.playerTwo.isNoPlayerFound()) {

      if (this.subscription !== undefined && !this.subscription.closed) {
        this.subscription.unsubscribe();
      }

      // wait some time, then continue
      const temp = interval(3000).pipe(take(1)).subscribe(value => {
        temp.unsubscribe();
        this.router.navigate(['intro']);
      });
    }
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.initError);
  }

  private firstVideoDeviceStream = () => {
    return this.rtcService.createVideoDeviceStream(this.currentConfiguration.selectedVideoDeviceId);
  }

  private initCameraStream() {
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    return Observable.create((observable) => {
      this.firstVideoDeviceStream().then((stream) => {
        this.videoElm.nativeElement.srcObject = stream;
        observable.next(true);
        observable.complete();
      }).catch((error) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        if (error === 'PermissionDeniedError') {
          observable.error(this.translateService.instant('view.home.messages.permissionDeniedError'));
        } else {
          observable.error(error);
        }
      });
    });
  }

  private async hideSpinnerWithDelay(ms: number) {
    await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => this.spinner.hide());
  }

}
