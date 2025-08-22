import { Controller, Get, Middlewares, Query, Route, SuccessResponse, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

import { listAvailableService } from './service.service';
import { AvailableServiceList } from './service.type';

@Route('services')
@Tags('Services')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class AvailableServiceController extends Controller {
  @Get('/')
  @SuccessResponse(200)
  public async listAvailableService(
    @Query() name?: string,
    @Query() plan?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<AvailableServiceList> {
    const result = await listAvailableService({
      name: name || '',
      plan: plan ?? '',
      page: page || 1,
      limit: limit || 10,
    });
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }
}
