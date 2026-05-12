'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductData {
  _id: string;
  brand: string;
  modelName: string;
  category: string;
  price: number;
  stock: number;
  condition: 'New' | 'Used';
  display: {
    screenSize: number;
    resolution: string;
    isTouchScreen: boolean;
  };
  storage: {
    capacity: string;
    type: string;
  };
  ram: {
    size: string;
  };
  processor: {
    modelName: string;
  };
  battery: {
    capacity: string;
    estimatedRuntimeHours: number;
  };
  gpu: {
    modelName: string;
    vram: string;
  };
  aiFeatures: {
    performance: number;
    portability: number;
    batteryEfficiency: number;
  };
  image: string;
  images?: string[];
}

interface FormData {
  brand: string;
  modelName: string;
  category: string;
  price: number;
  stock: number;
  condition: 'New' | 'Used';
  display: {
    screenSize: number;
    resolution: string;
    isTouchScreen: boolean;
  };
  storage: {
    capacity: string;
    type: string;
  };
  ram: {
    size: string;
  };
  processor: {
    modelName: string;
  };
  battery: {
    capacity: string;
    estimatedRuntimeHours: number;
  };
  gpu: {
    modelName: string;
    vram: string;
  };
  aiFeatures: {
    performance: number;
    portability: number;
    batteryEfficiency: number;
  };
  image: string;
  images: string[];
}

export default function ManageProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [formData, setFormData] = useState<FormData>({
    brand: '',
    modelName: '',
    category: '',
    price: 0,
    stock: 0,
    condition: 'New',
    display: { screenSize: 0, resolution: '', isTouchScreen: false },
    storage: { capacity: '', type: '' },
    ram: { size: '' },
    processor: { modelName: '' },
    battery: { capacity: '', estimatedRuntimeHours: 0 },
    gpu: { modelName: '', vram: '' },
    aiFeatures: { performance: 5, portability: 5, batteryEfficiency: 5 },
    image: '',
    images: ['', '', '', ''],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');

      if (response.status === 401) {
        router.push('/admin/dashboard');
        return;
      }

      if (!response.ok) throw new Error('Failed to fetch products');

      const data = await response.json();
      setProducts(data.products || []);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData({
      brand: '',
      modelName: '',
      category: '',
      price: 0,
      stock: 0,
      condition: 'New',
      display: { screenSize: 0, resolution: '', isTouchScreen: false },
      storage: { capacity: '', type: '' },
      ram: { size: '' },
      processor: { modelName: '' },
      battery: { capacity: '', estimatedRuntimeHours: 0 },
      gpu: { modelName: '', vram: '' },
      aiFeatures: { performance: 5, portability: 5, batteryEfficiency: 5 },
      image: '',
      images: ['', '', '', ''],
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditClick = (product: ProductData) => {
    setFormData({
      ...product,
      images: product.images && product.images.length > 0 ? product.images : ['', '', '', ''],
    });
    setEditingId(product._id);
    setShowForm(true);
  };

  const handleDeleteClick = (productId: string) => {
    setDeleteConfirm(productId);
  };

  const confirmDelete = async (productId: string) => {
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.status === 401) {
        router.push('/admin/dashboard');
        return;
      }

      if (!response.ok) throw new Error('Failed to delete product');

      setProducts(products.filter((p) => p._id !== productId));
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting product');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.status === 401) {
        router.push('/admin/dashboard');
        return;
      }

      if (!response.ok) throw new Error('Failed to save product');

      const data = await response.json();

      if (editingId) {
        setProducts(
          products.map((p) => (p._id === editingId ? data.product : p))
        );
      } else {
        setProducts([...products, data.product]);
      }

      setShowForm(false);
      setError('');
      
      // Show success toast
      setToastMessage(editingId ? '✅ Laptop updated successfully!' : '✅ Laptop added successfully!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving product');
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    path: string[]
  ) => {
    const { value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : null;

    setFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      let current = updated;

      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }

      const lastKey = path[path.length - 1];
      if (type === 'checkbox') {
        current[lastKey] = checked;
      } else if (type === 'number') {
        current[lastKey] = parseFloat(value) || 0;
      } else {
        current[lastKey] = value;
      }

      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Manage Products</h1>
            <p className="text-slate-400">Add, edit, or remove laptop inventory</p>
          </div>
          <button
            onClick={handleAddClick}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition"
          >
            + Add Laptop
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-700 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-slate-400">Loading products...</p>
            </div>
          </div>
        )}

        {/* Products Table */}
        {!loading && (
          <div className="bg-slate-800/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50 border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Brand
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Model
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Stock
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Condition
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="hover:bg-white/5 transition"
                    >
                      <td className="px-6 py-4 text-slate-200">{product.brand}</td>
                      <td className="px-6 py-4 text-slate-200">{product.modelName}</td>
                      <td className="px-6 py-4 text-slate-200">{product.category}</td>
                      <td className="px-6 py-4 text-slate-200">${product.price}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.stock > 5
                              ? 'bg-green-900/30 text-green-200'
                              : 'bg-yellow-900/30 text-yellow-200'
                          }`}
                        >
                          {product.stock} units
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-200">{product.condition}</td>
                      <td className="px-6 py-4 flex gap-2">
                        <button
                          onClick={() => handleEditClick(product)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product._id)}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                No products found. Click "Add Laptop" to get started!
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <ProductFormModal
          formData={formData}
          editingId={editingId}
          onSubmit={handleFormSubmit}
          onClose={() => setShowForm(false)}
          onInputChange={handleInputChange}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          productId={deleteConfirm}
          onConfirm={() => confirmDelete(deleteConfirm)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {/* Success Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

function ProductFormModal({
  formData,
  editingId,
  onSubmit,
  onClose,
  onInputChange,
}: {
  formData: FormData;
  editingId: string | null;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, path: string[]) => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-8 py-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">
            {editingId ? 'Edit Laptop' : 'Add New Laptop'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          {/* Basic Info */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Brand"
                value={formData.brand}
                onChange={(e) => onInputChange(e, ['brand'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Model Name"
                value={formData.modelName}
                onChange={(e) => onInputChange(e, ['modelName'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Category"
                value={formData.category}
                onChange={(e) => onInputChange(e, ['category'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <select
                value={formData.condition}
                onChange={(e) => onInputChange(e, ['condition'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white"
                required
              >
                <option value="New">New</option>
                <option value="Used">Used</option>
              </select>
              <input
                type="number"
                placeholder="Price ($)"
                value={formData.price || ''}
                onChange={(e) => onInputChange(e, ['price'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="number"
                placeholder="Stock Units"
                value={formData.stock || ''}
                onChange={(e) => onInputChange(e, ['stock'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
            </div>
          </div>

          {/* Display Specs */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Display</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="number"
                placeholder="Screen Size"
                value={formData.display.screenSize || ''}
                onChange={(e) => onInputChange(e, ['display', 'screenSize'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <input
                type="text"
                placeholder="Resolution (e.g., 1920x1080)"
                value={formData.display.resolution}
                onChange={(e) => onInputChange(e, ['display', 'resolution'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400"
                required
              />
              <label className="flex items-center gap-2 text-slate-300">
                <input
                  type="checkbox"
                  checked={formData.display.isTouchScreen}
                  onChange={(e) => onInputChange(e, ['display', 'isTouchScreen'])}
                  className="rounded"
                />
                Touch Screen
              </label>
            </div>
          </div>

          {/* Storage & RAM */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Storage Capacity</label>
              <input
                type="text"
                placeholder="e.g., 512GB"
                value={formData.storage.capacity}
                onChange={(e) => onInputChange(e, ['storage', 'capacity'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">Storage Type</label>
              <input
                type="text"
                placeholder="e.g., SSD"
                value={formData.storage.type}
                onChange={(e) => onInputChange(e, ['storage', 'type'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">RAM</label>
              <input
                type="text"
                placeholder="e.g., 16GB"
                value={formData.ram.size}
                onChange={(e) => onInputChange(e, ['ram', 'size'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
          </div>

          {/* Processor & GPU */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Processor</label>
              <input
                type="text"
                placeholder="e.g., Intel Core i7-13700K"
                value={formData.processor.modelName}
                onChange={(e) => onInputChange(e, ['processor', 'modelName'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">GPU</label>
              <input
                type="text"
                placeholder="e.g., RTX 4070"
                value={formData.gpu.modelName}
                onChange={(e) => onInputChange(e, ['gpu', 'modelName'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">GPU VRAM</label>
              <input
                type="text"
                placeholder="e.g., 12GB"
                value={formData.gpu.vram}
                onChange={(e) => onInputChange(e, ['gpu', 'vram'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
          </div>

          {/* Battery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm mb-2">Battery Capacity</label>
              <input
                type="text"
                placeholder="e.g., 90Wh"
                value={formData.battery.capacity}
                onChange={(e) => onInputChange(e, ['battery', 'capacity'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
            <div>
              <label className="block text-slate-300 text-sm mb-2">
                Estimated Runtime (hours)
              </label>
              <input
                type="number"
                placeholder="e.g., 8"
                value={formData.battery.estimatedRuntimeHours || ''}
                onChange={(e) => onInputChange(e, ['battery', 'estimatedRuntimeHours'])}
                className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                required
              />
            </div>
          </div>

          {/* AI Features Sliders */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">AI Vectors (1-10)</h3>
            <div className="space-y-4">
              <div>
                <label className="flex justify-between text-slate-300 mb-2">
                  <span>Performance</span>
                  <span className="text-blue-400 font-semibold">
                    {formData.aiFeatures.performance}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.aiFeatures.performance}
                  onChange={(e) => onInputChange(e, ['aiFeatures', 'performance'])}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-slate-300 mb-2">
                  <span>Portability</span>
                  <span className="text-blue-400 font-semibold">
                    {formData.aiFeatures.portability}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.aiFeatures.portability}
                  onChange={(e) => onInputChange(e, ['aiFeatures', 'portability'])}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
              <div>
                <label className="flex justify-between text-slate-300 mb-2">
                  <span>Battery Efficiency</span>
                  <span className="text-blue-400 font-semibold">
                    {formData.aiFeatures.batteryEfficiency}
                  </span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={formData.aiFeatures.batteryEfficiency}
                  onChange={(e) => onInputChange(e, ['aiFeatures', 'batteryEfficiency'])}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Image URLs - 2 Column Layout */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Product Images</h3>
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-4">
              <p className="text-blue-300 text-sm">
                📌 Please provide .webp URLs for better performance and faster loading times.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">
                  Image URL 1 (Main) *
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image1.webp"
                  value={formData.images[0] || ''}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[0] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">
                  Image URL 2
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image2.webp"
                  value={formData.images[1] || ''}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[1] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">
                  Image URL 3
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image3.webp"
                  value={formData.images[2] || ''}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[2] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                />
              </div>
              
              <div>
                <label className="block text-slate-300 text-sm mb-2 font-medium">
                  Image URL 4
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/image4.webp"
                  value={formData.images[3] || ''}
                  onChange={(e) => {
                    const newImages = [...formData.images];
                    newImages[3] = e.target.value;
                    setFormData({ ...formData, images: newImages });
                  }}
                  className="bg-slate-700/50 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-slate-400 w-full"
                />
              </div>
            </div>
            
            <p className="text-slate-400 text-xs mt-3">
              💡 Images will be displayed as a gallery on the product detail page. Use the same image URL pattern for consistency across your store.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-4 justify-end pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ConfirmDeleteModal({
  productId,
  onConfirm,
  onCancel,
}: {
  productId: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-white/10 rounded-2xl max-w-sm w-full p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Confirm Delete</h2>
        <p className="text-slate-300 mb-6">
          Are you sure you want to delete this laptop? This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-end">
          <button
            onClick={onCancel}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition"
          >
            Delete Product
          </button>
        </div>
      </div>
    </div>
  );
}
