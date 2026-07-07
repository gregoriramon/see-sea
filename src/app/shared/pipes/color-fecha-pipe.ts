import { Pipe, PipeTransform } from '@angular/core';
import { getColorFecha } from '../utils/templateUtils';

@Pipe({
  name: 'colorFecha',
  standalone: true,
})
export class ColorFechaPipe implements PipeTransform {
  transform(value: unknown, ionicColors?: boolean): string | null {
    return getColorFecha(value, ionicColors);
  }
}
