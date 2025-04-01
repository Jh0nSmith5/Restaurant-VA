import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

type UserRole = 'admin' | 'cashier' | 'Waiter';

interface AuthProps {
  onSuccess: () => void;
}

export default function Auth({ onSuccess }: AuthProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const ACCESS_CODES = {
    admin: 'ADMIN123',
    cashier: 'CASH456',
    Waiter: 'WAIT789'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!isLogin) {
        if (!firstName.trim() || !lastName.trim()) {
          toast.error('First name and last name are required');
          return;
        }
        if (accessCode !== ACCESS_CODES[selectedRole]) {
          toast.error('Invalid access code for selected role');
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
      }

      const { error, data } = isLogin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: selectedRole,
                first_name: firstName,
                last_name: lastName
              }
            }
          });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success(isLogin ? 'Welcome back!' : 'Account created successfully!');
        onSuccess();
      }
    } catch (error) {
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1579684947550-22e945225d9a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2074&q=80')] bg-cover">
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>
      
      <div className="relative bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin
                ? 'Please sign in to your account'
                : 'Please complete your information'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Select Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                >
                  <option value="admin">Admin</option>
                  <option value="cashier">Cashier</option>
                  <option value="Waiter">Waiter</option>
                </select>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Access Code
                  </label>
                  <input
                    type="password"
                    required
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
                    placeholder={`Enter access code for ${selectedRole}`}
                  />
                </div>
                
            </>
          )}

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-800 hover:bg-red-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {isLogin ? 'Sign In' : 'Register'}
          </button>
        </form>

        {isLogin && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              ¿Need to create an account?
            </button>
          </div>
        )}

        {!isLogin && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className="w-full text-center text-sm text-gray-600 hover:text-gray-900"
            >
              Already have an account? <span className="font-medium text-red-800">Sign In</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Eliminar tipo UserRole y estado selectedRole
// Eliminar verificación de código de acceso por rol
// Eliminar campo role al crear usuario