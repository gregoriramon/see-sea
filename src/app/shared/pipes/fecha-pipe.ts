import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'fecha',
  standalone: true,
})
export class FechaPipe implements PipeTransform {

  transform(value: unknown): string {
    if (value === null || value === undefined || value === '') return '';

    const fecha = this.parsear(value);
    if (!fecha || isNaN(fecha.getTime())) return String(value);

    const dia = String(fecha.getDate()).padStart(2, '0');
    const mes = String(fecha.getMonth() + 1).padStart(2, '0');
    const anio = fecha.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  private parsear(value: unknown): Date | null {
    if (value instanceof Date) return value;

    if (typeof value === 'number') {
      const str = String(value);
      if (str.length === 8) return this.parseAaaaMmDd(str);
      return new Date(value);
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (/^\d{8}$/.test(trimmed)) return this.parseAaaaMmDd(trimmed);
      return new Date(trimmed);
    }

    return null;
  }

  private parseAaaaMmDd(str: string): Date {
    const anio = parseInt(str.substring(0, 4), 10);
    const mes = parseInt(str.substring(4, 6), 10) - 1;
    const dia = parseInt(str.substring(6, 8), 10);
    return new Date(anio, mes, dia);
  }
}
