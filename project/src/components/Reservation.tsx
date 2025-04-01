import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { reservationService } from '../lib/reservationService'; // Servicio para interactuar con la base de datos
import { Reservation as ReservationType } from '../types';
import toast from 'react-hot-toast';

export default function Reservation() {
  const [userRole, setUserRole] = useState(''); // Eliminar este estado
  const [showForm, setShowForm] = useState(false);
  const [reservations, setReservations] = useState<ReservationType[]>([]);
  const [formData, setFormData] = useState({
    customer_name: '',
    contact_info: '',
    table_id: '',
    reservation_time: '',
    status: 'confirmed'
  });
  const [tables, setTables] = useState([]);

  useEffect(() => {
    // Eliminar toda esta lógica de obtención de rol
    loadReservations();
    loadTables();
  }, []);

  // Cargar mesas desde la base de datos
  const loadTables = async () => {
    try {
      const data = await reservationService.getTables(); // Devuelve las mesas disponibles
      setTables(data);
    } catch (error) {
      toast.error(`Error loading tables: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Cargar reservas desde la base de datos
  const loadReservations = async () => {
    try {
      const data = await reservationService.getReservations(); // Devuelve todas las reservas
      setReservations(data);
    } catch (error) {
      toast.error(`Error loading reservations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Manejar cambios en los campos del formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar la creación de una nueva reserva
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Eliminar validación de rol waiter
    try {
      await reservationService.createReservation({
        ...formData,
        table_id: Number(formData.table_id), // Asegurar que table_id sea un número
        reservation_time: new Date(formData.reservation_time).toISOString() // Convertir la fecha al formato esperado
      });
      toast.success('Reserva creada exitosamente');
      setShowForm(false);
      setFormData({
        customer_name: '',
        contact_info: '',
        table_id: '',
        reservation_time: '',
        status: 'confirmed'
      });
      loadReservations(); // Reload reservations list
    } catch (error) {
      toast.error(`Error creating reservation: ${error instanceof Error ? error.message : 'Please check input data'}`);
    }
  };

  // Funciones para manejar cambios de estado
  const handleCancel = async (reservationId: string) => {
    try {
      await reservationService.updateReservationStatus(reservationId, 'cancelled');
      toast.success('Reservation cancelled');
      loadReservations();
    } catch (error) {
      toast.error(`Error cancelling: ${error instanceof Error ? error.message : 'Please try again'}`);
    }
  };

  const handleSeated = async (reservationId: string, tableId: number) => {
    try {
      await reservationService.updateReservationStatus(reservationId, 'seated');
      await reservationService.createOrderFromReservation(reservationId, tableId);
      toast.success('Status updated and order created');
      loadReservations();
    } catch (error) {
      toast.error(`Error seating: ${error instanceof Error ? error.message : 'Check data'}`);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-semibold">Reservations</h2>
        {userRole !== 'waiter' && (
        <button
          onClick={() => setShowForm(true)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          New Reservation
        </button>
      )}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">New Reservation</h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campos del formulario */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  placeholder="Customer name"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  name="contact_info"
                  value={formData.contact_info}
                  onChange={handleInputChange}
                  placeholder="Phone or email"
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table</label>
                <select
                  name="table_id"
                  value={formData.table_id}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                >
                  <option value="">Select a table</option>
                  {tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      Table {table.number} (Capacity: {table.capacity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date and Time</label>
                <input
                  type="datetime-local"
                  name="reservation_time"
                  value={formData.reservation_time}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-200 rounded-lg"
                />
              </div>

              <button type="submit" className="w-full bg-red-600 text-white py-2 rounded-lg">
                Reserve
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Reservaciones */}
      <div className="space-y-4">
        {reservations.map((reservation) => (
          <div key={reservation.id} className="bg-white p-4 rounded-lg shadow-sm space-y-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium">{reservation.customer_name}</h4>
                <p className="text-sm text-gray-600">Table {reservation.table_id}</p>
                <p className="text-sm">{new Date(reservation.reservation_time).toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-sm ${{
                'confirmed': 'bg-blue-100 text-blue-800',
                'seated': 'bg-green-100 text-green-800',
                'cancelled': 'bg-red-100 text-red-800'
              }[reservation.status]}`}>
                {reservation.status}
              </span>
            </div>
            
            {reservation.status === 'confirmed' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleCancel(reservation.id)}
                  className="px-3 py-1 text-sm bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSeated(reservation.id, reservation.table_id)}
                  className="px-3 py-1 text-sm bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Mark as Seated
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Eliminar estado userRole y useEffect relacionado
// Eliminar verificaciones condicionales por rol