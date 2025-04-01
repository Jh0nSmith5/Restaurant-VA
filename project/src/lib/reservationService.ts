import { supabase } from './supabase'; // Importación de la instancia de Supabase
import { Reservation } from '../types'; // Importación del tipo Reservation

export const reservationService = {
  // Crear una nueva reservación
  async createReservation(reservation: Omit<Reservation, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          ...reservation,
          reservation_time: new Date(reservation.reservation_time).toISOString(), // Formato ISO
          created_at: new Date().toISOString() // Fecha de creación
        }
      ])
      .select()
      .single(); // Devuelve una única fila

    if (error) throw new Error(`Error al crear la reservación: ${error.message}`);
    return data; // Retorna la reservación creada
  },

  // Obtener todas las reservaciones
  async getReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        id,
        customer_name,
        contact_info,
        reservation_time,
        status,
        created_at,
        tables (id, table_number, capacity) -- Relación con la tabla tables
      `)
      .order('reservation_time', { ascending: true }); // Ordenar por fecha de reservación

    if (error) throw new Error(`Error al obtener las reservaciones: ${error.message}`);
    return data; // Retorna las reservaciones obtenidas
  },

  // Actualizar el estado de una reservación
  async updateReservationStatus(reservationId: string, status: Reservation['status']) {
    const { error } = await supabase
      .from('reservations')
      .update({
        status,
      })
      .eq('id', reservationId); // Filtra por ID de reservación

    if (error) throw new Error(`Error al actualizar el estado de la reservación: ${error.message}`);
  },

  // Eliminar una reservación
  async deleteReservation(reservationId: string) {
    const { error } = await supabase
      .from('reservations')
      .delete()
      .eq('id', reservationId); // Filtra por ID de reservación

    if (error) throw new Error(`Error al eliminar la reservación: ${error.message}`);
  },

  // Obtener todas las mesas disponibles
  async getTables() {
    const { data, error } = await supabase
      .from('tables')
      .select('id, table_number, capacity, status') // Selección de los campos clave
      .order('table_number', { ascending: true }); // Ordena las mesas por número

    if (error) throw new Error(`Error al obtener las mesas: ${error.message}`);
    return data; // Retorna las mesas obtenidas
  },

  // Crear orden desde una reservación
  async createOrderFromReservation(reservationId: string) {
    // Obtener la reservación
    const { data: reservation, error: reservationError } = await supabase
      .from('reservations')
      .select('table_id')
      .eq('id', reservationId)
      .single();

    if (reservationError) throw new Error(`Error al obtener reservación: ${reservationError.message}`);
    if (!reservation) throw new Error('Reservación no encontrada');

    // Crear la nueva orden
    const { data: newOrder, error: orderError } = await supabase
      .from('orders')
      .insert([{
        table_id: reservation.table_id,
        total: 0,
        status: 'pending',
        items: []
      }])
      .select()
      .single();

    if (orderError) throw new Error(`Error al crear orden: ${orderError.message}`);

    // Actualizar estado de la mesa
    const { error: tableError } = await supabase
      .from('tables')
      .update({ status: 'occupied' })
      .eq('id', reservation.table_id);

    if (tableError) throw new Error(`Error al actualizar mesa: ${tableError.message}`);

    return newOrder;
  }
};

