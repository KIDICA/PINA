import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService, PlayerService, SoundService, RCCarService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, interval} from 'rxjs';
import {TranslateService} from '@ngx-translate/core';
import {Router} from '@angular/router';
import { take } from 'rxjs/operators';
import { AzureVisionFaceApiService } from '@app/services/azureVisionFaceApi.service';
import { PlayersState } from '@app/misc/players.state';
import { RecognitionPersonComponent } from '../recognition-person';
import { PlayerPositionService } from '@app/services/player.position.service';
import { ConfigurationState } from '@app/misc/configuration.state';
import { ElementResizeUtility } from '@app/misc/element.resize.utility';

@Component({
  templateUrl: 'recognition.emotion.component.html',
  styleUrls: ['../../../assets/css/global.css', 'recognition.emotion.component.css']
})
export class RecognitionEmotionComponent implements OnInit {

  @ViewChild('video') private videoElm: ElementRef;
  @ViewChild('canvas') private canvasElm: ElementRef;

  /*
  @ViewChild('leftContainer') private leftContainer: ElementRef;
  */

  private readonly images = [
    '/assets/images/emoji_happy_large.png',
    '/assets/images/emoji_angry_large.png',
    '/assets/images/emoji_sad_large.png'
  ];

  private readonly overlayTopMessages = [
    'PHASE ONE',
    'PHASE TWO',
    'PHASE THREE'
  ];

  private readonly overlayMiddleMessages = [
    'PREPARE TO LOOK HAPPY',
    'PREPARE TO LOOK ANGRY',
    'PREPARE TO LOOK SAD'
  ];

  private readonly overlayBottomMessages = [
    'GAME STARTS IN',
    'GAME CONTINUES IN',
    'GAME CONTINUES IN'
  ];

  private readonly messages = [
    'LOOK HAPPY',
    'LOOK ANGRY',
    'LOOK SAD'
  ];

  private overlaySubscription;
  private gameSubscription;
  private playerPositionService: PlayerPositionService;

  rightGaugeValues: number[] = new Array();
  leftGaugeValues: number[] = new Array();
  rightScore: number;
  leftScore: number;
  currentState: number;
  countDownValue: number;
  hideOverlay: boolean;
  hideScore: boolean;
  hideGame: boolean;
  runCircleFillAnimation: boolean;
  areMultipleCamerasAvailable: boolean;

  constructor(
    private configService: ConfigService,
    private alertService: PinaAlertService,
    private rtcService: RTCService,
    private currentPlayers: PlayersState,
    private translateService: TranslateService,
    private spinner: NgxSpinnerService,
    private router: Router,
    private faceApiService: AzureVisionFaceApiService,
    private playerService: PlayerService,
    private configurationState: ConfigurationState,
    private soundService: SoundService,
    private rcCarService: RCCarService
  ) { }

  private reset() {
    this.rightGaugeValues = new Array();
    this.leftGaugeValues = new Array();
    this.rightScore = 0;
    this.leftScore = 0;
    this.currentState = 0;
    this.countDownValue = 5;
    this.hideOverlay = true;
    this.hideScore = true;
    this.hideGame = true;
    this.runCircleFillAnimation = false;
    this.areMultipleCamerasAvailable = false;
  }

  private initSuccess = () => {
    this.hideSpinnerWithDelay(1000).finally(() => {
      this.alertService.success(this.translateService.instant('views.home.messages.applicationSuccessfullyInitialized'));
      this.areMultipleCamerasAvailable = this.rtcService.getNumberOfAvailableCameras() > 1;
      this.playerPositionService = new PlayerPositionService(this.canvasElm);
      this.reset();
      this.launchOverlaySubscriber();
      ElementResizeUtility.resizeAllElements(this.videoElm, 'radial-gauge', 12);
    });
  }

  private handleError = error => {
    this.alertService.error(error);
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    this.spinner.hide();
  }

  private launchOverlaySubscriber() {
    this.hideGame = true;
    this.hideOverlay = false;
    this.hideScore = true;
    this.runCircleFillAnimation = false;
    this.countDownValue = 5;
    this.soundService.playChangePhase();
    this.rcCarService.accelerate(this.configurationState.rcCar1Uri, 1);
    this.overlaySubscription = interval(1000).pipe(take(5)).subscribe(
      (value) => { this.countDownValue--; },
      this.handleError,
      () => {
        this.overlaySubscription.unsubscribe();
        this.launchGameSubscriber();
      }
    );
  }

  private launchScoreSubscriber() {
    this.countDownValue = 5;
    this.hideGame = true;
    this.hideOverlay = true;
    this.hideScore = false;
    this.mayUpdateHighScores();
    this.rcCarService.stop(this.configurationState.rcCar1Uri);
    this.overlaySubscription = interval(1000).pipe(take(5)).subscribe(
      (value) => this.countDownValue--,
      this.handleError,
      () => {
        this.overlaySubscription.unsubscribe();
        this.adoptCurrentHighScores();
        this.reset();
        this.router.navigate(['highscore']);
      }
    );
  }

  private launchGameSubscriber() {
    this.hideGame = false;
    this.hideOverlay = true;
    this.hideScore = true;
    this.runCircleFillAnimation = true;
    this.rightGaugeValues = [];
    this.leftGaugeValues = [];
    this.soundService.playRaceStart();
    this.gameSubscription = interval(1000).pipe(take(10)).subscribe(
      this.gameLogic,
      this.handleError,
      () => {
        this.soundService.playRaceEnd();
        this.gameSubscription.unsubscribe();
        if (this.currentState === 2) {
          this.launchScoreSubscriber();
        } else {
          this.currentState++;
          this.launchOverlaySubscriber();
        }
      }
    );
  }

  private gameLogic = (value) => {
    this.rtcService.takeSnapshot(this.videoElm, this.canvasElm)
      .then(image => this.faceApiService.detectFaces(image).toPromise())
      .then((response: any[]) => {

        if (this.gameSubscription === undefined || this.gameSubscription.closed) {
          return;
        }

        let score = this.determineScore(response, true);
        this.rcCarService.accelerate(this.configurationState.rcCar1Uri, score);
        this.leftScore += score;
        this.leftGaugeValues.push(score);

        score = this.determineScore(response, false);
        this.rightScore += score;
        this.rightGaugeValues.push(score);
    });
  }

  private calculateMedian(numbers: number[]) {
    let sum = 0;
    if (numbers === undefined || numbers.length < 1) {
      return sum;
    }
    numbers.forEach(number => sum = sum + number);
    return Math.ceil(sum / numbers.length);
  }

  private determineScore(response: any[], isLeftPlayer: boolean) {

    // happy
    if (this.currentState === 0) {
      const emotion = this.extractEmotion(response, isLeftPlayer);
      return emotion === undefined ? 0 : Math.ceil(emotion.happiness * 100);
    }

    // angry
    if (this.currentState === 1) {
      const emotion = this.extractEmotion(response, isLeftPlayer);
      return emotion === undefined ? 0 : Math.ceil(emotion.anger * 100);
    }

    // sad
    if (this.currentState === 2) {
      const emotion = this.extractEmotion(response, isLeftPlayer);
      return emotion === undefined ? 0 : Math.ceil(emotion.sadness * 100);
    }

    return 0;
  }

  private extractEmotion(response: any[], isLeftPlayer: boolean) {
    if (response !== undefined && response['length'] > 0) {
      for (const r of response) {

        if (isLeftPlayer && this.playerPositionService.isLeftPlayerResponse(r)) {
          return r.faceAttributes.emotion;
        }

        if (!isLeftPlayer && this.playerPositionService.isRightPlayerResponse(r)) {
          return r.faceAttributes.emotion;
        }
      }
    }
    return undefined;
  }

  private mayUpdateHighScores() {

    if (this.leftScore > this.currentPlayers.currentPlayerOne.score) {
      this.currentPlayers.currentPlayerOne.score = this.leftScore;
      this.playerService.updatePlayer(RecognitionPersonComponent.personGroupId, this.currentPlayers.currentPlayerOne)
        .then(t => console.log('updated score for player 1'));
    }

    if (this.rightScore > this.currentPlayers.currentPlayerTwo.score) {
      this.currentPlayers.currentPlayerTwo.score = this.rightScore;
      this.playerService.updatePlayer(RecognitionPersonComponent.personGroupId, this.currentPlayers.currentPlayerTwo)
        .then(t => console.log('updated score for player 2'));
    }

  }

  private adoptCurrentHighScores() {
    this.currentPlayers.currentPlayerOne.score = this.leftScore;
    this.currentPlayers.currentPlayerTwo.score = this.rightScore;
  }

  private initCameraStream() {
    this.rtcService.stopAllCurrentlyRunningStreams(this.videoElm);
    return Observable.create((observable) => {
      this.rtcService.createVideoDeviceStream(this.configurationState.selectedVideoDeviceId).then((stream) => {
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

  private determineBarHeight(score: number) {
    let temp = score === undefined || score === 0 ? 1 : Math.max(score, 1);
    temp = Math.max(1, (temp / 2000) * 50);
    return temp;
  }

  ngOnInit() {
    this.spinner.show();
    forkJoin([this.configService.isConfigInitialized(), this.initCameraStream()]).subscribe(this.initSuccess, this.handleError);
  }

  emotionOverlay() {
    return {
      'image': this.images[ this.currentState ],
      'topMessage': this.overlayTopMessages[ this.currentState ],
      'middleMessage': this.overlayMiddleMessages[ this.currentState ],
      'bottomMessage': this.overlayBottomMessages[ this.currentState ]
    };
  }

  scoreOverlay() {
    return {
      'headline': 'achieved scores',
      'playerOne': this.currentPlayers.currentPlayerOne.name,
      'scorePlayerOne': this.leftScore,
      'playerTwo': this.currentPlayers.currentPlayerTwo.name,
      'scorePlayerTwo': this.rightScore,
      'bottomMessage': 'embrace the high scores in',
      'playOneIsWinner': this.leftScore >= this.rightScore,
      'playTwoIsWinner': this.rightScore >= this.leftScore
    };
  }

  gameOverlay() {
    return {
      'image': this.images[ this.currentState ],
      'message': this.messages[ this.currentState ],
      'playerOne': this.currentPlayers.currentPlayerOne.name,
      'playerTwo': this.currentPlayers.currentPlayerTwo.name,
      'scorePlayerOne': this.leftScore,
      'scorePlayerTwo': this.rightScore,
      'leftGaugeValue': this.calculateMedian(this.leftGaugeValues),
      'rightGaugeValue': this.calculateMedian(this.rightGaugeValues),
      'leftBarHeight': this.determineBarHeight(this.rightScore),
      'rightBarHeight': this.determineBarHeight(this.leftScore)
    };
  }

}
