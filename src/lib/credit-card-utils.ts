export function validateCreditCardNumber(number: string): boolean {
  const sanitized = number.replace(/\D/g, '');
  if (!/^\d{13,19}$/.test(sanitized)) return false;

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;

  for (let i = sanitized.length - 1; i >= 0; i--) {
    let digit = parseInt(sanitized[i]);

    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
}

export function validateExpiryDate(month: string, year: string): boolean {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100; // Últimos 2 dígitos
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  const expMonth = parseInt(month);
  const expYear = parseInt(year);

  if (isNaN(expMonth) || isNaN(expYear)) return false;
  if (expMonth < 1 || expMonth > 12) return false;
  if (expYear < currentYear || expYear > currentYear + 20) return false;
  if (expYear === currentYear && expMonth < currentMonth) return false;

  return true;
}

export function validateCCV(ccv: string): boolean {
  return /^\d{3,4}$/.test(ccv);
}

export function validatePostalCode(postalCode: string): boolean {
  const sanitized = postalCode.replace(/\D/g, '');
  return /^\d{8}$/.test(sanitized);
}

export function formatCreditCardNumber(number: string): string {
  const sanitized = number.replace(/\D/g, '');
  const groups = sanitized.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

export function formatExpiryDate(month: string, year: string): string {
  const sanitizedMonth = month.replace(/\D/g, '').padStart(2, '0');
  const sanitizedYear = year.replace(/\D/g, '').padStart(2, '0');
  return `${sanitizedMonth}/${sanitizedYear}`;
}
