import { Order } from '@/types';

const WHATSAPP_NUMBER = '5511976916761'; // Número com código do país

export function generateWhatsAppMessage(order: Order): string {
  const { customer, items, total, carrinho } = order;
  
  let message = '🍕 NOVO PEDIDO - Pizzaria Bella Vista\n\n';
  
  // Dados do cliente
  message += '👤 CLIENTE:\n';
  message += `Nome: ${customer.nome}\n`;
  message += `Telefone: ${customer.telefone}\n\n`;
  
  // Endereço de entrega
  message += '📍 ENDEREÇO DE ENTREGA:\n';
  message += `CEP: ${customer.cep}\n`;
  message += `${customer.logradouro}, ${customer.numero}`;
  if (customer.complemento) {
    message += ` - ${customer.complemento}`;
  }
  message += `\n${customer.bairro} - ${customer.cidade}\n\n`;
  
  // Itens do pedido
  message += '🛒 PEDIDO:\n';
  items.forEach((item, index) => {
    message += `${index + 1}. ${item.product.titulo} - Qtd: ${item.quantity}\n`;
    message += `   R$ ${item.product.valor.toFixed(2).replace('.', ',')}\n`;
    
    if (item.selectedCondiments.length > 0) {
      message += '   Condimentos:\n';
      item.selectedCondiments.forEach(condiment => {
        message += `   + ${condiment.nome_condimento} - R$ ${condiment.valor_adicional.toFixed(2).replace('.', ',')}\n`;
      });
    }
    
    message += `   Subtotal: R$ ${item.totalPrice.toFixed(2).replace('.', ',')}\n\n`;
  });
  
  // Total e pagamento
  message += `💰 TOTAL: R$ ${total.toFixed(2).replace('.', ',')}\n\n`;
  message += `💳 FORMA DE PAGAMENTO:\n${customer.tipo_pagamento}\n\n`;
  message += `Código: #${carrinho}\n`;
  message += '---\n';
  message += 'Pedido feito pelo site 🌐\n';
  message += 'Obrigado pela preferência! 😊';
  
  return message;
}

export function sendToWhatsApp(order: Order): void {
  const message = generateWhatsAppMessage(order);
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
  
  window.open(whatsappUrl, '_blank');
}