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

export function parseFecha(fechaNum: string): Date {

  // 1. Convertimos a string por si viene como número
  const fechaStr = String(fechaNum);

  // 2. Validamos que tenga la longitud esperada (ej. AAAAMMDD = 8 caracteres)
  if (!fechaStr || fechaStr.length < 8) {
    return new Date();
  }
  const año = parseInt(fechaStr.substring(0, 4));
  const mes = parseInt(fechaStr.substring(4, 6)) - 1;
  const dia = parseInt(fechaStr.substring(6, 8));

  return new Date(año, mes, dia);
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

export function fechaEsPasada(fechaNum: string): boolean {
  const fecha = parseFecha(fechaNum);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
}
