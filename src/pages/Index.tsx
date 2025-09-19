import { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { fetchProducts } from '@/services/supabase';
import { CartProvider } from '@/contexts/CartContext';
import { Header } from '@/components/Header';
import { CategoryTabs } from '@/components/CategoryTabs';
import { ProductCard } from '@/components/ProductCard';
import { ProductCustomization } from '@/components/ProductCustomization';
import { CartModal } from '@/components/CartModal';
import { CheckoutModal } from '@/components/CheckoutModal';
import { OrderSearchModal } from '@/components/OrderSearchModal';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category>('Todos');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCustomization, setShowCustomization] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrderSearch, setShowOrderSearch] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const categories: Category[] = ['Todos', 'Pizzas', 'Bebidas', 'Sobremesas'];

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os produtos. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === 'Todos') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.categoria === selectedCategory));
    }
  };

  const handleProductCustomize = (product: Product) => {
    setSelectedProduct(product);
    setShowCustomization(true);
  };

  const handleCartClick = () => {
    setShowCart(true);
  };

  const handleSearchClick = () => {
    setShowOrderSearch(true);
  };

  const handleCheckout = () => {
    setShowCart(false);
    setShowCheckout(true);
  };

  const handleEditOrder = () => {
    setShowOrderSearch(false);
    setShowCart(true);
  };

  const handleEditComplete = () => {
    setShowCheckout(false);
    setShowOrderSearch(true);
  };

  const handleOrderSearch = () => {
    setShowCart(false);
    setShowOrderSearch(true);
  };

  if (loading) {
    return (
      <CartProvider>
        <div className="min-h-screen bg-background">
          <Header onCartClick={handleCartClick} onSearchClick={handleSearchClick} />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Carregando cardápio...</p>
            </div>
          </div>
        </div>
      </CartProvider>
    );
  }

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        <Header onCartClick={handleCartClick} onSearchClick={handleSearchClick} />
        <CategoryTabs 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
        />

        <main className="container mx-auto px-4 py-6">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-muted-foreground">
                Não há produtos disponíveis nesta categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onCustomize={handleProductCustomize}
                />
              ))}
            </div>
          )}
        </main>

        {/* Modals */}
        <ProductCustomization
          product={selectedProduct}
          isOpen={showCustomization}
          onClose={() => {
            setShowCustomization(false);
            setSelectedProduct(null);
          }}
        />

        <CartModal
          isOpen={showCart}
          onClose={() => setShowCart(false)}
          onCheckout={handleCheckout}
          onSearchOrder={handleOrderSearch}
        />

        <CheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          onEditComplete={handleEditComplete}
        />

        <OrderSearchModal
          isOpen={showOrderSearch}
          onClose={() => setShowOrderSearch(false)}
          onEditOrder={handleEditOrder}
        />
      </div>
    </CartProvider>
  );
};

export default Index;