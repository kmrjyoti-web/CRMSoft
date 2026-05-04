import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { Logger } from '@nestjs/common';
import { GetPredictionMatrixQuery } from './get-prediction-matrix.query';
import { QuotationPredictionService } from '../../../services/quotation-prediction.service';

@QueryHandler(GetPredictionMatrixQuery)
export class GetPredictionMatrixHandler implements IQueryHandler<GetPredictionMatrixQuery> {
    private readonly logger = new Logger(GetPredictionMatrixHandler.name);

  constructor(private readonly prediction: QuotationPredictionService) {}

  async execute(query: GetPredictionMatrixQuery) {
    try {
      return this.prediction.predict(query.leadId);
    } catch (error) {
      this.logger.error(`GetPredictionMatrixHandler failed: ${(error as Error).message}`, (error as Error).stack);
      throw error;
    }
  }
}
