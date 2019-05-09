import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SoundService {

    private horse  = new Audio();

    constructor() {
        // preload sounds
        this.horse.src = '../../../assets/sounds/horse_nay.mp3';
        this.horse.load();
    }

    playHorseSound() {
        this.horse.play();
    }
}
