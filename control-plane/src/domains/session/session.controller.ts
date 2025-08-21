import { authMiddleware } from '@/middlewares/auth.middleware';
import * as express from 'express';
import { Body, Controller, Get, Middlewares, Post, Request, Route, SuccessResponse, Tags } from "tsoa";
import { CurrentSessionContext, SessionContext, SwitchSessionRequest } from './session.types';
import logger from '@/config/logger';
import { getCurrentSessionContext } from './session.service';

@Route('session')
@Tags('Session')
@Middlewares(authMiddleware)
export class SessionController extends Controller {

  @Post("switch")
  @SuccessResponse("200", "Switched")
  public async switchSession(
    @Body() body: SwitchSessionRequest,
    @Request() req: express.Request,
  ): Promise<void> {
    const { accountUid, workspaceUid } = body;

    req.res?.cookie("active_account", accountUid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    req.res?.cookie("active_workspace", workspaceUid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return;
  }

  @Get("context")
  @SuccessResponse("200", "Fetched")
  public async getContext(
    @Request() req: express.Request,
  ): Promise<CurrentSessionContext> {
      const accountUid = req.res?.req.cookies?.active_account;
      const workspaceUid = req.res?.req.cookies?.active_workspace;

      logger.debug({ accountUid, workspaceUid }, "GET /context");

      const result = await getCurrentSessionContext({
        user: (req.res?.req as any).user,
        activeAccountUid: accountUid,
        activeWorkspaceUid: workspaceUid,
      });

      return result;
  }
}