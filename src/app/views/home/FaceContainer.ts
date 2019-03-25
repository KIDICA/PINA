import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {PinaAlertService, ConfigService} from '@app/services';
import {RTCService} from '@app/services/rtc.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {Observable, forkJoin, timer, interval, identity} from 'rxjs';
import {AzureVisionFaceApiService} from '@app/services/azureVisionFaceApi.service';
import {TranslateService} from '@ngx-translate/core';
import {environment} from '@environments/environment';
import {takeUntil, take} from 'rxjs/operators';
import { TrainingComponent } from '../training';
import { stringify } from '@angular/core/src/util';

export class Rectangle {

  height: number;
  width: number;
  top: number;
  left: number;

  static create(object): Rectangle {
    const output: Rectangle = new Rectangle();
    output.height = object.height;
    output.width = object.width;
    output.top = object.top;
    output.left = object.left;
    return output;
  }
}

export class Candidate {

  confidence: number;
  personId: string;

  static create(object): Candidate {
    const output: Candidate = new Candidate();
    output.confidence = object.confidence;
    output.personId = object.personId;
    return output;
  }
}

export class FaceContainer {

  // key == faceId
  private rectangles: Map<string, Rectangle> = new Map();

  // key == faceId
  private candidates: Map<string, Candidate> = new Map();

  // key == personId
  private names: Map<string, string> = new Map();

  private static bestCandidate(object) {
    return object.candidates.sort((a,b) => a.confidence > b.confidence)[0];
  }

  clear() {
    this.rectangles.clear();
    this.candidates.clear();
    this.names.clear();
    console.log('cleaning');
  }

  getFaceIds(): string[] {
    const output: string[] = new Array<string>();
    this.rectangles.forEach((v, k) => output.push(k));
    return output;
  }

  getPersonIds(): string[] {
    const output: string[] = new Array<string>();
    this.candidates.forEach((v, k) => output.push(v.personId));
    return output;
  }

  addRectangle(response) {
    const faceId: string = response.faceId;
    const rectangle: Rectangle = Rectangle.create(response.faceRectangle);
    console.log('adding face', faceId, rectangle);
    this.rectangles.set(faceId, rectangle);
  }

  addCandidates(response) {
    if (response.candidates.length > 0) {
      const faceId: string = response.faceId;
      const bestCandidate: Candidate = Candidate.create(FaceContainer.bestCandidate(response));
      console.log('adding candidate', faceId, bestCandidate);
      this.candidates.set(faceId, bestCandidate);
    }
  }

  addName(response) {
    const personId: string = response.personId;
    const name: string = response.name;
    console.log('adding name', personId, name);
    this.names.set(personId, name);
  }

  drawNamesAndRectangles(canvas) {
    this.rectangles.forEach((rectangle: Rectangle, faceId: string) => {

      console.log('drawing', faceId, rectangle);

      // Rectangle
      canvas.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);

      // Name
      canvas.fillText(this.determineName(faceId), rectangle.left + rectangle.width + 5, rectangle.top + 15);
    });
  }

  private determineName(faceId: string): string {
    if (this.candidates.has(faceId)) {
      const personId = this.candidates.get(faceId).personId;
      if (this.names.has(personId)) {
        return this.names.get(personId);
      }
    }
    return 'unknown';
  }
}
