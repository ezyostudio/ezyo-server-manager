import Koa from 'koa'
import localtunnel from 'localtunnel';
import bodyParser from 'koa-bodyparser';
import { gitPull } from '../actions/gitPull.js';

const wait = (delay) => new Promise(resolve => setTimeout(resolve, delay));
(async () => {
    await wait(500);
    const tunnel = await localtunnel({
        port: 8003,
        subdomain: "ezyo-server-manager"
    });

    // the assigned public url for your tunnel
    // i.e. https://abcdefgjhij.localtunnel.me
    tunnel.url;
    console.log(tunnel.url)

    tunnel.on('close', () => {
        // tunnels are closed
        console.log("closing tunnel")
    });

})();

const app = new Koa();

app.use(bodyParser());

app.use(async ctx => {
    const response = ctx.request.body
    console.log("=======NEW WEBHOOK=======")

    //Deconstruct object
    const push = {
        branch: response.ref.slice(11),
        repository_name: response.repository.name,
        repository_url: response.repository.url,
        commits: response.commits.map((commit) => commit.message)
    }

    console.log(push)
    ctx.status=200

    gitPull(push)
});

app.listen(8003, () => {
    console.log("serveur running")
});