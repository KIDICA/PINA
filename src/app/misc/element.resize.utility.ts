import { ElementRef } from '@angular/core';

export class ElementResizeUtility {

    static resizeAllElements(parent: ElementRef, tagName: string, percent: number) {
        const gauges = document.getElementsByTagName(tagName);
        const size = this.calculateWidth(parent, percent);
        for (let i = 0; i < gauges.length; i++) {
          gauges.item(i).setAttribute('width', size);
          gauges.item(i).setAttribute('height', size);
        }
      }

    private static calculateWidth(parent: ElementRef, percent: number) {
        return ((parent.nativeElement.clientWidth / 100) * percent).toString();
    }
}
