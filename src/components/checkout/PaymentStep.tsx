import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CustomerData } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { ChevronLeft, CreditCard, Smartphone, Banknote } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentStepProps {
  data: Partial<CustomerData>;
  onUpdate: (data: Partial<CustomerData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PaymentStep({ data, onUpdate, onNext, onPrevious }: PaymentStepProps) {
  const { state } = useCart();
  const { toast } = useToast();

  const paymentMethods = [
    {
      id: 'Cartão de Crédito',
      label: 'Cartão de Crédito',
      icon: CreditCard,
      description: 'Visa, Mastercard, Elo'
    },
    {
      id: 'Cartão de Débito',
      label: 'Cartão de Débito',
      icon: CreditCard,
      description: 'Débito no cartão'
    },
    {
      id: 'Dinheiro',
      label: 'Dinheiro',
      icon: Banknote,
      description: 'Pagamento na entrega'
    },
    {
      id: 'PIX',
      label: 'PIX',
      icon: Smartphone,
      description: 'Transferência instantânea'
    }
  ];

  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  const handleSubmit = () => {
    if (!data.tipo_pagamento) {
      toast({
        title: 'Forma de pagamento',
        description: 'Selecione uma forma de pagamento.',
        variant: 'destructive',
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Forma de Pagamento</h2>
        <p className="text-muted-foreground">Como você gostaria de pagar?</p>
      </div>

      {/* Resumo do Pedido */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Resumo do Pedido</h3>
          <div className="space-y-2">
            {state.items.map((item, index) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {index + 1}. {item.product.titulo}
                  {item.quantity > 1 && ` x${item.quantity}`}
                </span>
                <span>{formatPrice(item.totalPrice)}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary">{formatPrice(state.totalPrice)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Pagamento */}
      <div>
        <h3 className="font-semibold mb-3">Selecione a forma de pagamento</h3>
        <RadioGroup 
          value={data.tipo_pagamento || ''} 
          onValueChange={(value) => onUpdate({ ...data, tipo_pagamento: value as CustomerData['tipo_pagamento'] })}
        >
          <div className="space-y-3">
            {paymentMethods.map((method) => {
              const Icon = method.icon;
              return (
                <div key={method.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={method.id} id={method.id} />
                  <Label 
                    htmlFor={method.id} 
                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted transition-smooth flex items-center gap-3"
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{method.label}</div>
                      <div className="text-sm text-muted-foreground">{method.description}</div>
                    </div>
                  </Label>
                </div>
              );
            })}
          </div>
        </RadioGroup>
      </div>

      <div className="flex gap-3">
        <Button 
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        
        <Button 
          onClick={handleSubmit}
          className="flex-1 gradient-primary text-primary-foreground font-semibold"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}