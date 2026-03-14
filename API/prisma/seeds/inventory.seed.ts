import { PrismaClient } from '@prisma/client';

const INVENTORY_LABELS = [
  {
    industryCode: 'software',
    serialNoLabel: 'CD Key',
    code1Label: 'Activation Key',
    code2Label: 'License ID',
    expiryLabel: 'Validity',
    stockInLabel: 'Purchase',
    stockOutLabel: 'Delivered',
    locationLabel: 'Warehouse',
  },
  {
    industryCode: 'restaurant',
    serialNoLabel: 'Batch No',
    code1Label: null,
    code2Label: null,
    expiryLabel: 'Shelf Life',
    stockInLabel: 'Purchase',
    stockOutLabel: 'Kitchen Use',
    locationLabel: 'Kitchen',
  },
  {
    industryCode: 'electronics',
    serialNoLabel: 'Serial Number',
    code1Label: 'IMEI',
    code2Label: 'Warranty Code',
    expiryLabel: 'Warranty Period',
    stockInLabel: 'Stock In',
    stockOutLabel: 'Stock Out',
    locationLabel: 'Warehouse',
  },
  {
    industryCode: 'pharma',
    serialNoLabel: 'Batch No',
    code1Label: 'Lot No',
    code2Label: null,
    expiryLabel: 'Expiry Date',
    stockInLabel: 'Purchase',
    stockOutLabel: 'Dispensed',
    locationLabel: 'Store',
  },
  {
    industryCode: 'retail',
    serialNoLabel: 'Serial No',
    code1Label: 'Product Code',
    code2Label: 'Barcode',
    expiryLabel: null,
    stockInLabel: 'Received',
    stockOutLabel: 'Sold',
    locationLabel: 'Store',
  },
];

export async function seedInventory(prisma: PrismaClient) {
  console.log('  Seeding inventory labels...');

  // Upsert labels
  for (const label of INVENTORY_LABELS) {
    await prisma.inventoryLabel.upsert({
      where: { industryCode: label.industryCode },
      create: label,
      update: {
        serialNoLabel: label.serialNoLabel,
        code1Label: label.code1Label,
        code2Label: label.code2Label,
        expiryLabel: label.expiryLabel,
        stockInLabel: label.stockInLabel,
        stockOutLabel: label.stockOutLabel,
        locationLabel: label.locationLabel,
      },
    });
  }

  console.log(`    ✅ ${INVENTORY_LABELS.length} industry labels seeded`);

  // Seed sample locations for default tenant
  const defaultTenant = await prisma.tenant.findFirst({ where: { slug: 'default' } });
  if (defaultTenant) {
    const tenantId = defaultTenant.id;

    const locations = [
      { tenantId, name: 'Main Warehouse', code: 'WH-MAIN', type: 'WAREHOUSE', isDefault: true, city: 'Delhi' },
      { tenantId, name: 'Store Room', code: 'STORE-01', type: 'STORE', isDefault: false, city: 'Delhi' },
    ];

    for (const loc of locations) {
      const existing = await prisma.stockLocation.findFirst({
        where: { tenantId: loc.tenantId, code: loc.code },
      });
      if (!existing) {
        await prisma.stockLocation.create({ data: loc });
      }
    }
    console.log(`    ✅ 2 stock locations seeded for default tenant`);

    // Create sample inventory items and serials if products exist
    const products = await prisma.product.findMany({
      where: { tenantId },
      take: 2,
    });

    if (products.length > 0) {
      const mainWh = await prisma.stockLocation.findFirst({
        where: { tenantId, code: 'WH-MAIN' },
      });

      for (const product of products) {
        // Create inventory item
        const invItem = await prisma.inventoryItem.upsert({
          where: { tenantId_productId: { tenantId, productId: product.id } },
          create: {
            tenantId,
            productId: product.id,
            inventoryType: 'SERIAL',
            currentStock: 5,
            sellingPrice: product.salePrice,
            avgCostPrice: product.costPrice,
            hsnCode: product.hsnCode,
          },
          update: {},
        });

        // Create 5 serial numbers per product
        for (let i = 1; i <= 5; i++) {
          const serialNo = `SN-${product.code}-${String(i).padStart(3, '0')}`;
          const existing = await prisma.serialMaster.findFirst({
            where: { tenantId, serialNo },
          });
          if (!existing) {
            await prisma.serialMaster.create({
              data: {
                tenantId,
                productId: product.id,
                inventoryItemId: invItem.id,
                serialNo,
                code1: `ACT-${product.code}-${i}`,
                code2: `LIC-${product.code}-${i}`,
                status: i <= 3 ? 'AVAILABLE' : i === 4 ? 'SOLD' : 'RESERVED',
                expiryType: 'YEARS',
                expiryValue: 1,
                expiryDate: new Date(Date.now() + (i * 30 + 60) * 24 * 60 * 60 * 1000),
                mrp: product.mrp ? Number(product.mrp) : undefined,
                purchaseRate: product.purchasePrice ? Number(product.purchasePrice) : undefined,
                saleRate: product.salePrice ? Number(product.salePrice) : undefined,
                costPrice: product.costPrice ? Number(product.costPrice) : undefined,
                locationId: mainWh?.id,
              },
            });
          }
        }

        // Create sample transactions
        if (mainWh) {
          const existingTxn = await prisma.stockTransaction.findFirst({
            where: { tenantId, productId: product.id },
          });
          if (!existingTxn) {
            await prisma.stockTransaction.create({
              data: {
                tenantId,
                inventoryItemId: invItem.id,
                productId: product.id,
                transactionType: 'PURCHASE_IN',
                quantity: 5,
                unitPrice: product.purchasePrice ? Number(product.purchasePrice) : undefined,
                totalAmount: product.purchasePrice ? Number(product.purchasePrice) * 5 : undefined,
                locationId: mainWh.id,
                referenceType: 'MANUAL',
                remarks: 'Opening stock',
              },
            });

            // Stock summary
            await prisma.stockSummary.upsert({
              where: { tenantId_productId_locationId: { tenantId, productId: product.id, locationId: mainWh.id } },
              create: {
                tenantId,
                productId: product.id,
                locationId: mainWh.id,
                inventoryItemId: invItem.id,
                totalIn: 5,
                currentStock: 5,
              },
              update: {},
            });
          }
        }
      }
      console.log(`    ✅ ${products.length * 5} sample serials and transactions seeded`);
    }
  }
}
