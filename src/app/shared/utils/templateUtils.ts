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
        return 'red';
      default:
        return 'red';
    }
  }

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

export function fechaEsPasada(fechaNum: string): boolean {
  const fecha = parseFecha(fechaNum);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
}
