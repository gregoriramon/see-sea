export function getColorOleaje(oleaje: string, ionicColors?: boolean): string {
  console.log('Valor recibido:', oleaje, 'Tipo:', typeof oleaje);
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
