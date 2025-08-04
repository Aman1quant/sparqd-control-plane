import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { resultValidator } from '@/validator/result.validator';
import { Request, Response, Router } from 'express';
import { getCurrentSessionContext } from '@/domains/session/session.service';
import sessionValidator from '@/domains/session/session.validator';

const sessionRoute = Router();

/******************************************************************************
 * Switch current session context (Account/Workspace switcher)
 *****************************************************************************/
sessionRoute.post('/switch', sessionValidator.switchSession, resultValidator, async (req: Request, res: Response) => {
  try {
    const { accountUid, workspaceUid } = req.body;
    const user = req.user;

    // TODO: check permission

    res.cookie('active_account', accountUid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.cookie('active_workspace', workspaceUid, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    res.status(200).json(createSuccessResponse({}));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Get current session context
 *****************************************************************************/
sessionRoute.get('/context', resultValidator, async (req: Request, res: Response) => {
  try {
    const accountUid = req.cookies?.active_account;
    const workspaceUid = req.cookies?.active_workspace;
    console.log(`accountUid=${accountUid}`);
    const result = await getCurrentSessionContext({
      user: req.user,
      activeAccountUid: accountUid,
      activeWorkspaceUid: workspaceUid,
    });
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default sessionRoute;
