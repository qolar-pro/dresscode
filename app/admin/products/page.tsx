'use client';

import { useState, useEffect, useCallback } from 'react';
import { products as initialProducts, defaultImages } from '@/data/products';
import { Plus, Edit, Trash2, Save, X, Package, Loader2 } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  description: string;
  images: string[];
  sizes: { name: string; available: boolean }[];
  colors: { name: string; hex: string; available: boolean }[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock?: number;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch products from Supabase
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.products && data.products.length > 0) {
        // Convert DB format to frontend format
        const frontendProducts = data.products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          category: p.category,
          description: p.description,
          images: p.images || [],
          sizes: p.sizes || [],
          colors: p.colors || [],
          isNew: p.is_new,
          isFeatured: p.is_featured,
          stock: p.stock,
        }));
        setProducts(frontendProducts);
      } else {
        // Fallback to default products if DB is empty
        setProducts(initialProducts);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts(initialProducts);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (product: Product) => {
    setEditingProduct({ ...product });
    setIsEditing(true);
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch('/api/products', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productId }),
      });

      if (!res.ok) throw new Error('Failed to delete product');
      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);

    try {
      const isExisting = products.find(p => p.id === editingProduct.id);
      const method = isExisting ? 'PUT' : 'POST';

      const res = await fetch('/api/products', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct),
      });

      if (!res.ok) throw new Error('Failed to save product');
      await fetchProducts();
      setIsEditing(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleNewProduct = () => {
    const newProduct: Product = {
      id: Date.now(),
      name: 'New Product',
      price: 0,
      category: 'dresses',
      description: 'Product description',
      images: [defaultImages.dresses],
      sizes: [
        { name: 'XS', available: true },
        { name: 'S', available: true },
        { name: 'M', available: true },
        { name: 'L', available: true },
        { name: 'XL', available: true },
      ],
      colors: [
        { name: 'Black', hex: '#171717', available: true },
      ],
      isNew: true,
      stock: 100,
    };
    setEditingProduct(newProduct);
    setIsEditing(true);
  };

  const emojiMap: Record<string, string> = {
    dresses: '👗',
    tops: '👚',
    pants: '👖',
    skirts: '👗',
    outerwear: '🧥',
    accessories: '👜',
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
          <h1 className="font-display text-3xl text-pearl-50 mb-2">Products</h1>
          <p className="text-neutral-400">{products.length} total products</p>
        </div>
        <button
          onClick={handleNewProduct}
          className="flex items-center gap-2 bg-pearl-50 text-charcoal-900 px-4 py-2 rounded-lg font-medium hover:bg-pearl-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products..."
          className="w-full px-4 py-3 bg-charcoal-900 border border-charcoal-800 rounded-lg text-pearl-50 placeholder:text-neutral-500 focus:outline-none focus:border-pearl-50 transition-colors"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-charcoal-900 rounded-xl overflow-hidden">
            {/* Product Image */}
            <div className="aspect-square bg-charcoal-800 flex items-center justify-center overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    if (e.currentTarget.parentElement) {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement.innerHTML = `<span class="text-6xl">${emojiMap[product.category] || '👗'}</span>`;
                    }
                  }}
                />
              ) : (
                <span className="text-6xl">{emojiMap[product.category] || '👗'}</span>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="text-pearl-50 font-medium mb-1">{product.name}</h3>
                  <p className="text-xs text-neutral-400 uppercase tracking-wider">{product.category}</p>
                </div>
                <p className="text-pearl-50 font-medium">${product.price.toFixed(2)}</p>
              </div>

              <div className="flex items-center gap-2 mb-4">
                {product.isNew && (
                  <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">NEW</span>
                )}
                {product.isFeatured && (
                  <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">FEATURED</span>
                )}
                {product.stock !== undefined && product.stock < 10 && (
                  <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">LOW STOCK</span>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(product)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-charcoal-800 hover:bg-charcoal-700 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 text-neutral-400" />
                  <span className="text-sm text-neutral-400">Edit</span>
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="p-2 bg-charcoal-800 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {isEditing && editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-sm">
          <div className="bg-charcoal-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-charcoal-800">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display text-pearl-50">
                  {products.find(p => p.id === editingProduct.id) ? 'Edit Product' : 'New Product'}
                </h2>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditingProduct(null);
                  }}
                  className="text-neutral-400 hover:text-pearl-50"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Product Name */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                />
              </div>

              {/* Price, Category, Stock */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Price ($)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => {
                      const newCategory = e.target.value;
                      const currentIsDefault = Object.values(defaultImages).includes(editingProduct.images[0]);
                      setEditingProduct({
                        ...editingProduct,
                        category: newCategory,
                        images: currentIsDefault ? [defaultImages[newCategory]] : editingProduct.images
                      });
                    }}
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                  >
                    <option value="dresses">Dresses</option>
                    <option value="tops">Tops</option>
                    <option value="pants">Pants</option>
                    <option value="skirts">Skirts</option>
                    <option value="outerwear">Outerwear</option>
                    <option value="accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Stock</label>
                  <input
                    type="number"
                    value={editingProduct.stock ?? 100}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 focus:outline-none focus:border-pearl-50 resize-none"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">Product Image</label>
                <div className="space-y-4">
                  {editingProduct.images[0] && (
                    <div className="relative aspect-square bg-charcoal-800 rounded-lg overflow-hidden">
                      <img
                        src={editingProduct.images[0]}
                        alt="Product preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setEditingProduct({
                          ...editingProduct,
                          images: [defaultImages[editingProduct.category] || defaultImages.dresses]
                        })}
                        className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-500 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setEditingProduct({
                                ...editingProduct,
                                images: [reader.result as string]
                              });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                      <div className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-center cursor-pointer hover:bg-charcoal-700 transition-colors">
                        <span className="text-sm text-pearl-50">Upload from Computer</span>
                      </div>
                    </label>
                  </div>

                  <input
                    type="url"
                    value={editingProduct.images[0]?.startsWith('http') ? editingProduct.images[0] : ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 bg-charcoal-800 border border-charcoal-700 rounded-lg text-pearl-50 placeholder:text-neutral-600 focus:outline-none focus:border-pearl-50"
                  />
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-3">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => {
                    const sizeObj = editingProduct.sizes.find(s => s.name === size);
                    const isAvailable = sizeObj?.available ?? true;

                    return (
                      <button
                        key={size}
                        onClick={() => {
                          const updatedSizes = editingProduct.sizes.map(s =>
                            s.name === size ? { ...s, available: !s.available } : s
                          );
                          if (!editingProduct.sizes.find(s => s.name === size)) {
                            updatedSizes.push({ name: size, available: true });
                          }
                          setEditingProduct({ ...editingProduct, sizes: updatedSizes });
                        }}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isAvailable
                            ? 'bg-pearl-50 text-charcoal-900'
                            : 'bg-charcoal-800 text-neutral-500'
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Toggle Options */}
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isNew ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isNew: e.target.checked })}
                    className="w-4 h-4 rounded border-charcoal-700 bg-charcoal-800 text-pearl-50 focus:ring-pearl-500"
                  />
                  <span className="text-sm text-neutral-400">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFeatured ?? false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFeatured: e.target.checked })}
                    className="w-4 h-4 rounded border-charcoal-700 bg-charcoal-800 text-pearl-50 focus:ring-pearl-500"
                  />
                  <span className="text-sm text-neutral-400">Featured</span>
                </label>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-charcoal-800 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditingProduct(null);
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
                    Save Product
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
