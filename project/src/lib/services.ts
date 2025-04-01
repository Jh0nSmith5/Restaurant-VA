import { supabase } from './supabase';
import { Order, Transaction, CashOut } from '../types';

export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{
        ...order,
        items: order.items.map(item => ({
          menu_item_id: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw new Error(`Error creating order: ${error.message}`);
    return data;
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('createdAt', { ascending: false });

    if (error) throw new Error(`Error getting orders: ${error.message}`);
    return data;
  },

  async updateOrderStatus(orderId: string, status: Order['status']) {
    const { error } = await supabase
      .from('orders')
      .update({ 
        status,
        updatedAt: new Date().toISOString()
      })
      .eq('id', orderId);

    if (error) throw error;
  }
};

export const transactionService = {
  async createTransaction(transaction: Omit<Transaction, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transaction, createdAt: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw new Error(`Error creating transaction: ${error.message}`);
    return data;
  },

  async getTransactions() {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw new Error(`Error getting transactions: ${error.message}`);
    return data;
  },

  async getPendingTransactions(startDate?: string) {
    let query = supabase.from('transactions').select('*');

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw new Error(`Error getting pending transactions: ${error.message}`);
    return data;
  },
};

export const cashOutService = {
  async createCashOut(cashOut: Omit<CashOut, 'id'>) {
    const { data, error } = await supabase
      .from('cashouts')
      .insert([{ ...cashOut }])
      .select()
      .single();

    if (error) throw new Error(`Error creating cashout: ${error.message}`);
    return data;
  },

  async getCashOuts() {
    const { data, error } = await supabase
      .from('cashouts')
      .select('id, start_time, end_time, initial_amount, final_amount, total_cash, total_card');

    if (error) throw new Error(`Error getting cashouts: ${error.message}`);
    return data;
  },
};