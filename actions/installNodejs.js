import shell from 'shelljs';
import { success, fail, exec } from '../utils/index.js';

export default {
    title: 'Install NodeJS',
    description: 'Install NodeJS if not present on the system',
    value: 'installNodeJs',
    execute: async() => {

        if (shell.which('node')) {
            success('NodeJS is already installed');
            return;
        }

        const { stderr, code } = exec('apt-get install node');

        if (code == 0) {
            success('NodeJS is now installed');
        } else {
            const err = stderr.trim();
            if (err.match(/are you root\?/)) {
                return fail('You must be root to install NodeJS, relaunch the tool as sudo or run "sudo apt-get install node"');
            }

            return fail('An error occured: ', stderr.trim());
        }

    }
};
