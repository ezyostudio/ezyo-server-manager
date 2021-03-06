const helpers = require('../helpers');
const prompts = require('prompts');
const kleur = require('kleur');
const path = require('path');
const fs = require('fs-extra');
const publicIp = require('public-ip');

module.exports = {
  title: 'Publish a static app',
  description: 'Generate a Nginx config for a static app',
  value: 'publishStatic',
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
      }
    ]);

    if (app.path && app.domain) {
      let nginxConfig = fs.readFileSync(path.join(__dirname, `../nginx/static.template`), 'utf8');

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

      let result;
      if (!(result = await helpers.reloadNginx()).success) {
        console.log(`${kleur.red("✖")} An unexpected error occured\nTry "nginx -t" to debug or leave an issue\n`, result.message);
      } else {
        console.log(`${kleur.green("✔")} Everthing ready, make sure to add an A record to ${await publicIp.v4()}`);
      }
    }
  }
}