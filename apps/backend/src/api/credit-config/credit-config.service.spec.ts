import { Test, TestingModule } from '@nestjs/testing';
import { CreditConfigService } from './credit-config.service';

describe('CreditConfigService', () => {
  let service: CreditConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CreditConfigService],
    }).compile();

    service = module.get<CreditConfigService>(CreditConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
