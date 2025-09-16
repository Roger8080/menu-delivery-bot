import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerData } from '@/types';
import { formatPhone } from '@/services/viaCep';
import { useToast } from '@/hooks/use-toast';
import { ChevronLeft } from 'lucide-react';

interface PersonalDataStepProps {
  data: Partial<CustomerData>;
  onUpdate: (data: Partial<CustomerData>) => void;
  onNext: () => void;
  onPrevious: () => void;
}

export function PersonalDataStep({ data, onUpdate, onNext, onPrevious }: PersonalDataStepProps) {
  const [phoneFormatted, setPhoneFormatted] = useState(data.telefone || '');
  const { toast } = useToast();

  useEffect(() => {
    setPhoneFormatted(formatPhone(data.telefone || ''));
  }, [data.telefone]);

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setPhoneFormatted(formatted);
    
    const cleaned = value.replace(/\D/g, '');
    onUpdate({ ...data, telefone: cleaned });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.nome || data.nome.length < 2) {
      toast({
        title: 'Nome inválido',
        description: 'Informe seu nome completo (mínimo 2 caracteres).',
        variant: 'destructive',
      });
      return;
    }

    if (!data.telefone || data.telefone.length < 10) {
      toast({
        title: 'Telefone inválido',
        description: 'Informe um telefone válido com DDD (10 ou 11 dígitos).',
        variant: 'destructive',
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Dados Pessoais</h2>
        <p className="text-muted-foreground">Como podemos te chamar e entrar em contato?</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="nome">Nome Completo *</Label>
          <Input
            id="nome"
            value={data.nome || ''}
            onChange={(e) => onUpdate({ ...data, nome: e.target.value })}
            placeholder="Seu nome completo"
            required
            minLength={2}
          />
        </div>

        <div>
          <Label htmlFor="telefone">Telefone com DDD *</Label>
          <Input
            id="telefone"
            value={phoneFormatted}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="(11) 99999-9999"
            maxLength={15}
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Formato: (11) 99999-9999
          </p>
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
            type="submit" 
            className="flex-1 gradient-primary text-primary-foreground font-semibold"
          >
            Continuar
          </Button>
        </div>
      </form>
    </div>
  );
}