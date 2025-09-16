import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Search, Printer, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { fetchOrderByCartCode, updateOrderApproval } from '@/services/googleSheets';
import { OrderProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface OrderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
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
    id_condimento: string;
    nome_condimento: string;
    valor_adicional: number;
  }>;
  totalPrice: number;
}

export function OrderSearchModal({ isOpen, onClose }: OrderSearchModalProps) {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderProduct[]>([]);
  const [customerData, setCustomerData] = useState<OrderProduct | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const groupOrderItems = (orderProducts: OrderProduct[]): GroupedOrderItem[] => {
    const grouped = new Map<string, GroupedOrderItem>();

    orderProducts.forEach(item => {
      if (item.id_condimento === '' || item.id_condimento === '0') {
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
            id_condimento: item.id_condimento || '',
            nome_condimento: item.condimentos_selecionados || 'Condimento',
            valor_adicional: item.valor_condimentos || 0,
          });
          existingItem.totalPrice += item.valor_condimentos || 0;
        }
      }
    });

    return Array.from(grouped.values());
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast({
        title: 'Código inválido',
        description: 'Informe o código do pedido.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const results = await fetchOrderByCartCode(searchCode.toUpperCase());
      if (results.length === 0) {
        toast({
          title: 'Pedido não encontrado',
          description: 'Verifique se o código está correto.',
          variant: 'destructive',
        });
        return;
      }

      setOrderData(results);
      setCustomerData(results[0]); // Dados do cliente são iguais em todos os registros
      setShowResults(true);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível buscar o pedido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: 'sim' | 'não') => {
    if (!customerData) return;

    setLoading(true);
    try {
      await updateOrderApproval(customerData.carrinho, approved);
      
      toast({
        title: approved === 'sim' ? 'Pedido aprovado!' : 'Pedido cancelado!',
        description: approved === 'sim' 
          ? 'Nota fiscal emitida com sucesso.' 
          : 'O pedido foi cancelado.',
      });

      if (approved === 'sim') {
        // Simular impressão da nota
        window.print();
      }

      handleClose();
    } catch (error) {
      console.error('Erro ao atualizar aprovação:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do pedido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSearchCode('');
    setOrderData([]);
    setCustomerData(null);
    setShowResults(false);
    onClose();
  };

  const groupedItems = groupOrderItems(orderData);
  const totalOrder = groupedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Buscar Pedido</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Código do Pedido</label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={searchCode}
                  onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                  placeholder="Ex: 89BS93"
                  maxLength={6}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={loading || !searchCode.trim()}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Informações do Cliente */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Dados do Cliente</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <strong>Nome:</strong> {customerData?.nome_usuario}
                  </div>
                  <div>
                    <strong>Telefone:</strong> {customerData?.telefone}
                  </div>
                  <div className="col-span-2">
                    <strong>Endereço:</strong><br />
                    {customerData?.logradouro}, {customerData?.numero}<br />
                    {customerData?.bairro} - {customerData?.cidade}<br />
                    CEP: {customerData?.cep?.replace(/(\d{5})(\d{3})/, '$1-$2')}
                  </div>
                  <div>
                    <strong>Pagamento:</strong> {customerData?.tipo_pagamento}
                  </div>
                  <div>
                    <strong>Data:</strong> {customerData?.data_pedido}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Itens do Pedido */}
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-3">Itens do Pedido</h3>
                <div className="space-y-4">
                  {groupedItems.map((item, index) => (
                    <div key={`${item.product.id_produto}-${index}`} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{item.product.titulo}</h4>
                          <Badge variant="secondary" className="mt-1">
                            {item.product.categoria}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            Valor base: {formatPrice(item.product.valor)}
                          </div>
                        </div>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.totalPrice)}
                        </span>
                      </div>

                      {item.condiments.length > 0 && (
                        <div className="ml-4 space-y-1">
                          <p className="text-sm font-medium">Condimentos:</p>
                          {item.condiments.map((condiment, idx) => (
                            <div key={idx} className="flex justify-between text-sm text-muted-foreground">
                              <span>+ {condiment.nome_condimento}</span>
                              <span>{formatPrice(condiment.valor_adicional)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <Separator />
                    </div>
                  ))}

                  <div className="flex justify-between font-bold text-lg pt-2">
                    <span>Total do Pedido</span>
                    <span className="text-primary">{formatPrice(totalOrder)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações do Atendente */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => handleApproval('não')}
                disabled={loading}
                className="flex-1 text-destructive hover:bg-destructive/10"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar Pedido
              </Button>
              
              <Button
                onClick={() => handleApproval('sim')}
                disabled={loading}
                className="flex-1 gradient-primary text-primary-foreground"
              >
                {loading ? (
                  <>Processando...</>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Confirmar e Emitir Nota
                  </>
                )}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setShowResults(false)}
                className="text-sm"
              >
                Buscar outro pedido
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}