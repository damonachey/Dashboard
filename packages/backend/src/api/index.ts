import { Router } from 'express';
import { moduleTypesRouter } from './routes/moduleTypes.js';
import { tabsRouter } from './routes/tabs.js';
import { moduleInstancesRouter, moduleInstancesRouterForTab } from './routes/moduleInstances.js';
import { googleAuthRouter } from './routes/googleAuth.js';
import { searchRouter } from './routes/search.js';

export const apiRouter = Router();

apiRouter.use('/module-types', moduleTypesRouter);
apiRouter.use('/tabs/:tabId/modules', moduleInstancesRouterForTab);
apiRouter.use('/tabs', tabsRouter);
apiRouter.use('/module-instances', moduleInstancesRouter);
apiRouter.use('/auth/google', googleAuthRouter);
apiRouter.use('/search', searchRouter);
