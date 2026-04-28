import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sensacionTermica',
  standalone: true
})
export class SensacionTermicaPipe implements PipeTransform {
  private readonly sensacionTermicaMap: { [key: string]: string } = {
    '410': 'Muy frío',
    '420': 'Frío',
    '430': 'Muy fresco',
    '440': 'Fresco',
    '450': 'Suave',
    '460': 'Calor agradable',
    '470': 'Calor moderado',
    '480': 'Calor fuerte'
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return this.sensacionTermicaMap[value] || value;
  }
}
