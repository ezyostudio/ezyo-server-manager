#!/usr/bin/env node
(require('dotenv')).config();
const prompts = require('prompts');
const path = require('path');
const fs = require('fs-extra');
const tcpPortUsed = require('tcp-port-used');

const SERVER_ROOT = process.env.SERVER_ROOT || '/';
prompts.override(require('yargs').argv);

(async () => {
   
  const response = await prompts([
    {
      type: 'select',
      name: 'appType',
      message: 'Pick an app type',
      choices: [
        { title: 'Static', description: 'Static HTML, CSS, JS app. No executable or compilation', value: 'static' },
        { title: 'NodeJS', description: 'NodeJS Server', value: 'nodejs' },
      ],
      initial: 1
    },
    {
      type: 'text',
      name: 'appPath',
      message: 'Where is located the app',
      initial: SERVER_ROOT,
      validate: (input) => {
        const normalizedInput = path.normalize(input);
    
        if(!path.isAbsolute(normalizedInput)) return "The path should be absolute";
    
        if (!fs.existsSync(normalizedInput)) return "This path do not exists ("+normalizedInput+")";
    
        return true;
      },
    },
    {
      type: 'text',
      name: 'appDomain',
      message: 'What is the app domain',
    },
    {
      type: (_, values) => values.appType=='nodejs'?'number':null,
      name: 'appPort',
      message: 'What is the app port',
      initial: 3000,
      validate: async (input) => {
        if(await tcpPortUsed.check(input)) return 'Port already in use';
        return true;
      }
    }
  ]);

  let nginxConfig =  fs.readFileSync(path.join(__dirname, `nginx/${response.appType}.template`), 'utf8');

  for (const [key, value] of Object.entries(response)) {
    nginxConfig = nginxConfig.replaceAll(`{{${key}}}`, value);
  }


  fs.outputFileSync(path.join(SERVER_ROOT,'etc/nginx/sites-available', response.appDomain), nginxConfig);

  if(!fs.existsSync(path.join(SERVER_ROOT,'etc/nginx/sites-enabled', response.appDomain))) {
    fs.symlinkSync(
      path.join(SERVER_ROOT,'etc/nginx/sites-available', response.appDomain),
      path.join(SERVER_ROOT,'etc/nginx/sites-enabled', response.appDomain)
    );
  } 


  console.log(`✔ Everthing ready,\nrun "nginx -t" to check if no error has been made\nand then run "service nginx reload" to apply the change`)

})();