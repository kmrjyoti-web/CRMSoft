import { PrismaClient } from '@prisma/identity-client';

const identity = new PrismaClient({
  datasources: { db: { url: process.env.IDENTITY_DATABASE_URL } },
});

async function resetOnboarding(email: string) {
  const user = await identity.user.findFirst({ where: { email } });
  if (!user) {
    console.error(`User not found: ${email}`);
    return;
  }

  await identity.user.update({
    where: { id: user.id },
    data: {
      onboardingComplete: false,
      onboardingStage: 'language',
      preferredLocale: 'en',
      emailVerified: false,
      emailVerifiedAt: null,
      mobileVerified: false,
      mobileVerifiedAt: null,
    } as any,
  });

  // Expire any pending OTPs
  await identity.verificationOtp.updateMany({
    where: { userId: user.id, status: 'OTP_PENDING' },
    data: { status: 'OTP_EXPIRED' },
  });

  console.log(`✅ Reset onboarding for ${email} (id: ${user.id})`);
}

const email = process.argv[2] || 'kmrjyoti@gmail.com';
resetOnboarding(email)
  .then(() => identity.$disconnect())
  .catch((e) => { console.error(e); identity.$disconnect(); process.exit(1); });
