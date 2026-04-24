import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CfgVerticalController } from '../cfg-vertical.controller';
import { CfgVerticalService } from '../cfg-vertical.service';

const mockVertical = {
  id: 'v1',
  code: 'gv',
  name: 'General',
  description: 'Default vertical',
  tablePrefix: 'gv_',
  isActive: true,
  isBuilt: true,
  sortOrder: 1,
  metadata: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  modules: [],
};

describe('CfgVerticalController', () => {
  let controller: CfgVerticalController;
  let service: CfgVerticalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CfgVerticalController],
      providers: [
        {
          provide: CfgVerticalService,
          useValue: {
            listAll: jest.fn().mockResolvedValue([mockVertical]),
            findActive: jest.fn().mockResolvedValue([mockVertical]),
            findBuilt: jest.fn().mockResolvedValue([mockVertical]),
            findByCode: jest.fn().mockResolvedValue(mockVertical),
          },
        },
      ],
    }).compile();

    controller = module.get(CfgVerticalController);
    service = module.get(CfgVerticalService);
  });

  it('GET / should call listAll', async () => {
    const result = await controller.listAll();
    expect(result).toHaveLength(1);
    expect(service.listAll).toHaveBeenCalled();
  });

  it('GET /active should call findActive', async () => {
    const result = await controller.findActive();
    expect(result).toHaveLength(1);
    expect(service.findActive).toHaveBeenCalled();
  });

  it('GET /built should call findBuilt', async () => {
    const result = await controller.findBuilt();
    expect(result).toHaveLength(1);
    expect(service.findBuilt).toHaveBeenCalled();
  });

  it('GET /:code should call findByCode', async () => {
    const result = await controller.findByCode('gv');
    expect(result.code).toBe('gv');
    expect(service.findByCode).toHaveBeenCalledWith('gv');
  });

  it('GET /:code should propagate NotFoundException', async () => {
    (service.findByCode as jest.Mock).mockRejectedValue(
      new NotFoundException("Vertical with code 'xyz' not found"),
    );
    await expect(controller.findByCode('xyz')).rejects.toThrow(NotFoundException);
  });
});
