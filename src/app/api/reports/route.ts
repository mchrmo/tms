import reportsController from '@/lib/controllers/reports.controller';
import { errorHandler } from '@/lib/services/api.service';

export const POST = errorHandler(reportsController.processReports)