'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button, Icon, Card, Badge, Input, SelectInput } from '@/components/ui';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

import {
  useRelatedProducts,
  useAddRelatedProducts,
  useRemoveRelatedProduct,
} from '../hooks/useProductMedia';
import type { RelatedProduct } from '../types/product-media.types';

// ── Constants ─────────────────────────────────────────────────────────

const RELATION_TYPE_OPTIONS = [
  { value: 'SIMILAR', label: 'Similar' },
  { value: 'ACCESSORY', label: 'Accessory' },
  { value: 'UPSELL', label: 'Upsell' },
  { value: 'CROSS_SELL', label: 'Cross Sell' },
  { value: 'BUNDLE', label: 'Bundle' },
];

const RELATION_BADGE_VARIANT: Record<string, 'primary' | 'secondary' | 'success' | 'warning' | 'danger'> = {
  SIMILAR: 'primary',
  ACCESSORY: 'secondary',
  UPSELL: 'success',
  CROSS_SELL: 'warning',
  BUNDLE: 'danger',
};

// ── Props ─────────────────────────────────────────────────────────────

interface RelatedProductsProps {
  productId: string;
}

// ── Component ─────────────────────────────────────────────────────────

export function RelatedProducts({ productId }: RelatedProductsProps) {
  const { data, isLoading } = useRelatedProducts(productId);
  const addRelatedMut = useAddRelatedProducts();
  const removeRelatedMut = useRemoveRelatedProduct();

  const relatedProducts: RelatedProduct[] = (data as any)?.data ?? [];

  // ── Add form state ────────────────────────────────────────────────
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState('');
  const [relationType, setRelationType] = useState<RelatedProduct['relationType']>('SIMILAR');

  // ── Handlers ──────────────────────────────────────────────────────

  async function handleAddRelated() {
    const ids = selectedProductIds
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (ids.length === 0) {
      toast.error('Please enter at least one product ID');
      return;
    }

    try {
      await addRelatedMut.mutateAsync({
        productId,
        dto: { relatedProductIds: ids, relationType },
      });
      toast.success('Related products added');
      setSelectedProductIds('');
      setRelationType('SIMILAR');
      setShowAddForm(false);
    } catch {
      toast.error('Failed to add related products');
    }
  }

  async function handleRemove(relationId: string) {
    if (!window.confirm('Remove this related product?')) return;
    try {
      await removeRelatedMut.mutateAsync({ productId, relationId });
      toast.success('Related product removed');
    } catch {
      toast.error('Failed to remove related product');
    }
  }

  // ── Filter ────────────────────────────────────────────────────────

  const filtered = searchQuery
    ? relatedProducts.filter(
        (rp) =>
          rp.relatedProductName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rp.relatedProductSku.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : relatedProducts;

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icon name="git-branch" size={22} />
          Related Products
        </h2>
        <Button variant="primary" onClick={() => setShowAddForm(!showAddForm)}>
          <Icon name="plus" size={14} />
          Add Related Product
        </Button>
      </div>

      {/* Add Related Product Form */}
      {showAddForm && (
        <Card style={{ padding: 20, marginBottom: 24, backgroundColor: '#f9fafb' }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, margin: '0 0 16px 0' }}>Add Related Products</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <Input
              label="Product IDs (comma-separated)"
              leftIcon={<Icon name="search" size={16} />}
              value={selectedProductIds}
              onChange={(v: string) => setSelectedProductIds(v)}
            />
            <SelectInput
              label="Relation Type"
              leftIcon={<Icon name="tag" size={16} />}
              options={RELATION_TYPE_OPTIONS}
              value={relationType}
              onChange={(v) => setRelationType(v as RelatedProduct['relationType'])}
            />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="primary" onClick={handleAddRelated} disabled={addRelatedMut.isPending}>
              {addRelatedMut.isPending && <Icon name="loader" size={14} />}
              Add
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)}>
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Search */}
      {relatedProducts.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Input
            label="Search related products"
            leftIcon={<Icon name="search" size={16} />}
            value={searchQuery}
            onChange={(v: string) => setSearchQuery(v)}
          />
        </div>
      )}

      {/* Table */}
      {filtered.length === 0 ? (
        <Card style={{ padding: 32, textAlign: 'center' }}>
          <Icon name="git-branch" size={32} />
          <p style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
            {relatedProducts.length === 0
              ? 'No related products configured.'
              : 'No products match your search.'}
          </p>
        </Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  Product
                </th>
                <th style={{ textAlign: 'left', padding: '10px 16px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  SKU
                </th>
                <th style={{ textAlign: 'center', padding: '10px 16px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  Relation
                </th>
                <th style={{ textAlign: 'right', padding: '10px 16px', fontSize: 12, color: '#6b7280', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((rp) => (
                <tr key={rp.id}>
                  <td style={{ padding: '10px 16px', fontSize: 14, borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {rp.relatedProductImage ? (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 4,
                            backgroundImage: `url(${rp.relatedProductImage})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundColor: '#f3f4f6',
                            flexShrink: 0,
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 4,
                            backgroundColor: '#f3f4f6',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <Icon name="image" size={16} />
                        </div>
                      )}
                      <span style={{ fontWeight: 500 }}>{rp.relatedProductName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 16px', fontSize: 13, color: '#6b7280', fontFamily: 'monospace', borderBottom: '1px solid #f3f4f6' }}>
                    {rp.relatedProductSku}
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>
                    <Badge variant={RELATION_BADGE_VARIANT[rp.relationType] ?? 'secondary'}>
                      {rp.relationType.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ padding: '10px 16px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>
                    <Button
                      variant="ghost"
                      onClick={() => handleRemove(rp.id)}
                      disabled={removeRelatedMut.isPending}
                      style={{ padding: 4, color: '#ef4444' }}
                    >
                      <Icon name="trash-2" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
