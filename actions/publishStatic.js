import shell from 'shelljs';
import prompts from 'prompts';
import fs from 'fs-extra';
import publicIp from 'public-ip';
import path from 'path';
import { fileURLToPath } from 'url';
import { fail, success, exec } from '../utils/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  title: 'Publish a static app',
  description: 'Generate a Nginx config for a static app',
  value: 'publishStatic',
  execute: async () => {

    if (!shell.which('nginx')) {
      fail('Nginx is required for this action');
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

        if (!fs.existsSync(normalizedInput)) return `This path do not exists ( ${normalizedInput} )`;

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
      console.log(nginxConfig);
      for (const [key, value] of Object.entries(app)) {
        const reg = new RegExp(`{{${key}}}`, 'g')
        nginxConfig = nginxConfig.replace(reg, value);
      }

      fs.outputFileSync(path.join('/etc/nginx/sites-available', app.domain), nginxConfig);

      if (!fs.existsSync(path.join('/etc/nginx/sites-enabled', app.domain))) {
        fs.symlinkSync(
          path.join('/etc/nginx/sites-available', app.domain),
          path.join('/etc/nginx/sites-enabled', app.domain)
        );
      }

      let { stdout, stderr, code } = exec("service nginx reload");
      if (code == 0) {
        success(`Everthing ready, make sure to add an A record to ${await publicIp.v4()}`);
      } else {
        fail(`An unexpected error occured\nTry "nginx -t" to debug or leave an issue\n`, stderr)
      }
    }
  }
}