import { Product } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
  onCustomize: (product: Product) => void;
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return `R$ ${price.toFixed(2).replace('.', ',')}`;
  };

  return (
    <Card className="group overflow-hidden shadow-card hover:shadow-floating transition-smooth animate-slide-up">
      <div className="relative aspect-square overflow-hidden">
        {product.link_imagem ? (
          <img
            src={product.link_imagem}
            alt={product.titulo}
            className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <span className="text-6xl">🍕</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-card/90 text-card-foreground shadow-sm">
            {product.categoria}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-2">
            {product.titulo}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {product.descricao}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatPrice(product.valor)}
          </span>
          
          <Button
            onClick={() => onCustomize(product)}
            size="sm"
            className="gradient-primary text-primary-foreground font-semibold px-4 hover:shadow-button transition-smooth"
          >
            Personalizar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}