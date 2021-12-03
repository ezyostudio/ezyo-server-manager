import Koa from 'koa'
import Router from 'koa-router'
import shell from 'shelljs'
import path from 'path'
import fs from 'fs-extra'
import bodyParser from 'koa-bodyparser'
import HttpError from 'http-errors';
import cors from '@koa/cors';
import { PassThrough } from "stream";
import osUtils from 'os-utils';

const app = new Koa();
const router = new Router();

const gitUrlExp = new RegExp('^((git|ssh|http(s)?)|(git@[\w\.]+))(:(\/\/)?)([\w\.@\:/\-~]+)(\.git)(\/)?');
const projectDir = '/var/www/ezyo-server-manager/';

const getMetaFilePath = (projectName) => 
  path.isAbsolute(projectName) 
  ? path.join(projectName, '.ezyoservermanager') 
  : path.join(projectDir, projectName, '.ezyoservermanager');

const defaultMeta = {
  type: 'unknown',
  repository: "",
  createdAt: 0,
}

let SSEClient = [];

const cpuUsage = () => new Promise((resolve) => osUtils.cpuUsage(resolve));
setInterval(async () => {
  if(!SSEClient.length) return;

  const data = {
    memUsage: 1 - osUtils.freememPercentage(),
    cpuUsage: await cpuUsage(),
    uptime: osUtils.sysUptime(),
    processUptime: osUtils.processUptime(),
  }

  SSEClient.forEach(({stream}) => stream.write(`data: ${JSON.stringify(data)}\n\n`));
}, 3000);

router
  .get('/projects', ctx => {
    ctx.body = shell.ls('-d', `${projectDir}*`).map((projectPath) => ({
        ...defaultMeta,
        path: projectPath,
        name: path.basename(projectPath),
        ...(fs.readJSONSync(getMetaFilePath(projectPath), { throws: false }) || {})
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
      createdAt: Date.now(),
      repository,
    }

    fs.writeJSONSync(getMetaFilePath(projectName), meta);

    ctx.body = {
      path: path.join(projectDir, projectName),
      name: projectName,
      ...meta,
    };
  })
  .put('/projects', ctx => {
    const meta = ctx.request.body.data

    fs.writeJSONSync(getMetaFilePath(meta.name), meta);

    ctx.body = "hello"
  })
  .get('/stats', ctx => {
    ctx.request.socket.setTimeout(0);
    ctx.req.socket.setNoDelay(true);
    ctx.req.socket.setKeepAlive(true);

    ctx.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    });

    const stream = new PassThrough();

    ctx.status = 200;
    ctx.body = stream;

    const clientId = Date.now() + Math.floor(Math.random() * 100);

    console.log(`Client ${clientId} connected`);
    SSEClient.push({
      id: clientId,
      stream,
    })

    stream.on('close', () => {
      console.log(`Client ${clientId} disconnected`);
      SSEClient = SSEClient.filter(({id}) => id !== clientId);
    })
  })

app
  .use(cors())
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());

const PORT = process.env.PORT || 3075;
app.listen(PORT, () => {
    console.log(`Listen on ${PORT}`);
});
