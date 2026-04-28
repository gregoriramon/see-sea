import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'viento',
  standalone: true
})
export class VientoPipe implements PipeTransform {
  private readonly vientoMap: { [key: string]: string } = {
    '210': 'Flojo',
    '220': 'Moderado',
    '230': 'Fuerte'
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return this.vientoMap[value] || value;
  }
}
