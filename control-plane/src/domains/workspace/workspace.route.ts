import { Request, Response, Router } from 'express';
import logger from '@/config/logger';
import { createWorkspace, deleteWorkspace, listWorkspace, updateWorkspace, detailWorkspace } from '@/domains/workspace/workspace.service';
import { createErrorResponse, createSuccessResponse } from '@/utils/api';
import workspaceValidator from '@/domains/workspace/workspace.validator';
import { resultValidator } from '@/validator/result.validator';

const workspaceRoute = Router();

/******************************************************************************
 * Get all workspaces
 * Always filtered by userId
 *****************************************************************************/
workspaceRoute.get('/', workspaceValidator.listWorkspaces, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, page = 1, limit = 10 } = req.query;

    const result = await listWorkspace({
      userId: req.user.id,
      name: name as string,
      description: description as string,
      page: parseInt(page as string) || 1,
      limit: parseInt(limit as string) || 10,
    });
    res.status(200).json(createSuccessResponse(result));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * Create a workspace
 *****************************************************************************/
workspaceRoute.post('/', workspaceValidator.createWorkspace, resultValidator, async (req: Request, res: Response) => {
  try {
    const { name, description, metadata } = req.body;

    if (!req.user.accountMembers || req.user.accountMembers.length === 0) {
      return res.status(400).json({
        error: 'User must belong to at least one account to create workspace',
      });
    }

    const workspace = await createWorkspace({
      account: req.account.id,
      name,
      description,
      metadata,
      storage: {}, // TODO: get storage from request body and validate
      network: {}, // TODO: get network from request body and validate
      createdBy: { connect: { id: req.user.id } },
    });
    res.status(201).json(createSuccessResponse(workspace));
  } catch (err: unknown) {
    logger.error(err);
    const errorResponse = createErrorResponse(err as Error);
    res.status(errorResponse.statusCode).json(errorResponse);
  }
});

/******************************************************************************
 * TODO: Update a workspace
 *****************************************************************************/
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

/******************************************************************************
 * Describe a workspace
 *****************************************************************************/
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

/******************************************************************************
 * Delete a workspace
 *****************************************************************************/
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

export default workspaceRoute;
