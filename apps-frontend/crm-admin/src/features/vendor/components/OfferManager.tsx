'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { Card, Badge, Icon, Button } from '@/components/ui';
import { useOffers, useCreateOffer, useUpdateOffer, useDeactivateOffer } from '../hooks/useVendor';
import { OFFER_TYPE_MAP, getOfferValueDisplay } from '../utils/vendor-helpers';
import { OfferForm } from './OfferForm';
import type { SoftwareOfferItem, OfferFormData } from '../types/vendor.types';

export function OfferManager() {
  const [editOffer, setEditOffer] = useState<SoftwareOfferItem | null>(null);
  const [showForm, setShowForm] = useState(false);

  const { data: offersResp, isLoading } = useOffers();
  const createMut = useCreateOffer();
  const updateMut = useUpdateOffer();
  const deactivateMut = useDeactivateOffer();

  const offers: SoftwareOfferItem[] = Array.isArray(offersResp?.data) ? offersResp.data : [];

  const handleSubmit = async (data: OfferFormData) => {
    try {
      if (editOffer) {
        await updateMut.mutateAsync({ id: editOffer.id, data });
        toast.success('Offer updated');
        setEditOffer(null);
      } else {
        await createMut.mutateAsync(data);
        toast.success('Offer created');
      }
      setShowForm(false);
    } catch {
      toast.error('Failed to save offer');
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Deactivate this offer?')) return;
    try {
      await deactivateMut.mutateAsync(id);
      toast.success('Offer deactivated');
    } catch {
      toast.error('Failed to deactivate');
    }
  };

  const startEdit = (offer: SoftwareOfferItem) => {
    setEditOffer(offer);
    setShowForm(true);
  };

  const cancelForm = () => {
    setEditOffer(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Software Offers</h1>
          <p className="text-sm text-gray-500 mt-1">Manage promotional offers and discounts</p>
        </div>
        {!showForm && (
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Icon name="plus" size={16} className="mr-2" />
            New Offer
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <OfferForm
          editOffer={editOffer}
          onSubmit={handleSubmit}
          onCancel={cancelForm}
          isPending={createMut.isPending || updateMut.isPending}
        />
      )}

      {/* Offers List */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">
          All Offers
        </h3>

        {isLoading ? (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 rounded" />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Code</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Value</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Valid Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Redemptions</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {offers.map((offer) => {
                  const typeInfo = OFFER_TYPE_MAP[offer.offerType] ?? {
                    label: offer.offerType,
                    icon: 'tag',
                  };
                  return (
                    <tr key={offer.id} className="hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{offer.name}</div>
                        {offer.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{offer.description}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="primary" className="font-mono">{offer.code}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Icon name={typeInfo.icon as any} size={14} className="text-gray-400" />
                          <span className="text-gray-600">{typeInfo.label}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-700">
                        {getOfferValueDisplay(offer)}
                      </td>
                      <td className="py-3 px-4 text-gray-500 text-xs">
                        <div>{new Date(offer.validFrom).toLocaleDateString()}</div>
                        <div className="text-gray-400">to {new Date(offer.validTo).toLocaleDateString()}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {offer.currentRedemptions}/{offer.maxRedemptions}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <Badge variant={offer.isActive ? 'success' : 'danger'}>
                            {offer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {offer.autoApply && (
                            <Badge variant="secondary">Auto</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          <button
                            onClick={() => startEdit(offer)}
                            className="p-1.5 rounded hover:bg-gray-100"
                            title="Edit"
                          >
                            <Icon name="pencil" size={14} className="text-gray-500" />
                          </button>
                          {offer.isActive && (
                            <button
                              onClick={() => handleDeactivate(offer.id)}
                              className="p-1.5 rounded hover:bg-red-50"
                              title="Deactivate"
                              disabled={deactivateMut.isPending}
                            >
                              <Icon name="x-circle" size={14} className="text-red-500" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {offers.length === 0 && (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      No offers found. Create your first offer above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
