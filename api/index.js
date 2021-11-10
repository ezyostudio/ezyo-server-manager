import Koa from 'koa'
import Router from 'koa-router'
import shell from 'shelljs'
import path from 'path'
import fs from 'fs-extra'
import bodyParser from 'koa-bodyparser'
import HttpError from 'http-errors';
import cors from '@koa/cors';

const app = new Koa();
const router = new Router();

const gitUrlExp = new RegExp('^((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?');
const projectDir = '/var/www/ezyo-server-manager/';

const defaultMeta = {
  type: 'unknown',
  repository: "",
  createdDate: Date.now(),
}

router
  .get('/projects', ctx => {
    ctx.body = shell.ls('-d', `${projectDir}*`).map((projectPath) => ({
        ...defaultMeta,
        path: projectPath,
        name: path.basename(projectPath),
        ...(fs.readJSONSync(path.join(projectPath, '.ezyoservermanager'), { throws: false }) || {})
      }))
  })
  .post('/projects', ctx => {
    const { repository } = ctx.request.body;

    console.log(gitUrlExp, repository, gitUrlExp.test(repository));
    if(!gitUrlExp.test(repository)) {
      ctx.body = HttpError(400, '"repository" is not a valid repo url');
      return;
    }
  
    const urlSegments = new URL(repository);
    const projectName = path.basename(urlSegments.pathname).replace('.git', '');

    console.log(projectName);

    const clone = shell.exec(`git clone "${repository.replace('"', '\"')}" "${projectName}"`, { silent: true, cwd: projectDir});
    console.log(clone);

    if(clone.code !== 0) {
      ctx.body = HttpError(500, clone.stderr.trim());
      return;
    }

    const meta = {
      ...defaultMeta,
      repository,
    }

    fs.writeJSONSync(path.join(projectDir, projectName, '.ezyoservermanager'), meta);

    ctx.body = {
      path: path.join(projectDir, projectName),
      name: projectName,
      ...meta,
    };
  });

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 3075;
app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});
