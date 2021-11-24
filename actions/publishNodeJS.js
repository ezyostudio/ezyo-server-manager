import {fail,success,exec, allowInUFW} from "../utils/index.js";
import prompts from 'prompts';
import path from 'path';
import fs from 'fs-extra';
import publicIp from 'public-ip';
import tcpPortUsed from 'tcp-port-used';
import shell from "shelljs";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    title: 'Publish a NodeJS app',
    description: 'Generate a Nginx proxy, a PM2 process and allow port for a Nodejs app',
    value: 'publishNodeJS',
    execute: async () => {
        if (!shell.which('nginx')) {
            return fail('Nginx is required for this action');
        }

        const app = await prompts([{
            type: 'text',
            name: 'path',
            message: 'Where is located the app',
            validate: (input) => {

                const normalizedInput = path.normalize(input);
                if (!path.isAbsolute(normalizedInput)) return "The path should be absolute";
                if (!fs.existsSync(normalizedInput)) return `This path do not exists ( ${normalizedInput} )`;
                return true;

            }
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

            allowInUFW(app.port)

            let { stdout, stderr, code } = exec("service nginx reload");
            if (code == 0) {
                success(`Everthing ready, make sure to add an A record to ${await publicIp.v4()}`);
            } else {
                fail(`An unexpected error occured\nTry "nginx -t" to debug or leave an issue\n`, stderr)
            }
        }
    }
}