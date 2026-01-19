/**
 * Utility functions for Brazilian formatting (dates, phone, currency, etc.)
 */

/**
 * Format date to Brazilian format (DD/MM/YYYY)
 */
export const formatDateBR = (date: string | Date): string => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Format datetime to Brazilian format (DD/MM/YYYY HH:mm)
 */
export const formatDateTimeBR = (date: string | Date): string => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Format time to Brazilian format (HH:mm)
 */
export const formatTimeBR = (date: string | Date): string => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(d.getTime())) return '';

    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
};

/**
 * Format phone number to Brazilian format
 * (11) 99999-9999 or (11) 9999-9999
 */
export const formatPhoneBR = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 11) {
        // Mobile: (11) 99999-9999
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
    } else if (cleaned.length === 10) {
        // Landline: (11) 9999-9999
        return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    }

    return phone;
};

/**
 * Format CEP to Brazilian format (99999-999)
 */
export const formatCEP = (cep: string): string => {
    if (!cep) return '';

    const cleaned = cep.replace(/\D/g, '');

    if (cleaned.length === 8) {
        return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
    }

    return cep;
};

/**
 * Format currency to Brazilian Real (R$ 1.234,56)
 */
export const formatCurrencyBR = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    }).format(value);
};

/**
 * Format CPF (999.999.999-99)
 */
export const formatCPF = (cpf: string): string => {
    if (!cpf) return '';

    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length === 11) {
        return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
    }

    return cpf;
};

/**
 * Format CNPJ (99.999.999/9999-99)
 */
export const formatCNPJ = (cnpj: string): string => {
    if (!cnpj) return '';

    const cleaned = cnpj.replace(/\D/g, '');

    if (cleaned.length === 14) {
        return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12)}`;
    }

    return cnpj;
};

/**
 * Get relative time in Portuguese (há 5 minutos, há 2 horas, etc.)
 */
export const getRelativeTimeBR = (date: string | Date): string => {
    if (!date) return '';

    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) return 'agora mesmo';
    if (diffMin < 60) return `há ${diffMin} minuto${diffMin > 1 ? 's' : ''}`;
    if (diffHour < 24) return `há ${diffHour} hora${diffHour > 1 ? 's' : ''}`;
    if (diffDay < 7) return `há ${diffDay} dia${diffDay > 1 ? 's' : ''}`;
    if (diffDay < 30) return `há ${Math.floor(diffDay / 7)} semana${Math.floor(diffDay / 7) > 1 ? 's' : ''}`;
    if (diffDay < 365) return `há ${Math.floor(diffDay / 30)} mês${Math.floor(diffDay / 30) > 1 ? 'es' : ''}`;

    return `há ${Math.floor(diffDay / 365)} ano${Math.floor(diffDay / 365) > 1 ? 's' : ''}`;
};

/**
 * Validate CPF
 */
export const isValidCPF = (cpf: string): boolean => {
    const cleaned = cpf.replace(/\D/g, '');

    if (cleaned.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleaned)) return false; // All same digits

    let sum = 0;
    let remainder;

    for (let i = 1; i <= 9; i++) {
        sum += parseInt(cleaned.substring(i - 1, i)) * (11 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(9, 10))) return false;

    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum += parseInt(cleaned.substring(i - 1, i)) * (12 - i);
    }

    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleaned.substring(10, 11))) return false;

    return true;
};

/**
 * Convert date from DD/MM/YYYY to YYYY-MM-DD (for input[type="date"])
 */
export const dateToISO = (dateBR: string): string => {
    if (!dateBR) return '';

    const parts = dateBR.split('/');
    if (parts.length !== 3) return '';

    const [day, month, year] = parts;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
};

/**
 * Convert date from YYYY-MM-DD to DD/MM/YYYY
 */
export const dateFromISO = (dateISO: string): string => {
    if (!dateISO) return '';

    const parts = dateISO.split('-');
    if (parts.length !== 3) return '';

    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
};
