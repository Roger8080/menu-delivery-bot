// Serviços para integração com Google Sheets
import { Product, Condiment, ProductCondimentAssociation, Order, OrderProduct } from '@/types';

const SPREADSHEET_ID = '1fRdDkV20wU-GpLzjTq_acxjvxjVpc8NT9el5g77Z84s';
const API_KEY = 'AIzaSyD9OvGMECsCrV6uZw-XHIU8y4PQ7ydjkKs';

const BASE_URL = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values`;

// Função utilitária para fazer requisições à API do Google Sheets
async function fetchSheetData(range: string) {
  try {
    const response = await fetch(`${BASE_URL}/${range}?key=${API_KEY}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error(`Erro ao buscar dados da planilha (${range}):`, error);
    throw error;
  }
}

// Função para converter string de valor para número
function parsePrice(priceString: string | number): number {
  if (typeof priceString === 'number') return priceString;
  const cleaned = priceString.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

// Buscar produtos da planilha
export async function fetchProducts(): Promise<Product[]> {
  try {
    const rows = await fetchSheetData('Produtos!A2:G1000');
    
    return rows.map((row: string[]) => ({
      id: row[0] || '',
      id_produto: row[1] || '',
      titulo: row[2] || '',
      descricao: row[3] || '',
      valor: parsePrice(row[4] || '0'),
      categoria: row[5] || '',
      link_imagem: row[6] || ''
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Buscar condimentos da planilha
export async function fetchCondiments(): Promise<Condiment[]> {
  try {
    const rows = await fetchSheetData('Condimentos!A2:G1000');
    
    return rows.map((row: string[]) => ({
      id: row[0] || '',
      id_condimento: row[1] || '',
      nome_condimento: row[2] || '',
      valor_adicional: parsePrice(row[3] || '0'),
      link_imagem: row[4] || '',
      tipo_condimento: (row[5] || 'Adicionais') as 'Bordas' | 'Adicionais',
      selecao_multipla: (row[6] || 'sim') as 'sim' | 'não'
    }));
  } catch (error) {
    console.error('Erro ao buscar condimentos:', error);
    return [];
  }
}

// Buscar associações produto-condimento da planilha
export async function fetchProductCondimentAssociations(): Promise<ProductCondimentAssociation[]> {
  try {
    const rows = await fetchSheetData('Associacao_produto_condimento!A2:C1000');
    
    return rows.map((row: string[]) => ({
      id: row[0] || '',
      id_produto: row[1] || '',
      id_condimento: row[2] || ''
    }));
  } catch (error) {
    console.error('Erro ao buscar associações produto-condimento:', error);
    return [];
  }
}

// Buscar condimentos disponíveis para um produto específico
export async function fetchCondimentsForProduct(productId: string): Promise<Condiment[]> {
  try {
    const [condiments, associations] = await Promise.all([
      fetchCondiments(),
      fetchProductCondimentAssociations()
    ]);

    const productAssociations = associations.filter(assoc => assoc.id_produto === productId);
    const availableCondiments = condiments.filter(condiment =>
      productAssociations.some(assoc => assoc.id_condimento === condiment.id_condimento)
    );

    return availableCondiments;
  } catch (error) {
    console.error('Erro ao buscar condimentos do produto:', error);
    return [];
  }
}

// Gerar código único para o carrinho
export function generateCartCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Salvar pedido na planilha (simulação - será implementado com Web App Script)
export async function saveOrder(order: Order): Promise<boolean> {
  try {
    // Esta função seria implementada com um Google Apps Script Web App
    // Por enquanto, simularemos o salvamento
    console.log('Pedido a ser salvo:', order);
    return true;
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    return false;
  }
}

// Buscar pedido por código do carrinho
export async function fetchOrderByCartCode(cartCode: string): Promise<OrderProduct[]> {
  try {
    const rows = await fetchSheetData('Produtos_vendidos!A2:T1000');
    
    const orderProducts = rows
      .filter((row: string[]) => row[17] === cartCode) // coluna carrinho
      .map((row: string[]) => ({
        id: row[0] || '',
        id_produtos_vendidos: row[1] || '',
        id_pedido: row[2] || '',
        id_produto: row[3] || '',
        titulo: row[4] || '',
        descricao: row[5] || '',
        valor: parsePrice(row[6] || '0'),
        categoria: row[7] || '',
        condimentos_selecionados: row[8] || '',
        valor_condimentos: parsePrice(row[9] || '0'),
        nome_usuario: row[10] || '',
        cep: row[11] || '',
        logradouro: row[12] || '',
        numero: row[13] || '',
        cidade: row[14] || '',
        bairro: row[15] || '',
        telefone: row[16] || '',
        tipo_pagamento: row[17] || '',
        carrinho: row[18] || '',
        data_pedido: row[19] || '',
        aprovado: (row[20] || 'não') as 'sim' | 'não'
      }));

    return orderProducts;
  } catch (error) {
    console.error('Erro ao buscar pedido por código:', error);
    return [];
  }
}

// Atualizar status de aprovação do pedido
export async function updateOrderApproval(cartCode: string, approved: 'sim' | 'não'): Promise<boolean> {
  try {
    // Esta função seria implementada com um Google Apps Script Web App
    console.log(`Atualizando aprovação do pedido ${cartCode} para ${approved}`);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar aprovação do pedido:', error);
    return false;
  }
}