import { Router, IRouter } from 'express';
import { addAsync } from '@awaitjs/express';

interface CustomRouter extends Router {
  useAsync: IRouter['use'];
  deleteAsync: IRouter['delete'];
  getAsync: IRouter['get'];
  patchAsync: IRouter['patch'];
  postAsync: IRouter['post'];
  putAsync: IRouter['put'];
  headAsync: IRouter['head'];
}

const router: CustomRouter = addAsync(Router());

export default router;
