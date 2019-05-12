import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {

    private horse = new Audio();

    constructor() {
        this.preload(this.horse, '../../../assets/sounds/horse_nay.mp3');
    }

    playHorseSound() {
        this.horse.play();
    }

    private preload(audioElement: HTMLAudioElement, src: string) {
        audioElement.src = src;
        audioElement.load();
    }
}
