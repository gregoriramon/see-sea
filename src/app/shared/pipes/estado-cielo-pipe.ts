import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'estadoCielo',
  standalone: true
})
export class EstadoCieloPipe implements PipeTransform {
  private readonly estadoCieloMap: { [key: string]: string } = {
    '100': 'Despejado',
    '110': 'Nuboso',
    '120': 'Muy nuboso',
    '130': 'Chubascos',
    '140': 'Muy nuboso con lluvia',
    '-126': 'Chubascos',
    '-116':'Muy nuboso con lluvia',
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return this.estadoCieloMap[value] || value;
  }
}
