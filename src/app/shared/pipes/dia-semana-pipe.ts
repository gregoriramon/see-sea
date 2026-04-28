import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'diaSemana'
})
export class DiaSemanaPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    if (typeof value === 'string') {
      return this.obtenerDiaSemana (value);
    }
    return value as string;

  }

private obtenerDiaSemana(fechaNum: unknown): string {


  // 1. Convertimos a string por si viene como número
  const fechaStr = String(fechaNum);

  // 2. Validamos que tenga la longitud esperada (ej. AAAAMMDD = 8 caracteres)
  if (!fechaStr || fechaStr.length < 8) {
    return '';
  }
  const año = parseInt(fechaStr.substring(0, 4));
  const mes = parseInt(fechaStr.substring(4, 6)) - 1;
  const dia = parseInt(fechaStr.substring(6, 8));

  const fecha = new Date(año, mes, dia);

  // Retornamos el nombre del día en español con la primera letra en mayúscula
  const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'short' });

  return diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1).toLowerCase() + " " + dia;
}

}
