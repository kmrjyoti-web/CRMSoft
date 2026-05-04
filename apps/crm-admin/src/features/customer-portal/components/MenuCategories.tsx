'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Drawer } from '@/components/ui/Drawer';
import {
  useMenuCategories, useAvailableRoutes,
  useCreateMenuCategory, useUpdateMenuCategory, useDeleteMenuCategory,
  useSeedDefaultCategories,
} from '../hooks/useCustomerPortal';
import { RouteCheckboxTree } from './RouteCheckboxTree';
import type { CustomerMenuCategory, CreateMenuCategoryDto } from '../types/customer-portal.types';

interface CategoryFormValues {
  name: string;
  description: string;
  icon: string;
  color: string;
  isDefault: boolean;
}

export function MenuCategories() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<CustomerMenuCategory | null>(null);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const categoriesQuery = useMenuCategories();
  const routesQuery = useAvailableRoutes();
  const createMut = useCreateMenuCategory();
  const updateMut = useUpdateMenuCategory();
  const deleteMut = useDeleteMenuCategory();
  const seedMut = useSeedDefaultCategories();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>({
    defaultValues: { name: '', description: '', icon: 'layout-dashboard', color: '#2563eb', isDefault: false },
  });

  const categories = categoriesQuery.data?.data ?? [];
  const allRoutes = routesQuery.data?.data ?? [];

  const openCreate = () => {
    setEditTarget(null);
    setSelectedRoutes(allRoutes.map((r) => r.key));
    reset({ name: '', description: '', icon: 'layout-dashboard', color: '#2563eb', isDefault: false });
    setDrawerOpen(true);
  };

  const openEdit = (cat: CustomerMenuCategory) => {
    setEditTarget(cat);
    setSelectedRoutes(cat.enabledRoutes);
    reset({
      name: cat.name,
      description: cat.description ?? '',
      icon: cat.icon ?? 'layout-dashboard',
      color: cat.color ?? '#2563eb',
      isDefault: cat.isDefault,
    });
    setDrawerOpen(true);
  };

  const onSubmit = async (values: CategoryFormValues) => {
    const dto: CreateMenuCategoryDto = {
      name: values.name,
      description: values.description || undefined,
      icon: values.icon || undefined,
      color: values.color || undefined,
      enabledRoutes: selectedRoutes,
      isDefault: values.isDefault,
    };

    if (editTarget) {
      await updateMut.mutateAsync({ id: editTarget.id, dto });
    } else {
      await createMut.mutateAsync(dto);
    }
    setDrawerOpen(false);
  };

  const handleDelete = async (id: string) => {
    await deleteMut.mutateAsync(id);
    setDeleteConfirm(null);
  };

  if (categoriesQuery.isLoading) {
    return (
      <div style={{ padding: 24 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ height: 60, background: '#f3f4f6', borderRadius: 8, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ fontSize: 13, color: '#6b7280' }}>
          {categories.length} categor{categories.length !== 1 ? 'ies' : 'y'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {categories.length === 0 && (
            <Button variant="outline" size="sm" onClick={() => seedMut.mutate()} disabled={seedMut.isPending}>
              <Icon name="sparkles" size={13} /> Seed Defaults
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={openCreate}>
            <Icon name="plus" size={13} /> Create Category
          </Button>
        </div>
      </div>

      {/* Empty state */}
      {categories.length === 0 && (
        <div style={{
          border: '1px dashed #d1d5db', borderRadius: 12, padding: 40, textAlign: 'center',
        }}>
          <div style={{ color: '#9ca3af', marginBottom: 12 }}><Icon name="layout-list" size={40} /></div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 6 }}>No menu categories yet</div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Create categories to control which pages each portal user can access.
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Icon name="plus" size={14} /> Create First Category
          </Button>
        </div>
      )}

      {/* Categories table */}
      {categories.length > 0 && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase' }}>Category</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 100 }}>Routes</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 80 }}>Users</th>
                <th style={{ padding: '10px 14px', textAlign: 'center', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 90 }}>Default</th>
                <th style={{ padding: '10px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: (cat.color ?? '#2563eb') + '1a',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: cat.color ?? '#2563eb',
                      }}>
                        <Icon name={(cat.icon ?? 'layout-dashboard') as any} size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{cat.name}</div>
                        {cat.description && (
                          <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>{cat.description}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>
                      {cat.enabledRoutes.length}/{allRoutes.length}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    <span style={{ fontSize: 13, color: '#374151' }}>
                      {cat._count?.users ?? 0}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                    {cat.isDefault && (
                      <span style={{ color: '#f59e0b' }}>
                        <Icon name="star" size={16} />
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(cat)}>
                        <Icon name="pencil" size={13} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(cat.id)}
                        style={{ color: '#ef4444' }}
                      >
                        <Icon name="trash-2" size={13} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create/Edit Drawer */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editTarget ? `Edit: ${editTarget.name}` : 'Create Menu Category'}
        position="right"
        size="lg"
      >
        <form onSubmit={handleSubmit(onSubmit) as any} style={{ padding: 24 }}>
          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Category Name *
            </label>
            <input
              {...register('name', { required: 'Name is required' })}
              placeholder="e.g. Premium Customer"
              style={{
                width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
                border: `1px solid ${errors.name ? '#ef4444' : '#d1d5db'}`, outline: 'none', boxSizing: 'border-box',
              }}
            />
            {errors.name && <div style={{ fontSize: 12, color: '#ef4444', marginTop: 4 }}>{errors.name.message}</div>}
          </div>

          {/* Description */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
              Description
            </label>
            <input
              {...register('description')}
              placeholder="Brief description of this access level"
              style={{
                width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
                border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Icon + Color row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Icon (Lucide name)
              </label>
              <input
                {...register('icon')}
                placeholder="layout-dashboard"
                style={{
                  width: '100%', padding: '8px 12px', fontSize: 14, borderRadius: 8,
                  border: '1px solid #d1d5db', outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Color
              </label>
              <input
                type="color"
                {...register('color')}
                style={{
                  width: '100%', padding: '4px 6px', height: 38, borderRadius: 8,
                  border: '1px solid #d1d5db', cursor: 'pointer', boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Default toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <input type="checkbox" id="isDefault" {...register('isDefault')} style={{ width: 16, height: 16 }} />
            <label htmlFor="isDefault" style={{ fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              Set as default category (assigned to new portal users automatically)
            </label>
          </div>

          {/* Routes */}
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>
              Enabled Pages
            </div>
            {routesQuery.isLoading ? (
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Loading routes…</div>
            ) : (
              <RouteCheckboxTree
                routes={allRoutes}
                selectedRoutes={selectedRoutes}
                onChange={setSelectedRoutes}
              />
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10 }}>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDrawerOpen(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={createMut.isPending || updateMut.isPending}
              style={{ flex: 2 }}
            >
              {(createMut.isPending || updateMut.isPending) ? 'Saving…' : editTarget ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Drawer>

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
        }}>
          <div style={{
            background: 'white', borderRadius: 12, padding: 28, maxWidth: 420, width: '90%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{ color: '#ef4444' }}><Icon name="alert-triangle" size={22} /></span>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#111827' }}>Delete Category?</div>
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 24 }}>
              All users assigned to this category will have their category unset. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)} style={{ flex: 1 }}>Cancel</Button>
              <Button
                variant="danger"
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleteMut.isPending}
                style={{ flex: 1 }}
              >
                {deleteMut.isPending ? 'Deleting…' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
