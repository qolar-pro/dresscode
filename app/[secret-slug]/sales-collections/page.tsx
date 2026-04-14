'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Save, X, Loader2, Tag } from 'lucide-react';

interface SalesCollection {
  id: number;
  name: string;
  description: string;
  discount_percentage: number;
  image_url: string;
  product_ids: number[];
  is_active: boolean;
}

interface Product {
  id: number;
  name: string;
  category: string;
}

export default function AdminSalesCollections() {
  const [collections, setCollections] = useState<SalesCollection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCollection, setEditingCollection] = useState<SalesCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [collectionsRes, productsRes] = await Promise.all([
        fetch('/api/sales-collections'),
        fetch('/api/products'),
      ]);

      const collectionsData = await collectionsRes.json();
      const productsData = await productsRes.json();

      if (collectionsData.collections && Array.isArray(collectionsData.collections)) {
        setCollections(collectionsData.collections.map((c: any) => ({
          ...c,
          product_ids: Array.isArray(c.product_ids) ? c.product_ids : [],
        })));
      }
      
      if (productsData.products && Array.isArray(productsData.products)) {
        setProducts(productsData.products);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEdit = (collection: SalesCollection) => {
    setEditingCollection({ ...collection });
    setIsEditing(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this collection?')) return;

    try {
      const res = await fetch('/api/sales-collections', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) throw new Error('Failed to delete collection');
      await fetchData();
    } catch (error) {
      console.error('Error deleting collection:', error);
      alert('Failed to delete collection');
    }
  };

  const handleSave = async () => {
    if (!editingCollection) return;
    setSaving(true);

    try {
      const isExisting = collections.find(c => c.id === editingCollection.id);
      const method = isExisting ? 'PATCH' : 'POST';

      const payload = {
        id: editingCollection.id,
        name: editingCollection.name,
        description: editingCollection.description,
        discount_percentage: editingCollection.discount_percentage,
        image_url: editingCollection.image_url,
        product_ids: editingCollection.product_ids || [],
        is_active: editingCollection.is_active,
      };

      const res = await fetch('/api/sales-collections', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save collection');
      }

      await fetchData();
      setIsEditing(false);
      setEditingCollection(null);
    } catch (error: any) {
      console.error('Error saving collection:', error);
      alert('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleNewCollection = () => {
    const newCollection: SalesCollection = {
      id: Date.now(),
      name: 'New Sale',
      description: 'Sale description',
      discount_percentage: 20,
      image_url: '',
      product_ids: [],
      is_active: true,
    };
    setEditingCollection(newCollection);
    setIsEditing(true);
  };

  const toggleProduct = (productId: number) => {
    if (!editingCollection) return;

    const currentIds = editingCollection.product_ids || [];
    const updatedIds = currentIds.includes(productId)
      ? currentIds.filter(id => id !== productId)
      : [...currentIds, productId];

    setEditingCollection({ ...editingCollection, product_ids: updatedIds });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-pearl-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-pearl-50 mb-2">Sales Collections</h1>
          <p className="text-neutral-400">{collections.length} active collections</p>
        </div>
        <button
          onClick={handleNewCollection}
          className="flex items-center gap-2 bg-pearl-50 text-charcoal-900 px-4 py-2 rounded-lg font-medium hover:bg-pearl-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Collection
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <div className="bg-charcoal-900 rounded-xl p-12 text-center">
          <Tag className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-neutral-400 mb-4">No sales collections yet</p>
          <button
            onClick={handleNewCollection}
            className="text-sm text-pearl-400 hover:text-pearl-50"
          >
            Create your first collection →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {collections.map((collection) => (
            <div key={collection.id} className="bg-charcoal-900 rounded-xl overflow-hidden">
              {/* Collection Image */}
              <div className="aspect-video bg-charcoal-800 flex items-center justify-center overflow-hidden">
                {collection.image_url ? (
                  <img
                    src={collection.image_url}
                    alt={collection.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Tag className="w-12 h-12 text-neutral-600" />
                )}
              </div>

              {/* Collection Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-pearl-50 font-medium mb-1">{collection.name}</h3>
                    <p className="text-xs text-neutral-400">{(collection.product_ids || []).length} products</p>
                  </div>
                  <span className="text-lg font-display text-red-400">-{collection.discount_percentage}%</span>
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    collection.is_active ? 'bg-green-500/20 text-green-400' : 'bg-neutral-500/20 text-neutral-400'
                  }`}>
                    {collection.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(collection)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-charcoal-800 hover:bg-charcoal-700 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-400">Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(collection.id)}
                    className="p-2 bg-charcoal-800 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editingCollection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm">
          <div className="bg-charcoal-900 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display text-pearl-50">
                  {collections.find(c => c.id === editingCollection.id) ? 'Edit Collection' : 'New Collection'}
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingCollection(null);
                  }}
                  className="text-neutral-400 hover:text-pearl-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Collection Name */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Collection Name</label>
                <input
                  type="text"
                  value={editingCollection.name}
                  onChange={(e) => setEditingCollection({ ...editingCollection, name: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                  placeholder="Summer Sale, Black Friday, etc."
                />
              </div>

              {/* Discount & Image URL */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Discount (%)</label>
                  <input
                    type="number"
                    value={editingCollection.discount_percentage}
                    onChange={(e) => setEditingCollection({ ...editingCollection, discount_percentage: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Cover Image URL</label>
                  <input
                    type="url"
                    value={editingCollection.image_url}
                    onChange={(e) => setEditingCollection({ ...editingCollection, image_url: e.target.value })}
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={editingCollection.description}
                  onChange={(e) => setEditingCollection({ ...editingCollection, description: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50 resize-none"
                  rows={3}
                />
              </div>

              {/* Active Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={editingCollection.is_active}
                    onChange={(e) => setEditingCollection({ ...editingCollection, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-charcoal-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-pearl-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500 peer-checked:after:bg-white"></div>
                </div>
                <span className="text-sm text-neutral-400">
                  {editingCollection.is_active ? 'Collection is visible to customers' : 'Collection is hidden'}
                </span>
              </label>

              {/* Product Selection */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-3">
                  Select Products ({editingCollection.product_ids.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto p-2 bg-charcoal-800 rounded-lg">
                  {products.map((product) => {
                    const isSelected = editingCollection.product_ids.includes(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => toggleProduct(product.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                          isSelected
                            ? 'bg-pearl-50 text-charcoal-900'
                            : 'bg-charcoal-700 text-neutral-400 hover:bg-charcoal-600'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'border-pearl-50 bg-charcoal-900' : 'border-neutral-500'
                        }`}>
                          {isSelected && <span className="text-xs">✓</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm truncate">{product.name}</p>
                          <p className="text-xs opacity-60">{product.category}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-charcoal-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingCollection(null);
                }}
                className="px-6 py-3 text-neutral-400 hover:text-pearl-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 bg-pearl-50 text-charcoal-900 px-6 py-3 rounded-lg font-medium hover:bg-pearl-100 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Collection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
