import { useEffect, useState } from 'react';
import { transactionService, cashOutService } from '../lib/services';
import { Transaction, CashOut } from '../types';
import toast from 'react-hot-toast';

export default function Analytics() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastCashout, setLastCashout] = useState<CashOut | null>(null);

  useEffect(() => {
    loadTransactions();
  }, [lastCashout]);

  const loadTransactions = async () => {
    try {
      const { data: cashouts } = await cashOutService.getCashOuts();
      const last = cashouts?.[0];
      setLastCashout(last || null);

      // Determinar la fecha de inicio (si hay cashout previo)
      const startDate = last ? new Date(last.end_time).toISOString() : undefined;

      // Llamar a getPendingTransactions con o sin startDate
      const data = await transactionService.getPendingTransactions(startDate);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast.error(error instanceof Error ? error.message : 'Error loading transactions');
    }
  };

  const handleCashOut = async () => {
    if (transactions.length === 0) {
      toast.error('No transactions to cash out');
      return;
    }

    setLoading(true);
    try {
      // Calcular totales basados en las transacciones
      const totalCash = transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0);
      const totalCard = transactions.filter(t => t.paymentMethod === 'card').reduce((sum, t) => sum + t.amount, 0);
      const totalAmount = totalCash + totalCard;

      // Crear el cashout con los datos calculados
      await cashOutService.createCashOut({
        start_time: transactions[0]?.created_at || new Date().toISOString(),
        end_time: new Date().toISOString(),
        initial_amount: lastCashout?.final_amount || 0,
        final_amount: (lastCashout?.final_amount || 0) + totalAmount,
        total_cash: totalCash,
        total_card: totalCard
      });

      toast.success('Cash out completed successfully');
      await loadTransactions();
    } catch (error) {
      console.error('Error processing cash out:', error);
      toast.error('Error processing cash out');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-8">
      <h2 className="text-2xl font-semibold mb-6">Analytics</h2>

      <div className="bg-white rounded-lg shadow">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4">Order ID</th>
              <th className="text-left p-4">Transaction ID</th>
              <th className="text-left p-4">Date</th>
              <th className="text-left p-4">Amount</th>
              <th className="text-left p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id} className="border-b">
                <td className="p-4">{transaction.order_id}</td> {/* Mostrar el ID de la orden */}
                <td className="p-4">{transaction.id}</td>
                <td className="p-4">{formatDate(transaction.created_at)}</td>
                <td className="p-4">${transaction.amount.toFixed(2)}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <button 
          onClick={handleCashOut}
          disabled={loading || transactions.length === 0}
          className={`bg-red-800 text-white px-6 py-2 rounded-lg ${(loading || transactions.length === 0) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-900'}`}
        >
          {loading ? 'Processing...' : 'Cash out'}
        </button>
        {transactions.length > 0 && (
          <span className="text-sm text-gray-600">
            Total amount: ${transactions.reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
          </span>
        )}
      </div>
    </div>
  );
}