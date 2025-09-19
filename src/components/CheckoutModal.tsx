import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Edit } from 'lucide-react';
import { CustomerData } from '@/types';
import { AddressStep } from './checkout/AddressStep';
import { PersonalDataStep } from './checkout/PersonalDataStep';
import { PaymentStep } from './checkout/PaymentStep';
import { ConfirmationStep } from './checkout/ConfirmationStep';
import { useCart } from '@/contexts/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditComplete?: () => void;
}

export function CheckoutModal({ isOpen, onClose, onEditComplete }: CheckoutModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [customerData, setCustomerData] = useState<Partial<CustomerData>>({});
  const { state } = useCart();

  // Pré-preencher dados do cliente quando estiver editando um pedido
  useEffect(() => {
    if (state.editingOrderCode && state.customerData) {
      setCustomerData(state.customerData);
    }
  }, [state.editingOrderCode, state.customerData]);

  const steps = [
    { number: 1, title: 'Endereço', completed: false },
    { number: 2, title: 'Dados', completed: false },
    { number: 3, title: 'Pagamento', completed: false },
    { number: 4, title: 'Confirmação', completed: false },
  ];

  const updateCustomerData = (data: Partial<CustomerData>) => {
    setCustomerData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const previousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleComplete = () => {
    setCurrentStep(1);
    setCustomerData({});
    onClose();
  };

  const handleEditComplete = () => {
    setCurrentStep(1);
    setCustomerData({});
    onClose();
    onEditComplete?.();
  };

  const handleClose = () => {
    setCurrentStep(1);
    if (!state.editingOrderCode) {
      setCustomerData({});
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header com progresso */}
        <div className="flex justify-between items-center pb-4 border-b">
          <div className="flex items-center gap-2">
            {state.editingOrderCode && (
              <div className="flex items-center gap-2 mr-4 px-3 py-1 bg-primary/10 text-primary rounded-md">
                <Edit className="h-4 w-4" />
                <span className="text-sm font-medium">Editando: {state.editingOrderCode}</span>
              </div>
            )}
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-smooth ${
                    step.number === currentStep 
                      ? 'bg-primary text-primary-foreground' 
                      : step.number < currentStep
                      ? 'bg-success text-success-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step.number}
                </div>
                {index < steps.length - 1 && (
                  <div 
                    className={`w-8 h-1 mx-2 transition-smooth ${
                      step.number < currentStep ? 'bg-success' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Conteúdo da etapa atual */}
        <div className="pt-4">
          {currentStep === 1 && (
            <AddressStep
              data={customerData}
              onUpdate={updateCustomerData}
              onNext={nextStep}
            />
          )}
          
          {currentStep === 2 && (
            <PersonalDataStep
              data={customerData}
              onUpdate={updateCustomerData}
              onNext={nextStep}
              onPrevious={previousStep}
            />
          )}
          
          {currentStep === 3 && (
            <PaymentStep
              data={customerData}
              onUpdate={updateCustomerData}
              onNext={nextStep}
              onPrevious={previousStep}
            />
          )}
          
          {currentStep === 4 && (
            <ConfirmationStep
              customerData={customerData as CustomerData}
              onPrevious={previousStep}
              onComplete={handleComplete}
              onEditComplete={handleEditComplete}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}