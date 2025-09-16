import React from 'react';
import { OrderProduct } from '@/types';

interface ThermalPrintTemplateProps {
  orderData: OrderProduct[];
  customerData: OrderProduct;
  cartCode: string;
  totalOrder: number;
}

interface GroupedOrderItem {
  product: {
    id_produto: string;
    titulo: string;
    descricao: string;
    valor: number;
    categoria: string;
  };
  condiments: Array<{
    nome_condimento: string;
    valor_adicional: number;
  }>;
  totalPrice: number;
}

export function ThermalPrintTemplate({ orderData, customerData, cartCode, totalOrder }: ThermalPrintTemplateProps) {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const groupOrderItems = (orderProducts: OrderProduct[]): GroupedOrderItem[] => {
    const grouped = new Map<string, GroupedOrderItem>();

    orderProducts.forEach(item => {
      if (item.id_condimento === '' || item.id_condimento === '0' || !item.id_condimento) {
        // Item base do produto
        if (!grouped.has(item.id_produto)) {
          grouped.set(item.id_produto, {
            product: {
              id_produto: item.id_produto,
              titulo: item.titulo,
              descricao: item.descricao,
              valor: item.valor,
              categoria: item.categoria,
            },
            condiments: [],
            totalPrice: item.valor,
          });
        }
      } else {
        // Condimento do produto
        const existingItem = grouped.get(item.id_produto);
        if (existingItem) {
          existingItem.condiments.push({
            nome_condimento: item.condimentos_selecionados || 'Condimento',
            valor_adicional: item.valor_condimentos || 0,
          });
          existingItem.totalPrice += item.valor_condimentos || 0;
        }
      }
    });

    return Array.from(grouped.values());
  };

  const groupedItems = groupOrderItems(orderData);
  const currentDate = new Date().toLocaleString('pt-BR');

  return (
    <div className="thermal-receipt">
      <style>{`
        @media print {
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            width: 80mm;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.2;
          }
          
          .thermal-receipt {
            width: 100%;
            max-width: 80mm;
            margin: 0 auto;
            padding: 5mm;
          }
          
          .header {
            text-align: center;
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
          }
          
          .restaurant-name {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 4px;
          }
          
          .restaurant-info {
            font-size: 10px;
            margin-bottom: 2px;
          }
          
          .order-info {
            margin-bottom: 8px;
            font-size: 10px;
          }
          
          .customer-info {
            border-bottom: 1px dashed #000;
            padding-bottom: 8px;
            margin-bottom: 8px;
            font-size: 10px;
          }
          
          .items-section {
            margin-bottom: 8px;
          }
          
          .item {
            margin-bottom: 6px;
          }
          
          .item-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            margin-bottom: 2px;
          }
          
          .condiment {
            margin-left: 8px;
            font-size: 10px;
            display: flex;
            justify-content: space-between;
          }
          
          .total-section {
            border-top: 1px dashed #000;
            padding-top: 8px;
            text-align: right;
          }
          
          .total-line {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            font-size: 14px;
            margin-top: 4px;
          }
          
          .footer {
            text-align: center;
            border-top: 1px dashed #000;
            padding-top: 8px;
            margin-top: 8px;
            font-size: 10px;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        @media screen {
          .thermal-receipt {
            width: 300px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ccc;
            font-family: 'Courier New', monospace;
            background: white;
          }
        }
      `}</style>

      <div className="header">
        <div className="restaurant-name">PIZZARIA BELLA VISTA</div>
        <div className="restaurant-info">Rua das Flores, 123</div>
        <div className="restaurant-info">Centro - São Paulo - SP</div>
        <div className="restaurant-info">Tel: (11) 1234-5678</div>
        <div className="restaurant-info">CNPJ: 12.345.678/0001-90</div>
      </div>

      <div className="order-info">
        <div><strong>CUPOM FISCAL</strong></div>
        <div>Pedido: {cartCode}</div>
        <div>Data: {currentDate}</div>
      </div>

      <div className="customer-info">
        <div><strong>DADOS DO CLIENTE:</strong></div>
        <div>Nome: {customerData.nome_usuario}</div>
        <div>Telefone: {customerData.telefone}</div>
        <div>Endereço: {customerData.logradouro}, {customerData.numero}</div>
        <div>{customerData.bairro} - {customerData.cidade}</div>
        <div>CEP: {customerData.cep?.replace(/(\d{5})(\d{3})/, '$1-$2')}</div>
        <div>Pagamento: {customerData.tipo_pagamento}</div>
      </div>

      <div className="items-section">
        <div><strong>ITENS:</strong></div>
        {groupedItems.map((item, index) => (
          <div key={`${item.product.id_produto}-${index}`} className="item">
            <div className="item-header">
              <span>{item.product.titulo}</span>
              <span>{formatPrice(item.totalPrice)}</span>
            </div>
            <div style={{ fontSize: '10px', marginLeft: '8px' }}>
              Valor base: {formatPrice(item.product.valor)}
            </div>
            {item.condiments.map((condiment, idx) => (
              <div key={idx} className="condiment">
                <span>+ {condiment.nome_condimento}</span>
                <span>{formatPrice(condiment.valor_adicional)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="total-section">
        <div className="total-line">
          <span>TOTAL:</span>
          <span>{formatPrice(totalOrder)}</span>
        </div>
      </div>

      <div className="footer">
        <div>Obrigado pela preferência!</div>
        <div>Volte sempre!</div>
        <div>*Documento não fiscal*</div>
      </div>
    </div>
  );
}