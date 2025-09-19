import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CustomerData, Order } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { sendToWhatsApp } from '@/services/whatsapp';
import { generateCartCode, saveOrder, updateOrder } from '@/services/supabase';
import { ChevronLeft, MessageCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

interface ConfirmationStepProps {
  customerData: CustomerData;
  onPrevious: () => void;
  onComplete: () => void;
  onEditComplete?: () => void;
}

export function ConfirmationStep({ customerData, onPrevious, onComplete, onEditComplete }: ConfirmationStepProps) {
  const { state, clearCart, clearEditingOrder } = useCart();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cartCode] = useState(state.editingOrderCode || generateCartCode());

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleFinishOrder = async () => {
    setLoading(true);
    
    try {
      const isEditing = !!state.editingOrderCode;
      
      // Criar objeto do pedido
      const order: Order = {
        id_pedido: isEditing ? state.editingOrderCode! : generateCartCode(),
        customer: customerData,
        items: state.items,
        total: state.totalPrice,
        carrinho: cartCode,
        data_pedido: new Date().toLocaleDateString('pt-BR'),
        aprovado: ''
      };

      // Salvar ou atualizar pedido
      const success = isEditing ? await updateOrder(order) : await saveOrder(order);
      
      if (!success) {
        throw new Error(isEditing ? 'Falha ao atualizar pedido' : 'Falha ao salvar pedido');
      }

      if (isEditing) {
        // Se está editando, não envia WhatsApp e retorna para OrderSearchModal
        clearCart();
        clearEditingOrder();

        toast({
          title: 'Pedido atualizado!',
          description: `Pedido #${cartCode} foi atualizado com sucesso.`,
        });

        onEditComplete?.();
      } else {
        // Se é novo pedido, envia WhatsApp normalmente
        sendToWhatsApp(order);

        clearCart();
        clearEditingOrder();

        toast({
          title: 'Pedido enviado!',
          description: `Seu pedido #${cartCode} foi enviado para a pizzaria via WhatsApp.`,
        });

        onComplete();
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Houve um problema ao processar seu pedido. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="text-4xl mb-2">🍕</div>
        <h2 className="text-xl font-bold">Confirmação do Pedido</h2>
        <p className="text-muted-foreground">Revise os dados antes de finalizar</p>
      </div>

      {/* Código do Carrinho */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">#{cartCode}</div>
          <p className="text-sm text-muted-foreground">Código do seu pedido</p>
        </CardContent>
      </Card>

      {/* Dados do Cliente */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Seus Dados</h3>
          <div className="space-y-2 text-sm">
            <div><strong>Nome:</strong> {customerData.nome}</div>
            <div><strong>Telefone:</strong> {customerData.telefone}</div>
            <div><strong>Pagamento:</strong> {customerData.tipo_pagamento}</div>
          </div>
        </CardContent>
      </Card>

      {/* Endereço de Entrega */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
          <div className="text-sm">
            <div>{customerData.logradouro}, {customerData.numero}</div>
            {customerData.complemento && <div>{customerData.complemento}</div>}
            <div>{customerData.bairro} - {customerData.cidade}</div>
            <div>CEP: {customerData.cep.replace(/(\d{5})(\d{3})/, '$1-$2')}</div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo dos Itens */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Itens do Pedido</h3>
          <div className="space-y-3">
            {state.items.map((item, index) => (
              <div key={item.id} className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.product.titulo}</span>
                    <Badge variant="secondary">x{item.quantity}</Badge>
                  </div>
                  {item.selectedCondiments.length > 0 && (
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.selectedCondiments.map((condiment, idx) => (
                        <div key={idx}>+ {condiment.nome_condimento}</div>
                      ))}
                    </div>
                  )}
                </div>
                <span className="font-semibold">{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <hr />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary">{formatPrice(state.totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botões */}
      <div className="flex gap-3">
        <Button 
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
          disabled={loading}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          onClick={handleFinishOrder}
          className="flex-1 gradient-primary text-primary-foreground font-semibold"
          disabled={loading}
        >
          {loading ? (
            <>Finalizando...</>
          ) : state.editingOrderCode ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmar Alterações
            </>
          ) : (
            <>
              <MessageCircle className="h-4 w-4 mr-2" />
              Enviar WhatsApp
            </>
          )}
        </Button>
      </div>

      {!state.editingOrderCode && (
        <div className="text-center text-xs text-muted-foreground">
          Ao finalizar, você será redirecionado para o WhatsApp da pizzaria
        </div>
      )}
    </div>
  );
}