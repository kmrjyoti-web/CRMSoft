import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetPredictionMatrixQuery } from './get-prediction-matrix.query';
import { QuotationPredictionService } from '../../../services/quotation-prediction.service';

@QueryHandler(GetPredictionMatrixQuery)
export class GetPredictionMatrixHandler implements IQueryHandler<GetPredictionMatrixQuery> {
  constructor(private readonly prediction: QuotationPredictionService) {}

  async execute(query: GetPredictionMatrixQuery) {
    return this.prediction.predict(query.leadId);
  }
}
