export function getColorOleaje(oleaje: string, ionicColors?: boolean): string {
  const valor = String(oleaje);
  if (ionicColors) {
    switch (valor) {
      case '310':
        return 'success';
      case '320':
        return 'warning';
      case '330':
        return 'danger';
      default:
        return 'danger';
    }
  } else {
    switch (valor) {
      case '310':
        return 'green';
      case '320':
        return 'orange';
      case '330':
        return '#c5000f';
      default:
        return '#c5000f';
    }
  }

}

export function getColorTemperatura(temperatura: number, ionicColors?: boolean): string {
  if (ionicColors) {
    if (temperatura >= 20) return 'danger';
    if (temperatura >= 17) return 'warning';
    return 'primary';
  }
  if (temperatura >= 20) return '#c5000f';
  if (temperatura >= 17) return 'orange';
  return 'blue';
}

export function parseFecha(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  if (value instanceof Date) return value;

  if (typeof value === 'number') {
    const str = String(value);
    if (str.length === 8) return parseAaaaMmDd(str);
    return new Date(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{8}$/.test(trimmed)) return parseAaaaMmDd(trimmed);
    const fecha = new Date(trimmed);
    return isNaN(fecha.getTime()) ? null : fecha;
  }

  return null;
}

function parseAaaaMmDd(str: string): Date {
  const anio = parseInt(str.substring(0, 4), 10);
  const mes = parseInt(str.substring(4, 6), 10) - 1;
  const dia = parseInt(str.substring(6, 8), 10);
  return new Date(anio, mes, dia);
}

export function normalizeSearch(value: string | null | undefined): string {
  if (value === null || value === undefined) {
    return '';
  }
  return value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ');
}

export function fechaEsPasada(value: unknown): boolean {
  const fecha = parseFecha(value);
  if (!fecha) return false;
  fecha.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
}

export function getColorFecha(value: unknown, ionicColors?: boolean): string | null {
  if (!fechaEsPasada(value)) return null;
  return ionicColors ? 'danger' : '#c5000f';
}
