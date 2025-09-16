import { useState, useEffect } from 'react';
import { Product, Condiment, SelectedCondiment } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Minus, Plus, X } from 'lucide-react';
import { fetchCondimentsForProduct } from '@/services/googleSheets';
import { useCart } from '@/contexts/CartContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCustomizationProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductCustomization({ product, isOpen, onClose }: ProductCustomizationProps) {
  const [condiments, setCondiments] = useState<Condiment[]>([]);
  const [selectedBorda, setSelectedBorda] = useState<string>('');
  const [selectedAdicionais, setSelectedAdicionais] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    if (product && isOpen) {
      loadCondiments();
    }
  }, [product, isOpen]);

  const loadCondiments = async () => {
    if (!product) return;
    
    setLoading(true);
    try {
      const productCondiments = await fetchCondimentsForProduct(product.id_produto);
      setCondiments(productCondiments);
      
      // Definir borda padrão (Simples se disponível)
      const simplesBorder = productCondiments.find(c => 
        c.tipo_condimento === 'Bordas' && 
        c.nome_condimento.toLowerCase().includes('simples')
      );
      if (simplesBorder) {
        setSelectedBorda(simplesBorder.id_condimento);
      }
    } catch (error) {
      console.error('Erro ao carregar condimentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as opções de personalização.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedBorda('');
    setSelectedAdicionais([]);
    setQuantity(1);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleAdicionaisChange = (condimentId: string, checked: boolean) => {
    setSelectedAdicionais(prev => 
      checked 
        ? [...prev, condimentId]
        : prev.filter(id => id !== condimentId)
    );
  };

  const getSelectedCondiments = (): SelectedCondiment[] => {
    const selected: SelectedCondiment[] = [];
    
    // Adicionar borda selecionada
    if (selectedBorda) {
      const borda = condiments.find(c => c.id_condimento === selectedBorda);
      if (borda) {
        selected.push({
          id_condimento: borda.id_condimento,
          nome_condimento: borda.nome_condimento,
          valor_adicional: borda.valor_adicional,
          tipo_condimento: borda.tipo_condimento,
        });
      }
    }
    
    // Adicionar adicionais selecionados
    selectedAdicionais.forEach(adicionalId => {
      const adicional = condiments.find(c => c.id_condimento === adicionalId);
      if (adicional) {
        selected.push({
          id_condimento: adicional.id_condimento,
          nome_condimento: adicional.nome_condimento,
          valor_adicional: adicional.valor_adicional,
          tipo_condimento: adicional.tipo_condimento,
        });
      }
    });
    
    return selected;
  };

  const calculateTotal = (): number => {
    if (!product) return 0;
    
    const selectedCondiments = getSelectedCondiments();
    const condimentsTotal = selectedCondiments.reduce((sum, condiment) => sum + condiment.valor_adicional, 0);
    return (product.valor + condimentsTotal) * quantity;
  };

  const handleAddToCart = () => {
    if (!product) return;

    const selectedCondiments = getSelectedCondiments();
    addItem(product, selectedCondiments, quantity);
    
    toast({
      title: 'Produto adicionado!',
      description: `${product.titulo} foi adicionado ao carrinho.`,
    });
    
    handleClose();
  };

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const bordas = condiments.filter(c => c.tipo_condimento === 'Bordas');
  const adicionais = condiments.filter(c => c.tipo_condimento === 'Adicionais');

  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle className="text-lg font-bold">
              {product.titulo}
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {product.descricao}
          </p>
          <p className="text-lg font-semibold text-primary">
            {formatPrice(product.valor)}
          </p>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Bordas Recheadas */}
            {bordas.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Bordas Recheadas</h3>
                <RadioGroup value={selectedBorda} onValueChange={setSelectedBorda}>
                  {bordas.map((borda) => (
                    <div key={borda.id_condimento} className="flex items-center justify-between space-x-2 p-2 rounded-lg hover:bg-muted">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value={borda.id_condimento} id={borda.id_condimento} />
                        <Label htmlFor={borda.id_condimento} className="font-medium">
                          {borda.nome_condimento}
                        </Label>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        + {formatPrice(borda.valor_adicional)}
                      </span>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* Adicionais */}
            {adicionais.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Adicionais</h3>
                <div className="space-y-2">
                  {adicionais.map((adicional) => (
                    <div key={adicional.id_condimento} className="flex items-center justify-between space-x-2 p-2 rounded-lg hover:bg-muted">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={adicional.id_condimento}
                          checked={selectedAdicionais.includes(adicional.id_condimento)}
                          onCheckedChange={(checked) => 
                            handleAdicionaisChange(adicional.id_condimento, checked as boolean)
                          }
                        />
                        <Label htmlFor={adicional.id_condimento} className="font-medium">
                          {adicional.nome_condimento}
                        </Label>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        + {formatPrice(adicional.valor_adicional)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Controle de Quantidade */}
            <div>
              <h3 className="font-semibold mb-3">Quantidade</h3>
              <div className="flex items-center justify-center gap-4 bg-muted rounded-lg p-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Total e Botão */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  {formatPrice(calculateTotal())}
                </span>
              </div>
              
              <Button 
                onClick={handleAddToCart}
                className="w-full gradient-primary text-primary-foreground font-semibold py-3"
                size="lg"
              >
                Adicionar ao Carrinho
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}