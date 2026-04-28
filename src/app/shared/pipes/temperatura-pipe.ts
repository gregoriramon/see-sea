import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'temperatura',
  standalone: true
})
export class TemperaturaPipe implements PipeTransform {
  transform(value: number | null | undefined): string {
    if (value === null || value === undefined) {
      return '';
    }
    return `${value}°C`;
  }
}
