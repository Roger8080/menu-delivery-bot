import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Minus, Plus, X, Trash2, Search } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

interface CartModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCheckout: () => void;
  onSearchOrder: (code: string) => void;
}

export function CartModal({ isOpen, onClose, onCheckout, onSearchOrder }: CartModalProps) {
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const [searchCode, setSearchCode] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleSearchSubmit = () => {
    if (searchCode.trim()) {
      onSearchOrder(searchCode.trim().toUpperCase());
      setSearchCode('');
      setShowSearch(false);
    }
  };

  if (state.items.length === 0 && !showSearch) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Seu Carrinho</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="text-center py-8">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-lg font-semibold mb-2">Carrinho Vazio</h3>
            <p className="text-muted-foreground mb-6">
              Adicione produtos deliciosos ao seu carrinho!
            </p>
            
            <div className="space-y-3">
              <Button 
                onClick={() => setShowSearch(true)}
                variant="outline"
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                Buscar Pedido
              </Button>
              
              <Button onClick={onClose} className="w-full gradient-primary text-primary-foreground">
                Continuar Comprando
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (showSearch && state.items.length === 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle>Buscar Pedido</DialogTitle>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Código do Pedido</label>
              <Input
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                placeholder="Ex: 89BS93"
                className="mt-1"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowSearch(false)}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleSearchSubmit}
                className="flex-1 gradient-primary text-primary-foreground"
                disabled={!searchCode.trim()}
              >
                Buscar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>
              Seu Carrinho ({state.totalItems} {state.totalItems === 1 ? 'item' : 'itens'})
            </DialogTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={clearCart}>
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {state.items.map((item) => (
            <div key={item.id} className="bg-muted/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{item.product.titulo}</h4>
                  <Badge variant="secondary" className="mt-1">
                    {item.product.categoria}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="text-destructive hover:bg-destructive/10"
                >
                  Remover
                </Button>
              </div>

              {item.selectedCondiments.length > 0 && (
                <div>
                  <p className="text-sm font-medium mb-1">Condimentos:</p>
                  {item.selectedCondiments.map((condiment, index) => (
                    <div key={index} className="flex justify-between text-sm text-muted-foreground">
                      <span>+ {condiment.nome_condimento}</span>
                      <span>{formatPrice(condiment.valor_adicional)}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-semibold w-8 text-center">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(item.totalPrice)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span className="text-primary text-xl">
              {formatPrice(state.totalPrice)}
            </span>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={onClose}
            >
              Continuar Comprando
            </Button>
            <Button 
              onClick={onCheckout}
              className="flex-1 gradient-primary text-primary-foreground font-semibold"
            >
              Finalizar Pedido
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}