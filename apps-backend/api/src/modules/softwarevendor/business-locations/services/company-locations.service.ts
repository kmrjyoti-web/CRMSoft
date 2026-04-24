import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { Country, State, City } from 'country-state-city';
import { PrismaService } from '../../../../core/prisma/prisma.service';
import { GST_STATE_CODES, getGstCodeForState } from '../data/gst-state-codes';
import type {
  AddCountryDto, AddStatesDto, AddCitiesDto, AddPincodesDto,
  AddPincodeRangeDto, CheckAreaDto,
} from '../presentation/dto/company/company-locations.dto';

@Injectable()
export class CompanyLocationsService {
  constructor(private readonly prisma: PrismaService) {}

  // --- GET full location tree -------------------------------------------------
  async getLocationTree(tenantId: string) {
    return this.prisma.companyCountry.findMany({
      where: { tenantId, isActive: true },
      include: {
        states: {
          where: { isActive: true },
          include: {
            cities: {
              where: { isActive: true },
              include: {
                pincodes: {
                  where: { isActive: true },
                  orderBy: { pincode: 'asc' },
                },
              },
              orderBy: { cityName: 'asc' },
            },
          },
          orderBy: { stateName: 'asc' },
        },
      },
      orderBy: [{ isPrimary: 'desc' }, { countryName: 'asc' }],
    });
  }

  // --- SUMMARY stats ----------------------------------------------------------
  async getSummary(tenantId: string) {
    const [countries, states, cities, pincodes] = await Promise.all([
      this.prisma.companyCountry.count({ where: { tenantId, isActive: true } }),
      this.prisma.companyState.count({ where: { tenantId, isActive: true } }),
      this.prisma.companyCity.count({ where: { tenantId, isActive: true } }),
      this.prisma.companyPincode.count({ where: { tenantId, isActive: true } }),
    ]);
    return { countries, states, cities, pincodes };
  }

  // --- ADD COUNTRY ------------------------------------------------------------
  async addCountry(tenantId: string, dto: AddCountryDto) {
    const existing = await this.prisma.companyCountry.findFirst({
      where: { tenantId, countryCode: dto.countryCode },
    });
    if (existing) {
      // Re-activate if soft-deleted
      if (!existing.isActive) {
        return this.prisma.companyCountry.update({
          where: { id: existing.id },
          data: { isActive: true, isPrimary: dto.isPrimary ?? existing.isPrimary },
        });
      }
      throw new ConflictException(`Country ${dto.countryCode} already added`);
    }

    const countryInfo = Country.getCountryByCode(dto.countryCode);
    if (!countryInfo) throw new NotFoundException(`Country code ${dto.countryCode} not found`);

    if (dto.isPrimary) {
      await this.prisma.companyCountry.updateMany({
        where: { tenantId },
        data: { isPrimary: false },
      });
    }

    return this.prisma.companyCountry.create({
      data: {
        tenantId,
        countryName: countryInfo.name,
        countryCode: dto.countryCode,
        isoCode3: countryInfo.isoCode,
        phonecode: countryInfo.phonecode,
        currency: countryInfo.currency,
        currencySymbol: countryInfo.currency,
        isPrimary: dto.isPrimary ?? false,
      },
    });
  }

  // --- ADD STATE(S) -----------------------------------------------------------
  async addStates(tenantId: string, countryId: string, dto: AddStatesDto) {
    const country = await this.prisma.companyCountry.findFirst({
      where: { id: countryId, tenantId },
    });
    if (!country) throw new NotFoundException('Company country not found');

    const results: any[] = [];
    for (const s of dto.states) {
      const stateInfo = State.getStateByCodeAndCountry(s.stateCode, country.countryCode);
      if (!stateInfo) {
        throw new NotFoundException(`State ${s.stateCode} not found in ${country.countryCode}`);
      }
      const gstCode = getGstCodeForState(s.stateCode);

      const existing = await this.prisma.companyState.findFirst({
        where: { tenantId, companyCountryId: countryId, stateCode: s.stateCode },
      });

      if (existing) {
        const updated = await this.prisma.companyState.update({
          where: { id: existing.id },
          data: {
            isActive: true,
            coverageType: s.coverageType,
            isHeadquarter: s.isHeadquarter ?? false,
            stateGstin: s.stateGstin,
          },
        });
        results.push(updated);
      } else {
        if (s.isHeadquarter) {
          await this.prisma.companyState.updateMany({
            where: { tenantId },
            data: { isHeadquarter: false },
          });
        }
        const state = await this.prisma.companyState.create({
          data: {
            tenantId,
            companyCountryId: countryId,
            stateName: stateInfo.name,
            stateCode: s.stateCode,
            gstStateCode: gstCode ?? null,
            coverageType: s.coverageType,
            isHeadquarter: s.isHeadquarter ?? false,
            stateGstin: s.stateGstin,
          },
        });
        results.push(state);
      }
    }
    return results;
  }

  // --- ADD CITY(S) ------------------------------------------------------------
  async addCities(tenantId: string, stateId: string, dto: AddCitiesDto) {
    const state = await this.prisma.companyState.findFirst({
      where: { id: stateId, tenantId },
    });
    if (!state) throw new NotFoundException('Company state not found');

    const results: any[] = [];
    for (const c of dto.cities) {
      const existing = await this.prisma.companyCity.findFirst({
        where: { tenantId, companyStateId: stateId, cityName: c.cityName },
      });

      if (existing) {
        const updated = await this.prisma.companyCity.update({
          where: { id: existing.id },
          data: { isActive: true, coverageType: c.coverageType, district: c.district },
        });
        results.push(updated);
      } else {
        const city = await this.prisma.companyCity.create({
          data: {
            tenantId,
            companyStateId: stateId,
            cityName: c.cityName,
            district: c.district,
            coverageType: c.coverageType,
          },
        });
        results.push(city);
      }
    }
    return results;
  }

  // --- ADD PINCODE(S) ---------------------------------------------------------
  async addPincodes(tenantId: string, cityId: string, dto: AddPincodesDto) {
    const city = await this.prisma.companyCity.findFirst({ where: { id: cityId, tenantId } });
    if (!city) throw new NotFoundException('Company city not found');

    await this.prisma.companyPincode.createMany({
      data: dto.pincodes.map((p) => ({
        tenantId,
        companyCityId: cityId,
        pincode: p.pincode,
        areaName: p.areaName ?? null,
      })),
      skipDuplicates: true,
    });

    return this.prisma.companyPincode.findMany({
      where: { tenantId, companyCityId: cityId, isActive: true },
      orderBy: { pincode: 'asc' },
    });
  }

  // --- ADD PINCODE RANGE ------------------------------------------------------
  async addPincodeRange(tenantId: string, cityId: string, dto: AddPincodeRangeDto) {
    const city = await this.prisma.companyCity.findFirst({ where: { id: cityId, tenantId } });
    if (!city) throw new NotFoundException('Company city not found');

    const from = parseInt(dto.fromPincode, 10);
    const to = parseInt(dto.toPincode, 10);
    if (isNaN(from) || isNaN(to) || from > to) {
      throw new NotFoundException('Invalid pincode range');
    }
    if (to - from > 999) {
      throw new ConflictException('Range too large (max 1000 pincodes)');
    }

    const pincodes: { tenantId: string; companyCityId: string; pincode: string }[] = [];
    for (let p = from; p <= to; p++) {
      pincodes.push({ tenantId, companyCityId: cityId, pincode: String(p).padStart(6, '0') });
    }

    await this.prisma.companyPincode.createMany({ data: pincodes, skipDuplicates: true });
    return { added: pincodes.length };
  }

  // --- REMOVE (hard delete — cascade handled by Prisma) -----------------------
  async removeCountry(tenantId: string, id: string) {
    await this.prisma.companyCountry.deleteMany({ where: { id, tenantId } });
  }

  async removeState(tenantId: string, id: string) {
    await this.prisma.companyState.deleteMany({ where: { id, tenantId } });
  }

  async removeCity(tenantId: string, id: string) {
    await this.prisma.companyCity.deleteMany({ where: { id, tenantId } });
  }

  async removePincode(tenantId: string, id: string) {
    await this.prisma.companyPincode.deleteMany({ where: { id, tenantId } });
  }

  // --- UPDATE -----------------------------------------------------------------
  async updateState(tenantId: string, id: string, data: Partial<{
    coverageType: string; isHeadquarter: boolean; stateGstin: string;
  }>) {
    if (data.isHeadquarter) {
      await this.prisma.companyState.updateMany({ where: { tenantId }, data: { isHeadquarter: false } });
    }
    return this.prisma.companyState.updateMany({ where: { id, tenantId }, data });
  }

  async updateCity(tenantId: string, id: string, data: Partial<{ coverageType: string; district: string }>) {
    return this.prisma.companyCity.updateMany({ where: { id, tenantId }, data });
  }

  // --- LOOKUP HELPERS (from country-state-city package) ----------------------
  getAllCountries() {
    return Country.getAllCountries().map((c) => ({
      name: c.name,
      code: c.isoCode,
      phonecode: c.phonecode,
      currency: c.currency,
      flag: c.flag,
    }));
  }

  getStatesOfCountry(countryCode: string) {
    return State.getStatesOfCountry(countryCode).map((s) => ({
      name: s.name,
      code: s.isoCode,
      countryCode: s.countryCode,
      gstStateCode: getGstCodeForState(s.isoCode),
    }));
  }

  getCitiesOfState(countryCode: string, stateCode: string) {
    return City.getCitiesOfState(countryCode, stateCode).map((c) => ({
      name: c.name,
      stateCode: c.stateCode,
      countryCode: c.countryCode,
    }));
  }

  getGstStateCodes() {
    return GST_STATE_CODES;
  }

  // --- CHECK if customer address is in operating area --------------------------
  async checkOperatingArea(tenantId: string, dto: CheckAreaDto) {
    // Get company HQ state
    const hqState = await this.prisma.companyState.findFirst({
      where: { tenantId, isHeadquarter: true, isActive: true },
    });

    const operatingState = await this.prisma.companyState.findFirst({
      where: { tenantId, stateCode: dto.customerStateCode, isActive: true },
      include: {
        cities: {
          where: { isActive: true },
          include: { pincodes: { where: { isActive: true } } },
        },
      },
    });

    if (!operatingState) {
      return {
        isInArea: false,
        isSameState: false,
        gstType: 'INTER' as const,
        companyGstStateCode: hqState?.gstStateCode ?? null,
        customerGstStateCode: null,
        message: 'State not in operating area',
      };
    }

    const isSameState = hqState?.stateCode === dto.customerStateCode;

    // ALL_CITIES coverage ? always in area
    if (operatingState.coverageType === 'ALL_CITIES') {
      return {
        isInArea: true,
        isSameState,
        gstType: isSameState ? ('INTRA' as const) : ('INTER' as const),
        companyGstStateCode: hqState?.gstStateCode ?? null,
        customerGstStateCode: operatingState.gstStateCode,
        message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
      };
    }

    // SPECIFIC cities — check pincode
    for (const city of operatingState.cities) {
      if (city.coverageType === 'ALL_PINCODES') {
        return {
          isInArea: true,
          isSameState,
          gstType: isSameState ? ('INTRA' as const) : ('INTER' as const),
          companyGstStateCode: hqState?.gstStateCode ?? null,
          customerGstStateCode: operatingState.gstStateCode,
          message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
        };
      }
      const match = city.pincodes.find((p) => p.pincode === dto.customerPincode);
      if (match) {
        return {
          isInArea: true,
          isSameState,
          gstType: isSameState ? ('INTRA' as const) : ('INTER' as const),
          companyGstStateCode: hqState?.gstStateCode ?? null,
          customerGstStateCode: operatingState.gstStateCode,
          message: isSameState ? 'Intra-state: CGST + SGST' : 'Inter-state: IGST',
        };
      }
    }

    return {
      isInArea: false,
      isSameState,
      gstType: 'INTER' as const,
      companyGstStateCode: hqState?.gstStateCode ?? null,
      customerGstStateCode: operatingState.gstStateCode,
      message: 'Pincode not in operating area',
    };
  }

  // --- Determine GST type for a customer state ---------------------------------
  async determineGstType(tenantId: string, customerStateCode: string): Promise<{
    gstType: 'INTRA' | 'INTER';
    companyGstStateCode: string | null;
    customerGstStateCode: string | null;
  }> {
    const hqState = await this.prisma.companyState.findFirst({
      where: { tenantId, isHeadquarter: true, isActive: true },
    });
    const customerState = await this.prisma.companyState.findFirst({
      where: { tenantId, stateCode: customerStateCode, isActive: true },
    });
    return {
      gstType: hqState?.stateCode === customerStateCode ? 'INTRA' : 'INTER',
      companyGstStateCode: hqState?.gstStateCode ?? null,
      customerGstStateCode: customerState?.gstStateCode ?? null,
    };
  }
}
