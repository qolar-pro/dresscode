'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, TrendingUp, Users, Package } from 'lucide-react';

interface Order {
  id: string;
  items: any[];
  customer: any;
  total: number;
  date: string;
  paymentMethod: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
    
    const revenue = storedOrders.reduce((sum: number, order: Order) => sum + order.total, 0);
    setTotalRevenue(revenue);
  }, []);

  const stats = [
    {
      icon: ShoppingBag,
      label: 'Total Orders',
      value: orders.length,
      color: 'bg-blue-500/10 text-blue-400',
    },
    {
      icon: TrendingUp,
      label: 'Total Revenue',
      value: `$${totalRevenue.toFixed(2)}`,
      color: 'bg-green-500/10 text-green-400',
    },
    {
      icon: Users,
      label: 'Customers',
      value: new Set(orders.map(o => o.customer.email)).size,
      color: 'bg-purple-500/10 text-purple-400',
    },
    {
      icon: Package,
      label: 'Products',
      value: '12',
      color: 'bg-orange-500/10 text-orange-400',
    },
  ];

  const recentOrders = orders.slice(-5).reverse();

  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-3xl text-pearl-50 mb-2">Dashboard</h1>
        <p className="text-neutral-400">Welcome back! Here's your store overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          
          return (
            <div key={index} className="bg-charcoal-900 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-2xl font-display text-pearl-50 mb-1">{stat.value}</p>
              <p className="text-sm text-neutral-400">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="bg-charcoal-900 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display text-pearl-50">Recent Orders</h2>
          <Link href="/admin/orders" className="text-sm text-pearl-400 hover:text-pearl-50">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400 mb-4">No orders yet</p>
            <Link href="/shop" className="text-sm text-pearl-400 hover:text-pearl-50">
              Start Shopping →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-charcoal-800 rounded-lg">
                <div>
                  <p className="text-pearl-50 font-medium mb-1">{order.id}</p>
                  <p className="text-sm text-neutral-400">
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-pearl-50 font-medium">${order.total.toFixed(2)}</p>
                  <p className="text-xs text-neutral-400">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link 
          href="/admin/orders" 
          className="bg-charcoal-900 rounded-xl p-6 hover:bg-charcoal-800 transition-colors group"
        >
          <ShoppingBag className="w-8 h-8 text-pearl-400 mb-4 group-hover:text-pearl-50" />
          <h3 className="text-lg font-medium text-pearl-50 mb-2">Manage Orders</h3>
          <p className="text-sm text-neutral-400">View and manage all customer orders</p>
        </Link>

        <Link 
          href="/admin/products" 
          className="bg-charcoal-900 rounded-xl p-6 hover:bg-charcoal-800 transition-colors group"
        >
          <Package className="w-8 h-8 text-pearl-400 mb-4 group-hover:text-pearl-50" />
          <h3 className="text-lg font-medium text-pearl-50 mb-2">Manage Products</h3>
          <p className="text-sm text-neutral-400">Add, edit, or remove products</p>
        </Link>
      </div>
    </div>
  );
}
