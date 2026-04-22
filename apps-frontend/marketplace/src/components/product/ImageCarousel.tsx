'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt?: string;
  aspectRatio?: string;
}

export function ImageCarousel({ images, alt = '', aspectRatio = 'aspect-square' }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);

  if (!images.length) {
    return (
      <div className={`${aspectRatio} bg-gray-100 flex items-center justify-center`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${aspectRatio} overflow-hidden bg-gray-50`}>
      <img
        src={images[index]}
        alt={`${alt} ${index + 1}`}
        className="w-full h-full object-cover"
      />

      {images.length > 1 && (
        <>
          <button
            onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={() => setIndex((i) => (i + 1) % images.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
          >
            <ChevronRight size={18} />
          </button>

          {/* Dots */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`rounded-full transition-all ${i === index ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
