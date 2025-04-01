import React, { useState, useEffect } from 'react';
import { Utensils, Clock, CalendarDays, Menu, LogOut, User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import TableManagement from './components/TableManagement';
import OrderManagement from './components/OrderManagement';
import Reservation from './components/Reservation';
import Analytics from './components/Analytics';
import Auth from './components/Auth';
import UserProfile from './components/UserProfile';
import { supabase } from './lib/supabase';

function App() {
  const [activeTab, setActiveTab] = useState('tables');
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (!session) {
    return (
      <>
        <Toaster position="top-right" />
        <Auth onSuccess={() => {}} />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <div className="flex items-center gap-2">
            <Utensils className="w-8 h-8 text-red-800" />
            <h1 className="text-xl font-semibold text-red-800">Dolce Vita</h1>
          </div>
          <p className="text-sm text-gray-500 mt-1">Management</p>
        </div>

        <nav className="mt-6">
          <button
            onClick={() => setActiveTab('tables')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeTab === 'tables' ? 'bg-red-50 text-red-800 border-l-4 border-red-800' : 'text-gray-600'
            }`}
          >
            <Menu size={20} />
            Order Management
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeTab === 'analytics' ? 'bg-red-50 text-red-800 border-l-4 border-red-800' : 'text-gray-600'
            }`}
          >
            <Clock size={20} />
            Cash Register
          </button>
          <button
            onClick={() => setActiveTab('reservation')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeTab === 'reservation' ? 'bg-red-50 text-red-800 border-l-4 border-red-800' : 'text-gray-600'
            }`}
          >
            <CalendarDays size={20} />
            Reservations
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-3 px-6 py-3 text-left ${
              activeTab === 'profile' ? 'bg-red-50 text-red-800 border-l-4 border-red-800' : 'text-gray-600'
            }`}
          >
            <User size={20} />
            Profile
          </button>
        </nav>

        <div className="absolute bottom-0 p-6 border-t border-gray-100 w-64">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-800 rounded-full flex items-center justify-center text-white">
                {session.user.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium">Dolce Vita</p>
                <p className="text-xs text-gray-500">{session.user.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="text-gray-400 hover:text-gray-600"
              title="Sign out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'tables' && <TableManagement />}
        {activeTab === 'analytics' && <Analytics />}
        {activeTab === 'reservation' && <Reservation />}
        {activeTab === 'profile' && <UserProfile user={session.user} />}
      </div>
    </div>
  );
}

export default App;