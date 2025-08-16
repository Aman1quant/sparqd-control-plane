import { Controller, Route, Get, Query, Response, Tags } from 'tsoa';
import { CloudRegionList } from './region.type';
import { listCloudRegion } from './region.service';


@Route("cloudRegion")
@Tags("Cloud Region")
export class RegionController extends Controller {

  /**
 * List cloud regions with optional filtering by name and pagination.
 * @param name Optional name filter
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 10)
 */
  @Get("/")
  @Response<{ message: string }>(500, "Internal Server Error")
  public async listCloudRegion(
    @Query() name?: string,
    @Query() page: number = 1,
    @Query() limit: number = 10
  ): Promise<CloudRegionList> {
    try {
      const result = await listCloudRegion({
        name: name || "",
        page: page || 1,
        limit: limit || 10,
      });
      return {
        // code: "SUCCESS",
        // message: "Success",
        // errors: [],
        data: result.data,
        pagination: result.pagination
      }
    } catch (err) {
      const errorResponse = err as Error;
      // this.setStatus(errorResponse.statusCode);
      // throw errorResponse;

      throw { statusCode: 500, message: errorResponse.message || "Internal Server Error" };
    }
  }
}

