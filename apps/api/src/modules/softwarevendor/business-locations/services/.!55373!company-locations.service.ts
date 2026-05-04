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

