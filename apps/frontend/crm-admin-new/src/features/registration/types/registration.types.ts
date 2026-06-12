export interface RegisterFormData {
  companyName: string;
  slug: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  planId?: string;
  businessTypeCode?: string;
}

export interface RegisterRequest {
  companyName: string;
  slug: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  planId?: string;
  businessTypeCode?: string;
}

export interface RegisterResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    userType: string;
    role: string;
  };
  tenant: {
    id: string;
    name: string;
    slug: string;
    status: string;
    onboardingStep: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface PlanOption {
  id: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  billingCycle: string;
  maxUsers?: number;
  isActive: boolean;
}
