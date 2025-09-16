import { Category } from '@/types';
import { Button } from '@/components/ui/button';

interface CategoryTabsProps {
  selectedCategory: Category;
  onCategoryChange: (category: Category) => void;
  categories: Category[];
}

export function CategoryTabs({ selectedCategory, onCategoryChange, categories }: CategoryTabsProps) {
  const getCategoryIcon = (category: Category): string => {
    switch (category) {
      case 'Todos':
        return '🍽️';
      case 'Pizzas':
        return '🍕';
      case 'Bebidas':
        return '🥤';
      case 'Sobremesas':
        return '🍰';
      default:
        return '🍽️';
    }
  };

  return (
    <div className="bg-card border-b shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "ghost"}
              size="sm"
              onClick={() => onCategoryChange(category)}
              className={`flex items-center gap-2 whitespace-nowrap transition-smooth ${
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground shadow-button'
                  : 'hover:bg-muted'
              }`}
            >
              <span className="text-sm">{getCategoryIcon(category)}</span>
              <span className="font-medium">{category}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}