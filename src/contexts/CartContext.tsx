import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { CartItem, Product, SelectedCondiment } from '@/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: { product: Product; selectedCondiments: SelectedCondiment[]; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { itemId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function calculateItemTotal(product: Product, selectedCondiments: SelectedCondiment[], quantity: number): number {
  const condimentsTotal = selectedCondiments.reduce((sum, condiment) => sum + condiment.valor_adicional, 0);
  return (product.valor + condimentsTotal) * quantity;
}

function calculateCartTotals(items: CartItem[]): { totalItems: number; totalPrice: number } {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return { totalItems, totalPrice };
}

function generateItemId(product: Product, selectedCondiments: SelectedCondiment[]): string {
  const condimentIds = selectedCondiments.map(c => c.id_condimento).sort().join('-');
  return `${product.id_produto}-${condimentIds}`;
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, selectedCondiments, quantity } = action.payload;
      const itemId = generateItemId(product, selectedCondiments);
      const totalPrice = calculateItemTotal(product, selectedCondiments, quantity);

      const existingItemIndex = state.items.findIndex(item => item.id === itemId);

      let newItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Atualizar item existente
        const existingItem = state.items[existingItemIndex];
        const newQuantity = existingItem.quantity + quantity;
        const newTotalPrice = calculateItemTotal(product, selectedCondiments, newQuantity);

        newItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: newQuantity, totalPrice: newTotalPrice }
            : item
        );
      } else {
        // Adicionar novo item
        const newItem: CartItem = {
          id: itemId,
          product,
          quantity,
          selectedCondiments,
          totalPrice,
        };
        newItems = [...state.items, newItem];
      }

      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'UPDATE_QUANTITY': {
      const { itemId, quantity } = action.payload;
      
      if (quantity <= 0) {
        return cartReducer(state, { type: 'REMOVE_ITEM', payload: itemId });
      }

      const newItems = state.items.map(item => {
        if (item.id === itemId) {
          const newTotalPrice = calculateItemTotal(item.product, item.selectedCondiments, quantity);
          return { ...item, quantity, totalPrice: newTotalPrice };
        }
        return item;
      });

      const totals = calculateCartTotals(newItems);
      return {
        items: newItems,
        ...totals,
      };
    }

    case 'CLEAR_CART':
      return initialState;

    case 'LOAD_CART': {
      const items = action.payload;
      const totals = calculateCartTotals(items);
      return {
        items,
        ...totals,
      };
    }

    default:
      return state;
  }
}

interface CartContextType {
  state: CartState;
  addItem: (product: Product, selectedCondiments: SelectedCondiment[], quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  loadCart: (items: CartItem[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (product: Product, selectedCondiments: SelectedCondiment[], quantity: number) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, selectedCondiments, quantity } });
  };

  const removeItem = (itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: itemId });
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { itemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const loadCart = (items: CartItem[]) => {
    dispatch({ type: 'LOAD_CART', payload: items });
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, updateQuantity, clearCart, loadCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}