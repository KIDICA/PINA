import {Injectable, ElementRef} from '@angular/core';
import { Rectangle } from '@app/core/model';

/* !!! ATTENTION !!! Results are flipped at y Axis !!! */
export class PlayerPositionService {

  constructor(
    private canvasElm: ElementRef
  ) {}

  public isRightPlayerRectangle(rectangle: Rectangle) {
    return rectangle.left + rectangle.width < this.getLeftPlayerFieldOfPlayWidth();
  }

  public isLeftPlayerRectangle(rectangle: Rectangle) {
    return this.getLeftPlayerFieldOfPlayWidth() < rectangle.left;
  }

  public isRightPlayerResponse(singleFaceResponse) {
    return singleFaceResponse.faceRectangle.left + singleFaceResponse.faceRectangle.width < this.getLeftPlayerFieldOfPlayWidth();
  }

  public isLeftPlayerResponse(singleFaceResponse) {
    return this.getLeftPlayerFieldOfPlayWidth() < singleFaceResponse.faceRectangle.left;
  }

  public getLeftPlayerFieldOfPlayWidth(): number {
    return this.canvasElm.nativeElement.width / 2;
  }

}
