import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {

    private changePhase = new Audio();
    private playerRecognized = new Audio();
    private raceStart = new Audio();
    private raceEnd = new Audio();
    private music = undefined;

    constructor() {
        this.preload(this.changePhase, '../../../assets/sounds/270341__littlerobotsoundfactory__pickup-04.wav');
        this.preload(this.playerRecognized, '../../../assets/sounds/270304__littlerobotsoundfactory__collect-point-00.wav');
        this.preload(this.raceStart, '../../../assets/sounds/270333__littlerobotsoundfactory__jingle-win-00.wav');
        this.preload(this.raceEnd, '../../../assets/sounds/270330__littlerobotsoundfactory__jingle-achievement-01.wav');
    }

    private preload(audioElement: HTMLAudioElement, src: string) {
        audioElement.src = src;
        audioElement.load();
    }

    playChangePhase() {
        this.changePhase.play();
    }

    playPlayerRecognized() {
        this.playerRecognized.play();
    }

    playRaceStart() {
        this.raceStart.play();
    }

    playRaceEnd() {
        this.raceEnd.play();
    }

    playMusic() {
        if (this.music === undefined) {
            this.music = new Audio();
            this.music.src = '../../../assets/sounds/Platformer2.mp3';
            this.music.loop = true;
            this.music.volume = 0.5;
            this.music.play();
        }
    }

    stopMusic() {
        this.music.pause();
        this.music.currentTime = 0;
    }

}
