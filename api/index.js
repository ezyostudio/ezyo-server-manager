import Koa from 'koa'
import Router from 'koa-router'
import shell from 'shelljs'
import path from 'path'
import fs from 'fs-extra'

const app = new Koa();
const router = new Router();

router.get('/projects', ctx => {
  ctx.body = shell.ls('-d', '/var/www/ezyo-server-manager/*').map((projectPath) => ({
      path: projectPath,
      name: path.basename(projectPath),
      ...(fs.readJSONSync(path.join(projectPath, '.ezyoservermanager'), { throws: false }) || {})
    }))
})

// app.use(bodyParser());

app
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 3075;
app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`)
});
