import { Controller, Get, Path, Query, Response, Route, Tags } from 'tsoa';

import * as RegionService from './region.service';
import { CloudRegion, CloudRegionList } from './region.type';

@Route('cloudRegions')
@Tags('Cloud Regions')
export class RegionController extends Controller {
  @Get('/')
  @Response<{ message: string }>(500, 'Internal Server Error')
  public async listCloudRegion(@Query() name?: string, @Query() page: number = 1, @Query() limit: number = 10): Promise<CloudRegionList> {
    const result = await RegionService.listCloudRegion({
      name: name || '',
      page: page || 1,
      limit: limit || 10,
    });
    return {
      data: result.data,
      pagination: result.pagination,
    };
  }

  @Get('/{uid}')
  public async getCloudRegion(@Path() uid: string): Promise<CloudRegion> {
    const result = await RegionService.getCloudRegion(uid);
    return result;
  }
}
