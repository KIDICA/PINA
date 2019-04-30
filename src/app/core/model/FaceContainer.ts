import { TouchSequence } from "selenium-webdriver";

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

  static readonly UNKNOWN = 'unknown';

  // key == faceId
  private rectangles: Map<string, Rectangle> = new Map();
  private candidates: Map<string, Candidate> = new Map();
  private ages: Map<string, number> = new Map();
  private genders: Map<string, string> = new Map();
  private emotions: Map<string, string> = new Map();

  // key == personId
  private names: Map<string, string> = new Map();

  private static bestCandidate(object) {
    return object.candidates.sort((a, b) => a.confidence > b.confidence)[0];
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

  addAge(response) {
    const faceId: string = response.faceId;
    const age: number = response.faceAttributes.age;
    console.log('adding age', faceId, age);
    this.ages.set(faceId, age);
  }

  addGender(response) {
    const faceId: string = response.faceId;
    const gender: string = response.faceAttributes.gender;
    console.log('adding gender', faceId, gender);
    this.genders.set(faceId, gender);
  }

  addEmotions(response) {
    const faceId: string = response.faceId;
    const emotions: string = this.buildEmotions(response.faceAttributes.emotion);
    console.log('adding emotions', faceId, emotions);
    this.emotions.set(faceId, emotions);
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
      canvas.strokeRect(rectangle.left, rectangle.top, rectangle.width, rectangle.height);
      canvas.fillText(this.determineName(faceId), rectangle.left + rectangle.width + 5, rectangle.top + 25);
      canvas.fillText(this.determineAge(faceId), rectangle.left + rectangle.width + 5, rectangle.top + 50);
      canvas.fillText(this.determineGender(faceId), rectangle.left + rectangle.width + 5, rectangle.top + 75);
    });
  }

  // TODO
  public magic() {
    return this.getFaceIds().map(faceId => {
      return {
          faceId: faceId,
          personId: this.candidates.has(faceId) ? this.candidates.get(faceId).personId : FaceContainer.UNKNOWN,
          name: this.determineName(faceId),
          rectangle: this.rectangles.get(faceId)
        };
      }
    );
  }

  // TODO
  getAllEmotions(): Map<string, string> {
    return this.emotions;
  }



  private determineName(faceId: string): string {
    if (this.candidates.has(faceId)) {
      const personId = this.candidates.get(faceId).personId;
      if (this.names.has(personId)) {
        return this.names.get(personId);
      }
    }
    return FaceContainer.UNKNOWN;
  }

  private determineAge(faceId: string): string {
    if (this.ages.has(faceId)) {
      return this.ages.get(faceId).toString();
    }
    return FaceContainer.UNKNOWN;
  }

  private determineGender(faceId: string): string {
    if (this.genders.has(faceId)) {
      return this.genders.get(faceId);
    }
    return FaceContainer.UNKNOWN;
  }

  private buildEmotions(emotions): string {
    return 'anger: ' + Math.round(emotions.anger * 100) +
      ' | contempt: ' + Math.round(emotions.contempt * 100) +
      ' | disgust: ' + Math.round(emotions.disgust * 100) +
      ' | fear: ' + Math.round(emotions.fear * 100) +
      ' | happiness: ' + Math.round(emotions.happiness * 100) +
      ' | neutral: ' + Math.round(emotions.neutral * 100) +
      ' | sadness: ' +  + Math.round(emotions.sadness * 100) +
      ' | surprise: ' + Math.round(emotions.surprise * 100);
  }

}
