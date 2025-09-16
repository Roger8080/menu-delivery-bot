import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CustomerData } from '@/types';
import { fetchAddressByCEP, formatCEP } from '@/services/viaCep';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddressStepProps {
  data: Partial<CustomerData>;
  onUpdate: (data: Partial<CustomerData>) => void;
  onNext: () => void;
}

export function AddressStep({ data, onUpdate, onNext }: AddressStepProps) {
  const [loading, setLoading] = useState(false);
  const [cepFormatted, setCepFormatted] = useState(data.cep || '');
  const { toast } = useToast();

  useEffect(() => {
    setCepFormatted(formatCEP(data.cep || ''));
  }, [data.cep]);

  const handleCEPChange = async (value: string) => {
    const formatted = formatCEP(value);
    setCepFormatted(formatted);
    
    const cleaned = value.replace(/\D/g, '');
    onUpdate({ ...data, cep: cleaned });

    if (cleaned.length === 8) {
      setLoading(true);
      try {
        const addressData = await fetchAddressByCEP(cleaned);
        if (addressData) {
          onUpdate({
            ...data,
            cep: cleaned,
            logradouro: addressData.logradouro,
            bairro: addressData.bairro,
            cidade: addressData.localidade,
          });
        }
      } catch (error) {
        toast({
          title: 'Erro ao buscar CEP',
          description: 'Verifique se o CEP está correto e tente novamente.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!data.cep || !data.logradouro || !data.numero || !data.bairro || !data.cidade) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha todos os campos obrigatórios.',
        variant: 'destructive',
      });
      return;
    }

    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold">Endereço de Entrega</h2>
        <p className="text-muted-foreground">Informe onde devemos entregar seu pedido</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="cep">CEP *</Label>
          <div className="relative">
            <Input
              id="cep"
              value={cepFormatted}
              onChange={(e) => handleCEPChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              required
            />
            {loading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="logradouro">Logradouro *</Label>
          <Input
            id="logradouro"
            value={data.logradouro || ''}
            onChange={(e) => onUpdate({ ...data, logradouro: e.target.value })}
            placeholder="Rua, Avenida..."
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="numero">Número *</Label>
            <Input
              id="numero"
              value={data.numero || ''}
              onChange={(e) => onUpdate({ ...data, numero: e.target.value })}
              placeholder="123"
              required
            />
          </div>
          <div>
            <Label htmlFor="complemento">Complemento</Label>
            <Input
              id="complemento"
              value={data.complemento || ''}
              onChange={(e) => onUpdate({ ...data, complemento: e.target.value })}
              placeholder="Apto, Bloco..."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bairro">Bairro *</Label>
          <Input
            id="bairro"
            value={data.bairro || ''}
            onChange={(e) => onUpdate({ ...data, bairro: e.target.value })}
            placeholder="Bairro"
            required
          />
        </div>

        <div>
          <Label htmlFor="cidade">Cidade *</Label>
          <Input
            id="cidade"
            value={data.cidade || ''}
            onChange={(e) => onUpdate({ ...data, cidade: e.target.value })}
            placeholder="Cidade"
            required
          />
        </div>

        <Button 
          type="submit" 
          className="w-full gradient-primary text-primary-foreground font-semibold"
          disabled={loading}
        >
          Continuar
        </Button>
      </form>
    </div>
  );
}