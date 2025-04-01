import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus } from 'lucide-react';
import NewOrderModal from './NewOrderModal';
import OrderDetailsModal from './OrderDetailsModal';

type TableStatus = 'available' | 'occupied';

interface Table {
  id: number;
  status: TableStatus;
  order?: {
    items: string[];
    total: number;
  };
}

const initialTables: Table[] = [];

export default function TableManagement() {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedSection, setSelectedSection] = useState(1);
  const totalSections = Math.ceil(tables.length / 12);
  const filteredTables = tables.slice((selectedSection - 1) * 12, selectedSection * 12);

  const fetchTables = async () => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .order('id', { ascending: true });
    
    if (!error && data) {
      setTables(data);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleProcessPayment = async (tableId: number) => {
    const fetchTables = async () => {
      const { data, error } = await supabase
        .from('tables')
        .select('*')
        .order('id', { ascending: true });
      
      if (!error && data) {
        setTables(data);
      }
    };
    
    await fetchTables();
    setIsOrderDetailsModalOpen(false);
    setSelectedTable(null);
  };
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);

  const handleTableClick = (table: Table) => {
    if (table.status === 'occupied') {
      setSelectedTable(table);
      setIsOrderDetailsModalOpen(true);
    }
  };

  const getTableColor = (status: TableStatus) => {
    return status === 'occupied' ? 'bg-red-100' : 'bg-green-100';
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedSection(prev => Math.max(1, prev - 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
            disabled={selectedSection === 1}
          >
            Previous
          </button>
          <span className="px-4 py-2 bg-gray-100 rounded-lg">
            Section {selectedSection} of {totalSections}
          </span>
          <button
            onClick={() => setSelectedSection(prev => Math.min(totalSections, prev + 1))}
            className="px-3 py-2 border rounded-lg disabled:opacity-50"
            disabled={selectedSection === totalSections}
          >
            Next
          </button>
        </div>
        <button 
          onClick={() => setIsNewOrderModalOpen(true)}
          className="bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Order
        </button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <button
            key={table.id}
            className={`p-4 ${getTableColor(table.status)} rounded-lg shadow-sm hover:shadow-md transition-shadow`}
            onClick={() => handleTableClick(table)}
          >
            <h3 className="text-lg font-medium">Table #{table.id}</h3>
            <p className="text-sm text-gray-600">{table.status}</p>
          </button>
        ))}
      </div>

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        onSubmit={(tableId, items, total) => {
          const updatedTables = tables.map(table => 
            table.id === tableId 
              ? { ...table, status: 'occupied' as TableStatus, order: { items: items.map(item => `${item.menuItem.name} x${item.quantity}${item.notes ? ` (${item.notes})` : ''}`), total } }
              : table
          );
          setTables(updatedTables);
          setIsNewOrderModalOpen(false);
        }}
      />

      <OrderDetailsModal
        isOpen={isOrderDetailsModalOpen}
        onClose={() => setIsOrderDetailsModalOpen(false)}
        tableId={selectedTable?.id}
        onProcessPayment={handleProcessPayment}
        refreshTables={fetchTables}
      />
    </div>
  );
}