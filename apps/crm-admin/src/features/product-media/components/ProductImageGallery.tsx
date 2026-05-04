'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Card, Badge } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import { useProductImages, useManageImages } from '../hooks/useProductMedia';
import type { ProductImage } from '../types/product-media.types';

// ── Props ─────────────────────────────────────────────────────────────

interface ProductImageGalleryProps {
  productId: string;
}

// ── Component ─────────────────────────────────────────────────────────

export function ProductImageGallery({ productId }: ProductImageGalleryProps) {
  const { data, isLoading } = useProductImages(productId);
  const manageImagesMut = useManageImages();

  const images: ProductImage[] = (data as any)?.data ?? [];
  const [deleting, setDeleting] = useState<string | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────

  async function handleSetPrimary(imageId: string) {
    const updated = images.map((img) => ({
      url: img.url,
      alt: img.alt,
      isPrimary: img.id === imageId,
      displayOrder: img.displayOrder,
    }));

    try {
      await manageImagesMut.mutateAsync({ productId, images: updated });
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to update primary image');
    }
  }

  async function handleDelete(imageId: string) {
    if (!window.confirm('Delete this image?')) return;
    setDeleting(imageId);

    const updated = images
      .filter((img) => img.id !== imageId)
      .map((img, idx) => ({
        url: img.url,
        alt: img.alt,
        isPrimary: img.isPrimary,
        displayOrder: idx,
      }));

    try {
      await manageImagesMut.mutateAsync({ productId, images: updated });
      toast.success('Image deleted');
    } catch {
      toast.error('Failed to delete image');
    } finally {
      setDeleting(null);
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const reordered = [...images];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];

    const updated = reordered.map((img, idx) => ({
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      displayOrder: idx,
    }));

    try {
      await manageImagesMut.mutateAsync({ productId, images: updated });
    } catch {
      toast.error('Failed to reorder');
    }
  }

  async function handleMoveDown(index: number) {
    if (index >= images.length - 1) return;
    const reordered = [...images];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];

    const updated = reordered.map((img, idx) => ({
      url: img.url,
      alt: img.alt,
      isPrimary: img.isPrimary,
      displayOrder: idx,
    }));

    try {
      await manageImagesMut.mutateAsync({ productId, images: updated });
    } catch {
      toast.error('Failed to reorder');
    }
  }

  function formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  // ── Render ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ padding: 48, display: 'flex', justifyContent: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, fontWeight: 600, margin: '0 0 24px 0', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon name="image" size={22} />
        Product Images
      </h2>

      {/* Upload Drop Zone (Placeholder) */}
      <div
        style={{
          border: '2px dashed #d1d5db',
          borderRadius: 8,
          padding: 32,
          textAlign: 'center',
          marginBottom: 24,
          backgroundColor: '#f9fafb',
        }}
      >
        <Icon name="upload-cloud" size={32} />
        <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8, marginBottom: 4 }}>
          Drag and drop images here, or click to browse
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
          Supports JPG, PNG, WebP up to 5MB
        </p>
      </div>

      {/* Image Grid */}
      {images.length === 0 ? (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <Icon name="image" size={32} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>No images uploaded yet.</p>
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: 16,
          }}
        >
          {images.map((img, idx) => (
            <Card key={img.id} style={{ overflow: 'hidden', position: 'relative' }}>
              {/* Thumbnail */}
              <div
                style={{
                  width: '100%',
                  height: 180,
                  backgroundColor: '#f3f4f6',
                  backgroundImage: `url(${img.thumbnailUrl || img.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative',
                }}
              >
                {/* Primary badge */}
                {img.isPrimary && (
                  <div style={{ position: 'absolute', top: 8, left: 8 }}>
                    <Badge variant="warning">
                      <Icon name="star" size={12} />
                      Primary
                    </Badge>
                  </div>
                )}
              </div>

              {/* Info & Actions */}
              <div style={{ padding: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.fileName}
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 8 }}>
                  {img.width} x {img.height} &middot; {formatFileSize(img.fileSize)}
                </div>

                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {!img.isPrimary && (
                    <Button
                      variant="outline"
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={manageImagesMut.isPending}
                      style={{ padding: '4px 8px', fontSize: 11 }}
                    >
                      <Icon name="star" size={12} />
                      Set Primary
                    </Button>
                  )}

                  {/* Reorder buttons */}
                  <Button
                    variant="ghost"
                    onClick={() => handleMoveUp(idx)}
                    disabled={idx === 0 || manageImagesMut.isPending}
                    style={{ padding: 4 }}
                  >
                    <Icon name="chevron-up" size={14} />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => handleMoveDown(idx)}
                    disabled={idx >= images.length - 1 || manageImagesMut.isPending}
                    style={{ padding: 4 }}
                  >
                    <Icon name="chevron-down" size={14} />
                  </Button>

                  <div style={{ flex: 1 }} />

                  <Button
                    variant="ghost"
                    onClick={() => handleDelete(img.id)}
                    disabled={deleting === img.id}
                    style={{ padding: 4, color: '#ef4444' }}
                  >
                    <Icon name="trash-2" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
