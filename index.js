#!/usr/bin/env node
(require('dotenv')).config();
const prompts = require('prompts');
const path = require('path');
const fs = require('fs-extra');
const kleur = require('kleur');
const tcpPortUsed = require('tcp-port-used');
const helpers = require('./helpers');
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv
if(argv.debug) {
  console.log(kleur.yellow().underline('Debugging is ON'));
}
const SERVER_ROOT = (argv.debug) ? path.join(__dirname, 'fakeServer') : '/';
prompts.override(argv);

(async () => {
   
  if(!await helpers.isNginxInstalled()) {
    await helpers.installNginx();
  }

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
  ], {
    onCancel: ()=>{
      process.exit(1);
    }
  });

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

  if(response.appType = 'nodejs') {
    await helpers.allowInUFW(response.appPort);
  }

  if(!await helpers.reloadNginx()) {
    console.log(`${kleur.red("✖")} An unexpected error occured\nTry "nginx -t" to debug or leave an issue`);
  }else{
    console.log(`${kleur.green("✔")} Everthing ready`);
  }
})();