-- Crear la tabla de órdenes
-- Drop the existing type if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_item') THEN
        DROP TYPE order_item;
    END IF;
END $$;

-- Create the orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id INTEGER NOT NULL,
  total NUMERIC NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the composite type for order items
CREATE TYPE order_item AS (
  menu_item_id INTEGER,
  quantity INTEGER,
  notes TEXT
);

-- Add the items column (array) to the orders table
ALTER TABLE orders
ADD COLUMN items order_item[];

-- Create the tables table
CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  table_number INTEGER NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL CHECK (status IN ('available', 'occupied')),
  capacity INTEGER NOT NULL
);

-- Create the menu items table
CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  category VARCHAR(50) NOT NULL,
  available BOOLEAN NOT NULL DEFAULT true
);

-- Create the transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  amount NUMERIC(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create the cashouts table
CREATE TABLE cashouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  initial_amount NUMERIC(10,2) NOT NULL,
  final_amount NUMERIC(10,2),
  total_cash NUMERIC(10,2),
  total_card NUMERIC(10,2)
);

-- Create the reservations table
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name VARCHAR(100) NOT NULL,
  contact_info VARCHAR(100) NOT NULL,
  table_id INTEGER REFERENCES tables(id),
  reservation_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN ('confirmed', 'seated', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add the foreign key in the orders table to relate them to tables
ALTER TABLE orders
ADD CONSTRAINT fk_orders_tables FOREIGN KEY (table_id) REFERENCES tables(id);