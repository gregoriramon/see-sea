import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'oleaje',
  standalone: true
})
export class OleajePipe implements PipeTransform {
  private readonly oleajeMap: { [key: string]: string } = {
    '310': 'Débil',
    '320': 'Moderado',
    '330': 'Fuerte'
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }
    return this.oleajeMap[value] || value;
  }
}
