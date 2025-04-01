import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderForm from './OrderForm';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tableId: number | null;
  onProcessPayment: (tableId: number) => void;
  refreshTables: () => void;
}

interface OrderItem {
  menu_item_id: string;
  quantity: number;
  notes?: string;
  menu_item: {
    name: string;
    price: number;
  };
}

export default function OrderDetailsModal({ isOpen, onClose, tableId, onProcessPayment, refreshTables }: OrderDetailsModalProps) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('cash');
  const [showAddItems, setShowAddItems] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!tableId) return;

      try {
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('table_id', tableId)
          .eq('status', 'pending')
          .single();

        if (orderError) throw orderError;

        const menuItemIds = orderData.items.map((item: any) => item.menu_item_id.toString());
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('menu_items')
          .select('id, name, price')
          .in('id', menuItemIds);

        if (menuItemsError) throw menuItemsError;

        const itemsWithDetails = orderData.items.map((item: any) => ({
          ...item,
          menu_item: menuItemsData.find(mi => mi.id === item.menu_item_id)
        }));

        setOrder({
          ...orderData,
          items: itemsWithDetails,
          total: itemsWithDetails.reduce((sum: number, item: OrderItem) => sum + (item.menu_item.price * item.quantity), 0)
        });
        setError(null);
      } catch (err) {
        setError('Error loading order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchOrder();
    }
  }, [isOpen, tableId]);

  if (!isOpen || !tableId) return null;

return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      {showAddItems && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[800px]">
            <OrderForm
              onSubmit={async (items, total) => {
                try {
                  const mergedItems = [...order.items, ...items.map(item => ({
                    menu_item_id: item.menuItem.id.toString(),
                    quantity: item.quantity,
                    notes: item.notes,
                    menu_item: item.menuItem
                  }))];
                  const newTotal = order.total + total;

                  const { error } = await supabase
                    .from('orders')
                    .update({
                      items: mergedItems,
                      total: newTotal
                    })
                    .eq('id', order.id);

                  if (!error) {
                    setOrder({...order, items: mergedItems, total: newTotal});
                    setShowAddItems(false);
                    await refreshTables();
                  }
                } catch (err) {
                  setError('Error adding items');
                  console.error(err);
                }
              }}
              onCancel={() => setShowAddItems(false)}
            />
          </div>
        </div>
      )}

        <div className="bg-white rounded-lg p-6 w-[500px]">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Order Details - Table #{tableId}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
            </button>
        </div>

        <div className="space-y-4">
        <div className="border-b pb-4">
            <h3 className="font-medium mb-2">Items:</h3>
            <ul className="space-y-2">
            {order?.items?.map((item: any, index: number) => (
  <li key={index} className="flex justify-between">
    <span>{item.menu_item?.name} x{item.quantity}</span>
    <span>${(item.menu_item?.price * item.quantity).toFixed(2)}</span>
  </li>
))}
            </ul>
        </div>

        <div className="flex justify-between items-center text-lg font-medium">
            <span>Total:</span>
            <span>${order?.total?.toFixed(2)}</span>
        </div>

        {error && 
  <div className="text-red-600 mb-4 p-2 bg-red-100 rounded-lg">
    {error}
  </div>
}
<div className="mb-4">
  <h3 className="font-medium mb-2">Payment Method:</h3>
  <select 
    value={selectedPaymentMethod}
    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
    className="w-full p-2 border rounded"
  >
    <option value="cash">Cash</option>
    <option value="card">Card</option>
  </select>
</div>

<div className="flex justify-end gap-3 mt-6">
  <button
    onClick={() => setShowAddItems(true)}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
  >
    Add More Items
  </button>
  <button
    onClick={onClose}
    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
  >
    Cancel
  </button>
  <button
  onClick={async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          order_id: order.id,
          amount: order.total,
          payment_method: selectedPaymentMethod,
          status: 'completed',
          created_at: new Date().toISOString()
        }]);

      if (transactionError) throw transactionError;

      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id);

      if (orderError) throw orderError;

      const { error: tableError } = await supabase
        .from('tables')
        .update({ status: 'available' })
        .eq('id', tableId);

      if (tableError) throw tableError;

      await refreshTables();
      onClose();
    } catch (err) {
      setError('Error processing payment');
      console.error(err);
    }
  }}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800"
            >
            Process Payment
            </button>
        </div>
        </div>
    </div>
    </div>
);
}