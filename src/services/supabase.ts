// Serviços para integração com Supabase
import { supabase } from '@/integrations/supabase/client';
import { Product, Condiment, ProductCondimentAssociation, Order, OrderProduct, CartItem, SelectedCondiment } from '@/types';

// Função utilitária para gerar código único do carrinho
export function generateCartCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Buscar produtos do Supabase
export async function fetchProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('produtos')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      id_produto: row.id_produto,
      titulo: row.titulo,
      descricao: row.descricao || '',
      valor: parseFloat(row.valor?.toString() || '0'),
      categoria: row.categoria,
      link_imagem: row.link_imagem || ''
    }));
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return [];
  }
}

// Buscar condimentos do Supabase
export async function fetchCondiments(): Promise<Condiment[]> {
  try {
    const { data, error } = await supabase
      .from('condimentos')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar condimentos:', error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      id_condimento: row.id_condimento,
      nome_condimento: row.nome_condimento,
      valor_adicional: parseFloat(row.valor_adicional?.toString() || '0'),
      link_imagem: row.link_imagem || '',
      tipo_condimento: row.tipo_condimento as 'Bordas' | 'Adicionais',
      selecao_multipla: row.selecao_multipla as 'sim' | 'não'
    }));
  } catch (error) {
    console.error('Erro ao buscar condimentos:', error);
    return [];
  }
}

// Buscar associações produto-condimento do Supabase
export async function fetchProductCondimentAssociations(): Promise<ProductCondimentAssociation[]> {
  try {
    const { data, error } = await supabase
      .from('associacao_produto_condimento')
      .select('*');
      
    if (error) {
      console.error('Erro ao buscar associações produto-condimento:', error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      id_produto: row.id_produto,
      id_condimento: row.id_condimento
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

// Salvar pedido no Supabase
export async function saveOrder(order: Order): Promise<boolean> {
  try {
    // Salvar dados do pedido
    const { data: pedidoData, error: pedidoError } = await supabase
      .from('pedidos')
      .insert({
        id_pedido: order.id_pedido,
        nome_usuario: order.customer.nome,
        cep: order.customer.cep,
        logradouro: order.customer.logradouro,
        numero: order.customer.numero,
        complemento: order.customer.complemento || '',
        cidade: order.customer.cidade,
        bairro: order.customer.bairro,
        telefone: order.customer.telefone,
        tipo_pagamento: order.customer.tipo_pagamento,
        carrinho: order.carrinho,
        data_pedido: order.data_pedido,
        aprovado: order.aprovado
      })
      .select();

    if (pedidoError) {
      console.error('Erro ao salvar pedido:', pedidoError);
      return false;
    }

    // Salvar produtos vendidos
    for (const item of order.items) {
      const condimentosTexto = item.selectedCondiments
        .map(c => `${c.nome_condimento} (+R$ ${c.valor_adicional.toFixed(2)})`)
        .join(', ');

      const valorCondimentos = item.selectedCondiments
        .reduce((sum, c) => sum + c.valor_adicional, 0);

      const { error: produtoError } = await supabase
        .from('produtos_vendidos')
        .insert({
          id_produtos_vendidos: `${order.id_pedido}_${item.product.id_produto}_${Date.now()}`,
          id_pedido: order.id_pedido,
          id_produto: item.product.id_produto,
          titulo: item.product.titulo,
          descricao: item.product.descricao,
          valor: item.product.valor,
          categoria: item.product.categoria,
          condimentos_selecionados: condimentosTexto,
          valor_condimentos: valorCondimentos,
          nome_usuario: order.customer.nome,
          cep: order.customer.cep,
          logradouro: order.customer.logradouro,
          numero: order.customer.numero,
          cidade: order.customer.cidade,
          bairro: order.customer.bairro,
          telefone: order.customer.telefone,
          tipo_pagamento: order.customer.tipo_pagamento,
          carrinho: order.carrinho,
          data_pedido: order.data_pedido,
          aprovado: 'não'
        });

      if (produtoError) {
        console.error('Erro ao salvar produto vendido:', produtoError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Erro ao salvar pedido:', error);
    return false;
  }
}

// Buscar pedido por código do carrinho
export async function fetchOrderByCartCode(cartCode: string): Promise<OrderProduct[]> {
  try {
    const { data, error } = await supabase
      .from('produtos_vendidos')
      .select('*')
      .eq('carrinho', cartCode);
      
    if (error) {
      console.error('Erro ao buscar pedido por código:', error);
      return [];
    }
    
    return data.map(row => ({
      id: row.id,
      id_produtos_vendidos: row.id_produtos_vendidos,
      id_pedido: row.id_pedido,
      id_produto: row.id_produto,
      id_condimento: row.id_condimento,
      titulo: row.titulo,
      descricao: row.descricao || '',
      valor: parseFloat(row.valor?.toString() || '0'),
      categoria: row.categoria,
      condimentos_selecionados: row.condimentos_selecionados || '',
      valor_condimentos: parseFloat(row.valor_condimentos?.toString() || '0'),
      nome_usuario: row.nome_usuario,
      cep: row.cep,
      logradouro: row.logradouro,
      numero: row.numero,
      cidade: row.cidade,
      bairro: row.bairro,
      telefone: row.telefone,
      tipo_pagamento: row.tipo_pagamento,
      carrinho: row.carrinho,
      data_pedido: row.data_pedido,
      aprovado: row.aprovado as 'sim' | 'não'
    }));
  } catch (error) {
    console.error('Erro ao buscar pedido por código:', error);
    return [];
  }
}

// Função para reconstruir carrinho a partir de um pedido
export async function reconstructCartFromOrder(cartCode: string): Promise<CartItem[]> {
  try {
    // Buscar produtos vendidos
    const { data: soldProducts, error: soldError } = await supabase
      .from('produtos_vendidos')
      .select('*')
      .eq('carrinho', cartCode);

    if (soldError || !soldProducts) {
      console.error('Error fetching sold products:', soldError);
      return [];
    }

    // Buscar dados dos produtos
    const productIds = [...new Set(soldProducts.map(item => item.id_produto))];
    const { data: products, error: productsError } = await supabase
      .from('produtos')
      .select('*')
      .in('id_produto', productIds);

    if (productsError || !products) {
      console.error('Error fetching products:', productsError);
      return [];
    }

    // Buscar dados dos condimentos
    const condimentIds = soldProducts
      .map(item => item.id_condimento)
      .filter(id => id !== null && id !== '' && id !== '0');
    
    let condiments: any[] = [];
    if (condimentIds.length > 0) {
      const { data: condimentsData, error: condimentsError } = await supabase
        .from('condimentos')
        .select('*')
        .in('id_condimento', condimentIds);

      if (condimentsError) {
        console.error('Error fetching condiments:', condimentsError);
      } else {
        condiments = condimentsData || [];
      }
    }

    // Agrupar por id_produto para reconstruir itens do carrinho
    const cartItems: CartItem[] = [];
    const productGroups = new Map<string, any[]>();

    // Agrupar produtos vendidos por id_produto
    soldProducts.forEach(item => {
      if (!productGroups.has(item.id_produto)) {
        productGroups.set(item.id_produto, []);
      }
      productGroups.get(item.id_produto)!.push(item);
    });

    // Reconstruir cada item do carrinho
    productGroups.forEach((items, productId) => {
      const product = products.find(p => p.id_produto === productId);
      if (!product) return;

      // Encontrar produtos base (sem condimento ou condimento "0") para determinar quantidade
      const baseItems = items.filter(item => !item.id_condimento || item.id_condimento === '0' || item.id_condimento === '');
      const quantity = baseItems.length || 1;

      // Encontrar condimentos associados
      const condimentItems = items.filter(item => item.id_condimento && item.id_condimento !== '0' && item.id_condimento !== '');
      const selectedCondiments: SelectedCondiment[] = condimentItems.map(item => {
        const condiment = condiments.find(c => c.id_condimento === item.id_condimento);
        return {
          id_condimento: item.id_condimento,
          nome_condimento: condiment?.nome_condimento || 'Condimento não encontrado',
          valor_adicional: condiment?.valor_adicional || 0,
          tipo_condimento: condiment?.tipo_condimento || 'Adicionais'
        };
      });

      // Calcular preço total
      const basePrice = Number(product.valor);
      const condimentsPrice = selectedCondiments.reduce((sum, c) => sum + Number(c.valor_adicional), 0);
      const totalPrice = (basePrice + condimentsPrice) * quantity;

      const cartItem: CartItem = {
        id: generateCartCode(), // Gerar novo ID único
        product: {
          id: product.id,
          id_produto: product.id_produto,
          titulo: product.titulo,
          descricao: product.descricao || '',
          valor: basePrice,
          categoria: product.categoria,
          link_imagem: product.link_imagem || ''
        },
        quantity,
        selectedCondiments,
        totalPrice
      };

      cartItems.push(cartItem);
    });

    return cartItems;
  } catch (error) {
    console.error('Error reconstructing cart from order:', error);
    return [];
  }
}

// Atualizar status de aprovação do pedido
export async function updateOrderApproval(cartCode: string, approved: 'sim' | 'não'): Promise<boolean> {
  try {
    // Atualizar na tabela pedidos
    const { error: pedidoError } = await supabase
      .from('pedidos')
      .update({ aprovado: approved })
      .eq('carrinho', cartCode);

    if (pedidoError) {
      console.error('Erro ao atualizar aprovação do pedido:', pedidoError);
      return false;
    }

    // Atualizar na tabela produtos_vendidos
    const { error: produtosError } = await supabase
      .from('produtos_vendidos')
      .update({ aprovado: approved })
      .eq('carrinho', cartCode);

    if (produtosError) {
      console.error('Erro ao atualizar aprovação dos produtos vendidos:', produtosError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Erro ao atualizar aprovação do pedido:', error);
    return false;
  }
}