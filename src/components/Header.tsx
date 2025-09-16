import { ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  onCartClick: () => void;
  onSearchClick: () => void;
}

export function Header({ onCartClick, onSearchClick }: HeaderProps) {
  const { state } = useCart();

  return (
    <header className="sticky top-0 z-50 bg-card border-b shadow-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo e informações da pizzaria */}
          <div className="flex flex-col">
            <h1 className="text-xl font-bold text-primary">
              🍕 Pizzaria Bella Vista
            </h1>
            <p className="text-xs text-muted-foreground">
              Aberto: 18:00 às 23:30
            </p>
          </div>

          {/* Ações do header */}
          <div className="flex items-center gap-2">
            {/* Botão de busca */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onSearchClick}
              className="transition-smooth hover:bg-muted"
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Botão do carrinho com contador */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="relative transition-smooth hover:bg-muted"
            >
              <ShoppingCart className="h-5 w-5" />
              {state.totalItems > 0 && (
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold animate-pulse-warm"
                >
                  {state.totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}