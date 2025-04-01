import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes?: string;
}

interface OrderFormProps {
  onSubmit: (items: OrderItem[], total: number) => void;
  onCancel: () => void;
}



export default function OrderForm({ onSubmit, onCancel }: OrderFormProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>('Comida');

  useEffect(() => {
    const fetchMenuItems = async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('category');

      if (error) {
        console.error('Error fetching menu items:', error);
        return;
      }

      if (data) {
        setMenuItems(data);
        console.log('Menu items loaded:', data);
      }
    };

    fetchMenuItems();
  }, []);

  const addItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { menuItem, quantity: 1 }]);
    }
  };

  const removeItem = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    if (existingItem) {
      if (existingItem.quantity > 1) {
        setOrderItems(orderItems.map(item =>
          item.menuItem.id === menuItem.id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ));
      } else {
        setOrderItems(orderItems.filter(item => item.menuItem.id !== menuItem.id));
      }
    }
  };

  const updateNotes = (menuItem: MenuItem, notes: string) => {
    setOrderItems(orderItems.map(item =>
      item.menuItem.id === menuItem.id
        ? { ...item, notes }
        : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => 
      total + (item.menuItem.price * item.quantity), 0
    );
  };

  const handleSubmit = () => {
    if (orderItems.length === 0) return;
    onSubmit(orderItems, calculateTotal());
  };

  const categories = Array.from(new Set(menuItems.map(item => item.category || 'Others')));

  return (
    <div className="space-y-6">
      <div className="flex gap-2 pb-4 overflow-x-auto">

        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg ${selectedCategory === category ? 'bg-red-800 text-white' : 'bg-gray-200'}`}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {Object.entries(
          menuItems.reduce((acc, item) => {
            const category = item.category || 'Others';
            if(selectedCategory !== null && category !== selectedCategory) return acc;
            acc[category] = acc[category] || [];
            acc[category].push(item);
            return acc;
          }, {})
        ).map(([category, items]) => (
          <div key={category} className="col-span-2 space-y-2">
            <h3 className="text-lg font-semibold bg-gray-100 p-2 rounded">
              {category}
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {items.map((menuItem) => {
                const orderItem = orderItems.find(item => item.menuItem.id === menuItem.id);
                return (
                  <div key={menuItem.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{menuItem.name}</h3>
                        <p className="text-sm text-gray-500">${menuItem.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => removeItem(menuItem)}
                          className="px-2 py-1 text-red-600 disabled:text-gray-400"
                          disabled={!orderItem}
                        >
                          -
                        </button>
                        <span className="w-8 text-center">
                          {orderItem?.quantity || 0}
                        </span>
                        <button
                          onClick={() => addItem(menuItem)}
                          className="px-2 py-1 text-green-600"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    {orderItem && (
                      <input
                        type="text"
                        placeholder="Special notes"
                        className="mt-2 w-full px-2 py-1 text-sm border rounded"
                        value={orderItem.notes || ''}
                        onChange={(e) => updateNotes(menuItem, e.target.value)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-4">
          <span className="font-medium">Total:</span>
          <span className="text-xl font-bold">
            ${calculateTotal().toFixed(2)}
          </span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            disabled={orderItems.length === 0}
          >
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}