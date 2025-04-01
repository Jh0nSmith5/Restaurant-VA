import React from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserProfileProps {
  user: User;
}

export default function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Perfil de Usuario</h2>
      
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center text-white text-2xl">
            {user.email?.[0].toUpperCase()}
          </div>
          
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.user_metadata?.first_name || 'Usuario'}
            </h3>
            <h3 className="text-xl font-semibold text-gray-900">
              {user.user_metadata?.last_name || 'Usuario'}
            </h3>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Información de la cuenta</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-900">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}