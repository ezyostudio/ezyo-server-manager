#!/usr/bin/env node
(require('dotenv')).config();
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const {version} = require('./package.json');
const prompts = require('prompts');
const path = require('path');
const kleur = require('kleur');


const argv = yargs(hideBin(process.argv)).argv
if(argv.debug) {
  console.log(kleur.yellow().underline('Debugging is ON'));
}
process.env.SERVER_ROOT = (argv.debug) ? path.join(__dirname, 'fakeServer') : '/';

const helpers = require('./helpers');
const actions = require('./actions');


const chooseAction = (choices) => {
  return new Promise((resolve, reject)=>{
    prompts({
      type: 'select',
      name: 'action',
      message: 'Which action do you want to perform',
      choices,
      initial: 1,
    }, {
      onSubmit: (prompt, answer) => {
        resolve(prompt.choices.find(({value}) => value == answer));
      },
      onCancel: process.exit
    });
  })
}

(async () => {
  console.log(`================================`);
  console.log(kleur.italic().underline().bold('Ezyo Server Manager'));
  console.log(kleur.italic().dim(`v${version}`));
  console.log(`================================`);

  if(argv.action) {
    const action = actions.find(({value}) => value == argv.action);
    if(action) {
      prompts.override(argv);
      await action.execute();
      prompts.override({}) // Clear prefilled answers
    }
    
  }

  while(true) {
    console.log('\n');
    const action = await chooseAction(actions);
    if(action) {
      await action.execute();
    }
  }
})();