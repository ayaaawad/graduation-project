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

  if (!images || images.length === 0) {
    return null;
  }

  const primaryImage = images[selectedIndex];
  const thumbnails = images.slice(0, 4);

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
            {thumbnails.map((imageUrl, index) => (
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
