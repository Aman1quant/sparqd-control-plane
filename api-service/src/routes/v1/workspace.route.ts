import express, { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import { createWorkspace, deleteWorkspace, listWorkspace, updateWorkspace, detailWorkspace } from '@/services/workspace.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import workspaceValidator from '@/validator/workspace.validator';
import { resultValidator } from '@/validator/result.validator';

const workspaceRoute = express.Router();

workspaceRoute.get('/', workspaceValidator.listWorkspaces, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, accountId, createdById, page = 1, limit = 10 } = req.query;

    const filters = {
      name: name as string,
      description: description as string,
      accountId: accountId ? parseInt(accountId as string) : undefined,
      createdById: createdById ? parseInt(createdById as string) : undefined,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    };

    const result = await listWorkspace(filters);
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

workspaceRoute.post('/', workspaceValidator.createWorkspace, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, accountId, createdById, metadata } = req.body;

    const workspaceData = {
      name,
      description,
      accountId: parseInt(accountId),
      ...(metadata !== undefined && { metadata }),
      ...(createdById && { createdById: parseInt(createdById) }),
    };

    const workspace = await createWorkspace(workspaceData);
    res.status(201).json(createSuccessResponse(workspace));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

workspaceRoute.put('/:uid', workspaceValidator.updateWorkspace, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const { name, description, metadata } = req.body;

    const workspaceData = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(metadata !== undefined && { metadata }),
    };

    const workspace = await updateWorkspace(uid, workspaceData);
    res.status(200).json(createSuccessResponse(workspace));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

workspaceRoute.get('/:uid', workspaceValidator.getWorkspaceDetail, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;
    const workspace = await detailWorkspace(uid);

    res.status(200).json(createSuccessResponse(workspace));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

workspaceRoute.delete('/:uid', workspaceValidator.deleteWorkspace, resultValidator, async (req: Request, res: Response) => {
  try {
    const { uid } = req.params;

    const deletedWorkspace = await deleteWorkspace(uid);
    res.status(200).json(createSuccessResponse(deletedWorkspace));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

export default (router: Router) => {
  router.use('/v1/workspace', workspaceRoute);
};
