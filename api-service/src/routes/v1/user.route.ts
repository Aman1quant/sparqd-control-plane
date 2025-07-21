import express, { Request, Response, Router } from 'express';
import { listUser, detailUser, createUser, editUser, deleteUser } from '@/services/user.service';
import logger from '@/config/logger';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import userValidator from '@/validator/user.validator';
import { resultValidator } from '@/validator/result.validator';

const userRouter = express.Router();

userRouter.get('/', userValidator.listUsers, resultValidator, async (req: Request, res: Response) => {
  try {
    const { email, fullName, hasAccountSignedUp, page = 1, limit = 10 } = req.query;

    const filters = {
      email: email as string,
      fullName: fullName as string,
      hasAccountSignedUp: hasAccountSignedUp === 'true' ? true : hasAccountSignedUp === 'false' ? false : undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listUser(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

userRouter.get('/:uid', userValidator.getUserDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const user = await detailUser(uid);
    res.status(200).json(createSuccessResponse(user));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

userRouter.post('/', userValidator.createUser, resultValidator, async (req: Request, res: Response) => {
  try {
    const { email, kcSub, fullName, avatarUrl, hasAccountSignedUp } = req.body;

    const userData = {
      email,
      kcSub,
      fullName,
      avatarUrl,
      hasAccountSignedUp,
    };

    const user = await createUser(userData);
    res.status(201).json(createSuccessResponse(user));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

userRouter.put('/:uid', userValidator.updateUser, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { email, fullName, avatarUrl, hasAccountSignedUp } = req.body;

    const updateData = {
      email,
      fullName,
      avatarUrl,
      hasAccountSignedUp,
    };

    // Remove undefined values
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const user = await editUser(uid, updateData);
    res.status(200).json(createSuccessResponse(user));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

userRouter.delete('/:uid', userValidator.deleteUser, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const user = await deleteUser(uid);
    res.status(200).json(createSuccessResponse(user));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/users', userRouter);
};