import { ValueObject } from '../value-object';
import { Result } from '../../result/result';

interface GSTINProps {
  value: string;
}

const STATE_CODES: Record<string, string> = {
  '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab',
  '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
  '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
  '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
  '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
  '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
  '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
  '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
  '26': 'Dadra & Nagar Haveli', '27': 'Maharashtra', '28': 'Andhra Pradesh',
  '29': 'Karnataka', '30': 'Goa', '31': 'Lakshadweep',
  '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
  '35': 'Andaman & Nicobar', '36': 'Telangana', '37': 'Andhra Pradesh (New)',
  '97': 'Other Territory', '99': 'Centre Jurisdiction',
};

/**
 * GSTIN — Indian Goods and Services Tax Identification Number value object.
 * Format: 2-digit state code + 10-digit PAN + 1-digit entity number + Z + 1-digit checksum
 */
export class GSTIN extends ValueObject<GSTINProps> {
  private static readonly PATTERN =
    /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

  private constructor(props: GSTINProps) {
    super(props);
  }

  static create(value: string): Result<GSTIN> {
    if (!value) {
      return Result.fail('GSTIN_001');
    }
    const normalized = value.trim().toUpperCase();
    if (!GSTIN.PATTERN.test(normalized)) {
      return Result.fail('GSTIN_002', { gstin: value });
    }
    return Result.ok(new GSTIN({ value: normalized }));
  }

  get value(): string {
    return this.props.value;
  }

  get stateCode(): string {
    return this.props.value.substring(0, 2);
  }

  get stateName(): string {
    return STATE_CODES[this.stateCode] ?? 'Unknown';
  }

  get pan(): string {
    return this.props.value.substring(2, 12);
  }

  get entityNumber(): string {
    return this.props.value.substring(12, 13);
  }
}
