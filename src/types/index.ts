// Tipos para o sistema de pedidos da Pizzaria Bella Vista

export interface Product {
  id: string;
  id_produto: string;
  titulo: string;
  descricao: string;
  valor: number;
  categoria: string;
  link_imagem: string;
}

export interface Condiment {
  id: string;
  id_condimento: string;
  nome_condimento: string;
  valor_adicional: number;
  link_imagem: string;
  tipo_condimento: 'Bordas' | 'Adicionais';
  selecao_multipla: 'sim' | 'não';
}

export interface ProductCondimentAssociation {
  id: string;
  id_produto: string;
  id_condimento: string;
}

export interface SelectedCondiment {
  id_condimento: string;
  nome_condimento: string;
  valor_adicional: number;
  tipo_condimento: string;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  selectedCondiments: SelectedCondiment[];
  totalPrice: number;
}

export interface CustomerData {
  nome: string;
  telefone: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  bairro: string;
  tipo_pagamento: 'Cartão de Crédito' | 'Cartão de Débito' | 'Dinheiro' | 'PIX';
}

export interface Order {
  id_pedido: string;
  customer: CustomerData;
  items: CartItem[];
  total: number;
  carrinho: string;
  data_pedido: string;
  aprovado: 'sim' | 'não' | '';
}

export interface OrderProduct {
  id: string;
  id_produtos_vendidos: string;
  id_pedido: string;
  id_produto: string;
  id_condimento?: string;
  titulo: string;
  descricao: string;
  valor: number;
  categoria: string;
  condimentos_selecionados: string;
  valor_condimentos: number;
  nome_usuario: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento?: string;
  cidade: string;
  bairro: string;
  telefone: string;
  tipo_pagamento: string;
  carrinho: string;
  data_pedido: string;
  aprovado: 'sim' | 'não';
}

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export type Category = 'Todos' | 'Pizzas' | 'Bebidas' | 'Sobremesas';

export interface CheckoutStep {
  step: number;
  title: string;
  isCompleted: boolean;
}