import * as TempService from './temp.service';
import { Body, Controller, Post, Route, SuccessResponse, Tags } from "tsoa";
import { TempLoginRequest, TempLoginResponse } from './temp.type';

@Route('temp/login')
@Tags('Temporary')
export class TempController extends Controller {
  @Post('/')
  @SuccessResponse(200)
  public async login(@Body() body: TempLoginRequest): Promise<TempLoginResponse> {
    const response = await TempService.login({
      username: body.username,
      password: body.password,
    });
    const { id, ...rest } = response;
    return {
      id: Number(id),
      ...rest
    };
  }
}
