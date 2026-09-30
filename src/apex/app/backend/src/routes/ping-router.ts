import Router from '@koa/router';

const router = new Router({ prefix: '/api' });

const handlePing = (ctx: Router.RouterContext) => {
    ctx.body = { result: "pong" };
};

router.get('/ping', handlePing);

export default router; 