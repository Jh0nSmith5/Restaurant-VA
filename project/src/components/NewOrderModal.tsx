import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import OrderForm from './OrderForm';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tableId: number, items: any[], total: number) => void;
}

export default function NewOrderModal({ isOpen, onClose, onSubmit }: NewOrderModalProps) {
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [tables, setTables] = useState<number[]>([]);
  const [selectedSection, setSelectedSection] = useState(1);
  const totalSections = Math.ceil(tables.length / 12);
  const filteredTables = tables.slice((selectedSection - 1) * 12, selectedSection * 12);

  useEffect(() => {
    const fetchTables = async () => {
      const { data } = await supabase
        .from('tables')
        .select('id')
        .eq('status', 'available')
        .order('id');
      
      if (data) {
        setTables(data.map(table => table.id));
      }
    };
    fetchTables();
  }, []);

  if (!isOpen) return null;

  const handleTableSelect = (tableId: number) => {
    setSelectedTable(tableId);
    setShowOrderForm(true);
  };

  const handleOrderSubmit = async (items: any[], total: number) => {
    if (selectedTable) {
      const { error } = await supabase
        .from('orders')
        .insert([{
          table_id: selectedTable,
          items: items.map(item => ({
            menu_item_id: item.menuItem.id,
            quantity: item.quantity,
            notes: item.notes
          })),
          total,
          status: 'pending'
        }]);
  
      if (!error) {
        onSubmit(selectedTable, items, total);
        await supabase
          .from('tables')
          .update({ status: 'occupied' })
          .eq('id', selectedTable);
        await fetchTables();
      }
    }
  };

  const handleCancel = () => {
    setSelectedTable(null);
    setShowOrderForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6" style={{ width: showOrderForm ? '800px' : '400px' }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">New Order</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        {!showOrderForm ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Table
              </label>
              <div className="grid grid-cols-3 gap-4 mt-4">
                {filteredTables.map((tableId) => (
                  <button
                    key={tableId}
                    onClick={() => handleTableSelect(tableId)}
                    className="p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors text-center"
                  >
                    <span className="font-medium">Table #{tableId}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-2 justify-center mt-4">
              <button
                onClick={() => setSelectedSection(prev => Math.max(1, prev - 1))}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                disabled={selectedSection === 1}
              >
                <ChevronLeft size={20} />
              </button>
              <span className="px-3 py-1 bg-gray-100 rounded">
                Section {selectedSection} of {totalSections}
              </span>
              <button
                onClick={() => setSelectedSection(prev => Math.min(totalSections, prev + 1))}
                className="px-3 py-1 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                disabled={selectedSection === totalSections}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        ) : (
          <OrderForm
            onSubmit={handleOrderSubmit}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}