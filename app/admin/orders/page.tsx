'use client';

import { useState, useEffect } from 'react';
import { Search, Trash2, Eye } from 'lucide-react';
import { defaultImages } from '@/data/products';

interface Order {
  id: string;
  items: any[];
  customer: any;
  total: number;
  date: string;
  paymentMethod: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(storedOrders);
  }, []);

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      const updatedOrders = orders.filter(order => order.id !== orderId);
      setOrders(updatedOrders);
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
    }
  };

  const emojiMap: Record<string, string> = {
    dresses: '👗',
    tops: '👚',
    pants: '👖',
    skirts: '👗',
    outerwear: '🧥',
    accessories: '👜',
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="font-display text-3xl text-pearl-50 mb-2">Orders</h1>
        <p className="text-neutral-400">{orders.length} total orders</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by order ID, customer name, or email..."
          className="w-full pl-12 pr-4 py-3 bg-charcoal-900 border border-charcoal-800 rounded-lg text-pearl-50 placeholder:text-neutral-500 focus:outline-none focus:border-pearl-50 transition-colors"
        />
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-charcoal-900 rounded-xl p-12 text-center">
          <p className="text-neutral-400">No orders found</p>
        </div>
      ) : (
        <div className="bg-charcoal-900 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-charcoal-800">
                <tr>
                  <th className="text-left px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Order ID</th>
                  <th className="text-left px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Customer</th>
                  <th className="text-left px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Items</th>
                  <th className="text-left px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Total</th>
                  <th className="text-left px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Date</th>
                  <th className="text-right px-6 py-4 text-xs tracking-wider uppercase text-neutral-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-800">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-charcoal-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-pearl-50 font-mono text-sm">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-pearl-50 text-sm">{order.customer.firstName} {order.customer.lastName}</p>
                      <p className="text-neutral-400 text-xs">{order.customer.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-pearl-50 text-sm">{order.items.length} items</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-pearl-50 font-medium">${order.total.toFixed(2)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-400 text-sm">
                        {new Date(order.date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-charcoal-700 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button
                          onClick={() => deleteOrder(order.id)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-charcoal-800">
            {filteredOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-pearl-50 font-mono text-sm">{order.id}</span>
                  <span className="text-pearl-50 font-medium">${order.total.toFixed(2)}</span>
                </div>
                <p className="text-sm text-neutral-400 mb-2">
                  {order.customer.firstName} {order.customer.lastName}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-neutral-500">
                    {new Date(order.date).toLocaleDateString()}
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 hover:bg-charcoal-700 rounded-lg"
                    >
                      <Eye className="w-4 h-4 text-neutral-400" />
                    </button>
                    <button
                      onClick={() => deleteOrder(order.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm">
          <div className="bg-charcoal-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display text-pearl-50">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-pearl-50"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="text-pearl-50 font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Date</p>
                  <p className="text-pearl-50">{new Date(selectedOrder.date).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Payment</p>
                  <p className="text-pearl-50">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider mb-1">Total</p>
                  <p className="text-pearl-50 font-medium">${selectedOrder.total.toFixed(2)}</p>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h3 className="text-sm text-neutral-400 uppercase tracking-wider mb-3">Customer Information</h3>
                <div className="bg-charcoal-800 rounded-lg p-4 space-y-2">
                  <p className="text-pearl-50">{selectedOrder.customer.firstName} {selectedOrder.customer.lastName}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer.email}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer.phone}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer.address}</p>
                  <p className="text-neutral-400 text-sm">{selectedOrder.customer.city}, {selectedOrder.customer.zipCode}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-sm text-neutral-400 uppercase tracking-wider mb-3">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-charcoal-800 rounded-lg p-4">
                      <div className="w-12 h-12 bg-charcoal-700 rounded flex items-center justify-center text-2xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.product.images?.[0] || defaultImages[item.product.category] || defaultImages.dresses}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = defaultImages[item.product.category] || defaultImages.dresses;
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-pearl-50 text-sm">{item.product.name}</p>
                        <p className="text-neutral-400 text-xs">Size: {item.size} | Color: {item.color}</p>
                        <p className="text-neutral-400 text-xs">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-pearl-50 font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
