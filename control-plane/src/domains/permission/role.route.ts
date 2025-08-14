import { Request, Response, Router } from 'express';

import logger from '@/config/logger';
import { createRole, deleteRole, detailRole, editRole, listRole } from '@/domains/permission/role.service';
import roleValidator from '@/domains/permission/role.validator';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import { resultValidator } from '@/validator/result.validator';

const roleRouter = Router();

roleRouter.get('/', roleValidator.listRoles, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, page = 1, limit = 10 } = req.query;

    const filters = {
      name: name as string,
      description: description as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listRole(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

roleRouter.get('/:uid', roleValidator.getRoleDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const role = await detailRole(uid);

    if (!role) {
      return res.status(404).json(createErrorResponse(new Error('Role not found')));
    }

    res.status(200).json(createSuccessResponse(role));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

roleRouter.post('/', roleValidator.createRole, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const roleData = {
      name,
      description,
    };

    const role = await createRole(roleData);
    res.status(201).json(createSuccessResponse(role));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

roleRouter.put('/:uid', roleValidator.updateRole, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { name, description } = req.body;

    const updateData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
    };

    const role = await editRole(uid, updateData);
    res.status(200).json(createSuccessResponse(role));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

roleRouter.delete('/:uid', roleValidator.deleteRole, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const role = await deleteRole(uid);
    res.status(200).json(createSuccessResponse(role));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default roleRouter;
