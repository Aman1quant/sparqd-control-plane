import * as express from "express";
import { Controller, Middlewares, Post, Request, Res, Route, SuccessResponse, Tags, TsoaResponse } from "tsoa";
import { onboardNewUser } from '@/domains/onboarding/onboarding.service';
import { getUserByKcSub } from '@/domains/user/user.service';

import logger from "@/config/logger";
import { resolveTenantContextOptional } from "@/middlewares/resolveTenantContext";
import { OnboardedUser } from "./onboarding.type";
import { authMiddleware } from "@/middlewares/auth.middleware";

@Route("onboarding")
@Tags("Onboarding")
@Middlewares(authMiddleware, resolveTenantContextOptional)
export class OnboardingController extends Controller {

  @Post("/")
  @SuccessResponse(201)
  /**
   * Onboard new user
   * @param notFoundResponse The responder function for a not found user
   */
  public async onboardNewUser(
    @Request() req: express.Request,
    @Res() notFoundResponse: TsoaResponse<404, { error: string }>
  ): Promise<OnboardedUser | null> {
    try {
      logger.info(`req.kcUser: ${req.kcUser}`)
      const kcSub = req.kcUser?.sub;
      const email = req.kcUser?.email as string;
      const firstName = req.kcUser?.given_name || '';
      const lastName = req.kcUser?.family_name || '';
      const fullName = `${firstName} ${lastName}`;

      // Check of user exists in DB
      if (kcSub && email) {
        const user = await getUserByKcSub(kcSub);

        if (!user) {
          const result = await onboardNewUser({
            email: email as string,
            kcSub: kcSub,
            fullName: fullName,
            accountName: 'default',
          });
          this.setStatus(201)
          return result;
        }
        return user;
      } else {
        return notFoundResponse(404, { error: 'User not found' });

      }

    } catch (err) {
      const errorResponse = err as Error;
      throw { statusCode: 500, message: errorResponse.message || "Internal Server Error" };
    }
  }
}