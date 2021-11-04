import Koa from 'koa'
import localtunnel from 'localtunnel';

(async () => {
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

app.use(async ctx => {
    console.log(ctx.req)
});

app.listen(8003, () => {
    console.log("serveur running")
});