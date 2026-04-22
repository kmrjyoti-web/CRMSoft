import { Test, TestingModule } from '@nestjs/testing';
import { CqrsModule } from '@nestjs/cqrs';
import { CreatePostHandler } from '../application/commands/create-post/create-post.handler';
import { CreatePostCommand } from '../application/commands/create-post/create-post.command';
import { MktPrismaService } from '../infrastructure/mkt-prisma.service';

const mockMktPrisma = {
  client: {
    mktPost: {
      create: jest.fn(),
    },
  },
};

describe('CreatePostHandler', () => {
  let handler: CreatePostHandler;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CqrsModule],
      providers: [
        CreatePostHandler,
        { provide: MktPrismaService, useValue: mockMktPrisma },
      ],
    }).compile();

    handler = module.get<CreatePostHandler>(CreatePostHandler);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create a post and return its id', async () => {
    mockMktPrisma.client.mktPost.create.mockResolvedValue({ id: 'post-1', postType: 'TEXT', status: 'ACTIVE' });

    const command = new CreatePostCommand(
      'tenant-1', 'user-1', 'user-1', 'TEXT', 'Hello marketplace!',
    );
    const result = await handler.execute(command);

    expect(typeof result).toBe('string');
    expect(mockMktPrisma.client.mktPost.create).toHaveBeenCalledTimes(1);
  });

  it('should set SCHEDULED status for future publishAt', async () => {
    mockMktPrisma.client.mktPost.create.mockResolvedValue({ id: 'post-2', status: 'SCHEDULED' });

    const futureDate = new Date(Date.now() + 86400000);
    const command = new CreatePostCommand(
      'tenant-1', 'user-1', 'user-1', 'ANNOUNCEMENT', 'Coming soon!',
      undefined, undefined, undefined, undefined, undefined, undefined, undefined, futureDate,
    );

    await handler.execute(command);
    const callArg = mockMktPrisma.client.mktPost.create.mock.calls[0][0];
    expect(callArg.data.status).toBe('SCHEDULED');
  });
});
