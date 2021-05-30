const helpers = require('../helpers');
const prompts = require('prompts');
const kleur = require('kleur');
const path = require('path');
const fs = require('fs-extra');
const publicIp = require('public-ip');
const tcpPortUsed = require('tcp-port-used');

module.exports = {
  title: 'Publish a NodeJS app',
  description: 'Generate a Nginx proxy, a PM2 process and allow port for a Nodejs app',
  value: 'publishNodeJS',
  execute: async () => {
    if (!await helpers.isNginxInstalled()) {
      console.log(helpers.FAILED_ICON, 'Nginx is required for this action');
      return;
    }

    const app = await prompts([{
        type: 'text',
        name: 'path',
        message: 'Where is located the app',
        initial: process.env.SERVER_ROOT,
        validate: (input) => {
          const normalizedInput = path.normalize(input);

          if (!path.isAbsolute(normalizedInput)) return "The path should be absolute";

          if (!fs.existsSync(normalizedInput)) return "This path do not exists (" + normalizedInput + ")";

          return true;
        },
      },
      {
        type: 'text',
        name: 'domain',
        message: 'What is the app domain',
      },
      {
        type: 'number',
        name: 'port',
        message: 'What is the app port',
        validate: async (input) => {
          input = parseInt(input);
          if (Number.isNaN(input)) return 'Invalid port';
          if (await tcpPortUsed.check(input)) return 'Port already in use';
          return true;
        }
      }
    ]);

    if (app.path && app.domain && app.port) {
      let nginxConfig = fs.readFileSync(path.join(__dirname, `../nginx/nodejs.template`), 'utf8');

      for (const [key, value] of Object.entries(app)) {
        nginxConfig = nginxConfig.replaceAll(`{{${key}}}`, value);
      }

      fs.outputFileSync(path.join(process.env.SERVER_ROOT, 'etc/nginx/sites-available', app.domain), nginxConfig);

      if (!fs.existsSync(path.join(process.env.SERVER_ROOT, 'etc/nginx/sites-enabled', app.domain))) {
        fs.symlinkSync(
          path.join(process.env.SERVER_ROOT, 'etc/nginx/sites-available', app.domain),
          path.join(process.env.SERVER_ROOT, 'etc/nginx/sites-enabled', app.domain)
        );
      }

      await helpers.allowInUFW(app.port);

      let result;
      if (!(result = await helpers.reloadNginx()).success) {
        console.log(`${kleur.red("✖")} An unexpected error occured\nTry "nginx -t" to debug or leave an issue\n`, result.message);
      } else {
        console.log(`${kleur.green("✔")} Everthing ready, make sure to add an A record to ${await publicIp.v4()}`);
      }
    }
  }
}