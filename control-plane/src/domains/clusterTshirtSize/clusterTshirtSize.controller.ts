import { Controller, Get, Middlewares, Query, Route, SuccessResponse, Tags } from 'tsoa';

import { authMiddleware } from '@/middlewares/auth.middleware';
import { resolveTenantContextOptional } from '@/middlewares/resolveTenantContext';

import { listClusterTshirtSize } from './clusterTshirtSize.service';
import { ClusterTshirtSizeList } from './clusterTshirtSize.type';

@Route('clusterTshirtSize')
@Tags('Cluster Tshirt Size')
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class ClusterTshirtSizeController extends Controller {
  @Get('/')
  @SuccessResponse(200)
  public async listClusterTshirtSize(
    @Query() providerName?: string,
    @Query() name?: string,
    @Query() plan?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10,
  ): Promise<ClusterTshirtSizeList> {
    const result = await listClusterTshirtSize({
      provider: providerName,
      name: name || '',
      plan: plan,
      page: page || 1,
      limit: limit || 10,
    });
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }
}
