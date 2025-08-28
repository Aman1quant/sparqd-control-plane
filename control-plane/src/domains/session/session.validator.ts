import { body } from 'express-validator';

const sessionValidator = {
  switchSession: [body('accountUid').isUUID(), body('workspaceUid').isUUID()],
};

export default sessionValidator;
