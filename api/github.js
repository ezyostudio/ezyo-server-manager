import Koa from 'koa'
import localtunnel from 'localtunnel';
import bodyParser from 'koa-bodyparser';
import { gitPull } from '../actions/gitPull.js';
import shell from 'shelljs';
import crypto from 'crypto';
import * as utils from './utils.js';
import path from 'path';
import 'dotenv/config';

if(!process.env.WEBHOOK_DOMAIN) {
  console.warn('Missing "WEBHOOK_DOMAIN" in your .env file. Your tunnel will get a different url each time which iss a problem. Please set a one or use the following one: ', crypto.randomBytes(25).toString('hex'));
  process.exit(1);
}

if(!process.env.GITHUB_WEBHOOK_SECRET) {
  console.warn('Missing "GITHUB_WEBHOOK_SECRET" in your .env file. Please set a one or use the following one: ', crypto.randomBytes(25).toString('hex'));
  process.exit(1);
}

(async () => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const tunnel = await localtunnel({
        port: 8003,
        subdomain: process.env.WEBHOOK_DOMAIN
    });

    if(new URL(tunnel.url).host.split('.').shift() !== process.env.WEBHOOK_DOMAIN) {
      console.warn('Your chosen domain is not available');
      process.exit(1);
    }

    console.log('Webhook tunnel url:', tunnel.url);

    tunnel.on('close', () => {
        console.log("closing tunnel")
    });

})();

const app = new Koa();

app.use(bodyParser());

app.use(async ctx => {
  const event = ctx.request.headers['x-github-event'];
  const signature256 = ctx.request.headers['x-hub-signature-256'];
  const payload = ctx.request.body;

  if(event !== 'push') {
    ctx.status = 400;
    return
  }  

  const sig = Buffer.from(signature256 || '', 'utf8')
  const hmac = crypto.createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
  const digest = Buffer.from('sha256' + '=' + hmac.update(ctx.request.rawBody).digest('hex'), 'utf8')
  if (sig.length !== digest.length || !crypto.timingSafeEqual(digest, sig)) {
    ctx.status = 400;
    return
  }

  const webhook = {
      branch: payload.ref.slice(11),
      repository_name: payload.repository.name,
      repository_urls: [
        payload.repository.git_url,
        payload.repository.ssh_url,
        payload.repository.clone_url,
        payload.repository.svn_url,
      ],
      commits: payload.commits.map((commit) => commit.message)
  }

  let meta;

  try {
    meta = JSON.parse(shell.cat(utils.getMetaFilePath(webhook.repository_name)));   
  } catch (error) {
    if(error.message.startsWith('cat: no such file or directory')) {
      ctx.status = 500;
      ctx.body = { 
        error: {
          message: "The repository do not exist on the server"
        } 
      };
      return;
    }

    ctx.status = 500;
    ctx.body = { error };
    return;
  }

  if(!webhook.repository_urls.includes(meta.repository)) {
    ctx.status = 400;
    ctx.body = {
      error: {
        message: "The repository url does not match"
      }
    }
    return;
  }

  console.log(meta);

  const branch = meta.webhook?.branch || 'main';

  if(branch !== webhook.branch) {
    ctx.status = 400;
    ctx.body = {
      error: {
        message: "The branch does not match"
      }
    }
    return;
  }

  shell.cd(path.dirname(utils.getMetaFilePath(webhook.repository_name)));

  const gitPull = shell.exec('git pull', { silent: true })
  console.log(gitPull);

  if(gitPull.code === 0) {
    ctx.status = 204;
    return;
  }

  ctx.status= 500;
  ctx.body = { error: {
    code: gitPull.code,
    message: gitPull.stderr,
    stdout: gitPull.stdout
  }};
});

app.listen(8003);
