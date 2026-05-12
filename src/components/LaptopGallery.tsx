'use client';

import React, { useState } from 'react';

interface LaptopGalleryProps {
  images: {
    front?: string;
    side?: string;
    back?: string;
    top?: string;
  };
  productName: string;
  brandModel: string;
}

export default function LaptopGallery({ images, productName, brandModel }: LaptopGalleryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const imageArray = [
    { url: images.front, label: 'Front View', alt: `${productName} - front view` },
    { url: images.side, label: 'Side View', alt: `${productName} - side view` },
    { url: images.back, label: 'Back View', alt: `${productName} - back view` },
    { url: images.top, label: 'Top Open View', alt: `${productName} - top open view` },
  ].filter(img => img.url);

  if (!imageArray.length) {
    return (
      <div className="relative w-full bg-slate-100 rounded-xl flex items-center justify-center min-h-[400px]">
        <p className="text-slate-500 text-center">📸 Images coming soon</p>
      </div>
    );
  }

  const frontImage = imageArray[0];

  return (
    <>
      {/* Thumbnail */}
      <div
        className="relative w-full cursor-pointer group overflow-hidden rounded-xl"
        onClick={() => {
          setCurrentIndex(0);
          setIsOpen(true);
        }}
      >
        <div className="aspect-video bg-slate-100 overflow-hidden rounded-xl">
          <img
            src={frontImage.url}
            alt={frontImage.alt}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {imageArray.length > 1 && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center rounded-xl">
            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-medium text-slate-900">
                View all {imageArray.length} angles →
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Modal Content */}
          <div className="relative z-10 w-full h-full max-w-4xl max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="text-white">
                <h2 className="text-2xl font-bold">{productName}</h2>
                <p className="text-sm text-slate-300 mt-1">
                  {imageArray[currentIndex].label}
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-slate-300 transition-colors p-2"
                aria-label="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Image Display */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
              <img
                src={imageArray[currentIndex].url}
                alt={imageArray[currentIndex].alt}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Navigation and Thumbnails */}
            <div className="border-t border-white/10 p-6 bg-black/50">
              {/* Thumbnails */}
              {imageArray.length > 1 && (
                <div className="flex gap-3 mb-4 overflow-x-auto pb-2">
                  {imageArray.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        idx === currentIndex
                          ? 'border-white ring-2 ring-white/50'
                          : 'border-white/20 hover:border-white/50 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev - 1 + imageArray.length) % imageArray.length
                    )
                  }
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={imageArray.length <= 1}
                >
                  ← Previous
                </button>

                <span className="text-white text-sm">
                  {currentIndex + 1} / {imageArray.length}
                </span>

                <button
                  onClick={() =>
                    setCurrentIndex(
                      (prev) => (prev + 1) % imageArray.length
                    )
                  }
                  className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                  disabled={imageArray.length <= 1}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
