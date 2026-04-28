import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'uvMax',
  standalone: true
})
export class UvMaxPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return `${value}`;
  }
}
