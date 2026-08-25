import { Router } from 'express';
import { listModuleTypeMeta } from '../../modules/registry.js';

export const moduleTypesRouter = Router();

moduleTypesRouter.get('/', (_req, res) => {
  res.json(listModuleTypeMeta());
});
