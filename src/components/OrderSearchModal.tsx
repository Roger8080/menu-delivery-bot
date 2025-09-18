import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { X, Search, Printer, CheckCircle, XCircle, Loader2, Edit, ShoppingCart } from 'lucide-react';
import { fetchOrderByCartCode, updateOrderApproval, reconstructCartFromOrder } from '@/services/supabase';
import { OrderProduct } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { ThermalPrintTemplate } from './ThermalPrintTemplate';

interface OrderSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditOrder?: () => void;
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

export function OrderSearchModal({ isOpen, onClose, onEditOrder }: OrderSearchModalProps) {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderProduct[]>([]);
  const [customerData, setCustomerData] = useState<OrderProduct | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const { toast } = useToast();
  const { loadCart } = useCart();

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const groupOrderItems = (orderProducts: OrderProduct[]): GroupedOrderItem[] => {
    const grouped = new Map<string, GroupedOrderItem>();

    orderProducts.forEach(item => {
      if (!item.id_condimento || item.id_condimento === null) {
        // Item base do produto (id_condimento é null)
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
            totalPrice: item.valor_condimentos || item.valor,
          });
        } else {
          // Se já existe, adicionar o valor do produto base
          const existingItem = grouped.get(item.id_produto);
          if (existingItem) {
            existingItem.totalPrice += item.valor_condimentos || item.valor;
          }
        }
      } else {
        // Condimento do produto
        let existingItem = grouped.get(item.id_produto);
        if (!existingItem) {
          // Se ainda não existe o produto base, criar entrada básica
          grouped.set(item.id_produto, {
            product: {
              id_produto: item.id_produto,
              titulo: item.titulo,
              descricao: item.descricao,
              valor: item.valor,
              categoria: item.categoria,
            },
            condiments: [],
            totalPrice: 0,
          });
          existingItem = grouped.get(item.id_produto);
        }
        
        if (existingItem) {
          existingItem.condiments.push({
            id_condimento: item.id_condimento,
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

  const handleEditOrder = async () => {
    if (!customerData) return;

    setLoading(true);
    try {
      const cartItems = await reconstructCartFromOrder(customerData.carrinho);
      if (cartItems.length === 0) {
        toast({
          title: 'Erro',
          description: 'Não foi possível reconstruir o carrinho.',
          variant: 'destructive',
        });
        return;
      }

      loadCart(cartItems);
      toast({
        title: 'Carrinho carregado!',
        description: 'O pedido foi carregado no carrinho para edição.',
      });

      handleClose();
      onEditOrder?.();
    } catch (error) {
      console.error('Erro ao carregar pedido no carrinho:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o pedido.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNote = () => {
    if (!customerData) return;
    setShowPrintPreview(true);
  };

  const handlePrintNote = async () => {
    if (!customerData) return;

    setLoading(true);
    try {
      await updateOrderApproval(customerData.carrinho, 'sim');
      
      toast({
        title: 'Nota gerada!',
        description: 'Pedido aprovado e nota fiscal emitida.',
      });

      // Imprimir a nota
      window.print();
      
      setShowPrintPreview(false);
      handleClose();
    } catch (error) {
      console.error('Erro ao gerar nota:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível gerar a nota fiscal.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (approved: 'sim' | 'não') => {
    if (!customerData) return;

    if (approved === 'sim') {
      handleGenerateNote();
      return;
    }

    setLoading(true);
    try {
      await updateOrderApproval(customerData.carrinho, approved);
      
      toast({
        title: 'Pedido cancelado!',
        description: 'O pedido foi cancelado.',
      });

      handleClose();
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível cancelar o pedido.',
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
    setShowPrintPreview(false);
    onClose();
  };

  const groupedItems = groupOrderItems(orderData);
  const totalOrder = groupedItems.reduce((sum, item) => sum + item.totalPrice, 0);

  if (!isOpen) return null;

  if (showPrintPreview && customerData) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Visualizar Nota Fiscal</DialogTitle>
              <Button variant="ghost" size="sm" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <ThermalPrintTemplate
              orderData={orderData}
              customerData={customerData}
              cartCode={customerData.carrinho}
              totalOrder={totalOrder}
            />

            <div className="flex gap-3 no-print">
              <Button
                variant="outline"
                onClick={() => setShowPrintPreview(false)}
                className="flex-1"
              >
                Voltar
              </Button>
              
              <Button
                onClick={handlePrintNote}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Printer className="h-4 w-4 mr-2" />
                    Gerar Nota
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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

            {/* Status do Pedido */}
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Status do Pedido</h3>
                    <p className="text-sm text-muted-foreground">
                      Código: {customerData?.carrinho}
                    </p>
                  </div>
                  <Badge variant={customerData?.aprovado === 'sim' ? 'default' : 'secondary'}>
                    {customerData?.aprovado === 'sim' ? 'Aprovado' : 'Pendente'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Ações do Atendente */}
            {customerData?.aprovado !== 'sim' ? (
              <div className="space-y-3">
                <Button
                  onClick={handleEditOrder}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Carregando...
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar Pedido
                    </>
                  )}
                </Button>
                
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
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  >
                    {loading ? (
                      <>Processando...</>
                    ) : (
                      <>
                        <Printer className="h-4 w-4 mr-2" />
                        Gerar Nota
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Pedido já aprovado</p>
                <p className="text-green-600 text-sm">Nota fiscal já foi emitida</p>
              </div>
            )}

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