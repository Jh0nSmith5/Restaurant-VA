export interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export interface OrderItem {
  menuItemId: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface CashOut {
  id: string;
  start_time: string;
  end_time?: string;
  initial_amount: number;
  final_amount?: number;
  total_cash: number;
  total_card: number;
}

export interface Reservation {
  id: string;
  customer_name: string;
  contactInfo: string;
  tableId?: number;
  reservationTime: string;
  status: 'confirmed' | 'seated' | 'cancelled';
  createdAt: string;
}