import {Injectable, ElementRef} from '@angular/core';
import { Rectangle } from '@app/core/model';

export class PlayerPositionService {

  constructor(
    private canvasElm: ElementRef
  ) {}


  public isLeftPlayerRectangle(rectangle: Rectangle) {
    return rectangle.left + rectangle.width < this.getLeftPlayerFieldOfPlayWidth();
  }

  public isRightPlayerRectangle(rectangle: Rectangle) {
    return this.getLeftPlayerFieldOfPlayWidth() < rectangle.left;
  }

  public isLeftPlayerResponse(singleFaceResponse) {
    return singleFaceResponse.faceRectangle.left + singleFaceResponse.faceRectangle.width < this.getLeftPlayerFieldOfPlayWidth();
  }

  public isRightPlayerResponse(singleFaceResponse) {
    return this.getLeftPlayerFieldOfPlayWidth() < singleFaceResponse.faceRectangle.left;
  }

  public getLeftPlayerFieldOfPlayWidth(): number {
    return this.canvasElm.nativeElement.width / 2;
  }
}
