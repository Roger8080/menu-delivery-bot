import { ViaCEPResponse } from '@/types';

export async function fetchAddressByCEP(cep: string): Promise<ViaCEPResponse | null> {
  try {
    // Remove caracteres não numéricos
    const cleanCEP = cep.replace(/\D/g, '');
    
    if (cleanCEP.length !== 8) {
      throw new Error('CEP deve conter 8 dígitos');
    }

    const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ViaCEPResponse = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return data;
  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    return null;
  }
}

export function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length <= 5) {
    return cleaned;
  }
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`;
}

export function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 2) {
    return cleaned;
  }
  
  if (cleaned.length <= 7) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  }
  
  if (cleaned.length <= 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  }
  
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7, 11)}`;
}