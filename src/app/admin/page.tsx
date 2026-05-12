'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Product {
  _id: string;
  modelName: string;
  brand: string;
  price: number;
  image?: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       const data = await res.json();
       console.log('Fetched products:', data);
       setProducts(Array.isArray(data) ? data : []);
       if (!Array.isArray(data) || data.length === 0) {
         setMessage('No products found in database');
       }
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setMessage(`Failed to fetch products: ${error}`);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingId(productId);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('productId', productId);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const result = await res.json();
      
      // Update product in UI
      setProducts(products.map(p => 
        p._id === productId ? { ...p, image: result.url } : p
      ));
      setSelectedProduct(null);
      setMessage(`✅ Image uploaded successfully for ${result.productName}`);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Upload error:', error);
      setMessage('❌ Failed to upload image');
    } finally {
      setUploadingId(null);
    }
  };

  const handleRemoveImage = async (productId: string) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: '' }),
      });

      if (!res.ok) throw new Error('Failed to remove image');

      setProducts(products.map(p =>
        p._id === productId ? { ...p, image: '' } : p
      ));
      setMessage('✅ Image removed successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error:', error);
      setMessage('❌ Failed to remove image');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">Manage product images</p>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-6 p-4 bg-slate-700 border border-slate-600 rounded-lg text-white">
            {message}
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-blue-500 transition-colors"
            >
              {/* Image Preview */}
              <div className="relative w-full h-48 bg-slate-900 flex items-center justify-center overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.modelName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-slate-500 text-center">
                    <p>No image</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1">{product.modelName}</h3>
                <p className="text-sm text-slate-400 mb-3">{product.brand}</p>
                <p className="text-blue-400 font-semibold mb-4">${product.price}</p>

                {/* Upload Button */}
                <div className="mb-3">
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, product._id)}
                      disabled={uploadingId === product._id}
                      className="hidden"
                    />
                    <span className="block w-full text-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploadingId === product._id ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </label>
                </div>

                {/* Remove Image Button */}
                {product.image && (
                  <button
                    onClick={() => handleRemoveImage(product._id)}
                    className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {products.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-400 text-lg">No products found</p>
          </div>
        )}
      </div>
    </div>
  );
}
