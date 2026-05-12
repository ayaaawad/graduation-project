'use client';

import { useState } from 'react';

interface ClientProductGalleryProps {
  images: string[];
  productName: string;
  productId: string;
}

export default function ClientProductGallery({
  images,
  productName,
  productId,
}: ClientProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Filter out empty image URLs
  const validImages = (images || []).filter(img => img && img.trim());

  if (!validImages || validImages.length === 0) {
    return (
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/60 w-full shadow-lg flex items-center justify-center" style={{ aspectRatio: '4/3' }}>
        <div className="text-center">
          <svg className="w-24 h-24 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-slate-500 text-lg font-medium">Image Coming Soon</p>
          <p className="text-slate-600 text-sm">Product image will be added soon</p>
        </div>
      </div>
    );
  }

  const primaryImage = validImages[selectedIndex];
  const thumbnails = validImages.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Featured Hero Image - Strict 4:3 Aspect Ratio */}
      <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/60 w-full shadow-lg" style={{ aspectRatio: '4/3' }}>
        <img
          src={primaryImage}
          alt={`${productName} - main view`}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
      </div>

      {/* Thumbnail Gallery - Only show if more than 1 image */}
      {thumbnails.length > 1 && (
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400 mb-3 font-semibold">Product Views</p>
          <div className="grid grid-cols-3 gap-3">
            {thumbnails.filter(img => img && img.trim()).map((imageUrl, index) => (
              <button
                key={`${productId}-thumb-${index}`}
                onClick={() => setSelectedIndex(index)}
                className={`overflow-hidden rounded-lg border-2 transition-all duration-200 group w-full ${
                  selectedIndex === index
                    ? 'border-blue-400 ring-2 ring-blue-400/50 shadow-lg'
                    : 'border-white/10 hover:border-blue-300/50'
                }`}
                style={{ aspectRatio: '4/3' }}
                aria-label={`View ${index + 1}`}
              >
                <img
                  src={imageUrl}
                  alt={`${productName} view ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
