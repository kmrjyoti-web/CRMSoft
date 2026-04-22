export interface WinPrediction {
  probability: number;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  factors: {
    factor: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    weight: number;
    description: string;
  }[];
  recommendations: string[];
}

export interface AIGeneratedQuotation {
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    reason: string;
  }[];
  totalAmount: number;
  suggestedDiscount: number;
  notes: string;
}

export interface AISuggestion {
  type: 'PRICING' | 'DISCOUNT' | 'PRODUCT' | 'TIMING' | 'TERMS';
  suggestion: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  currentValue?: string;
  suggestedValue?: string;
}

export interface AIQuestion {
  id: string;
  question: string;
  type: 'TEXT' | 'SELECT' | 'NUMBER';
  options?: string[];
  required: boolean;
}

export interface PredictWinDto {
  quotationId?: string;
  leadId: string;
  totalAmount: number;
  items: { productId: string; quantity: number; unitPrice: number }[];
  discountPercent?: number;
}

export interface GenerateQuotationDto {
  leadId: string;
  answers: Record<string, string | number>;
  industry?: string;
  budget?: number;
  requirements?: string;
  previousQuotationId?: string;
}

export interface GetSuggestionsDto {
  quotationId: string;
}
