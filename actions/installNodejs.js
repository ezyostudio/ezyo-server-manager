import shell from 'shelljs';
import { success, fail, exec } from '../utils/index.js';

export default {
    title: 'Install Node.Js',
    description: 'Install Node.Js if needed',
    value: 'installNodeJs',
    execute: async() => {

        if (shell.which('node')) {
            success('Node.Js is already installed');
            return;
        }

        const { stdout, stderr, code } = exec('apt-get install node');

        if (code == 0) {
            success('Node.Js is now installed');
        } else {
            const err = stderr.trim();
            if (err.match(/are you root\?/)) {
                return fail('You must be root to install Node.Js, relaunch the tool as sudo or run "sudo apt-get install node"');
            }

            return fail('An error occured: ', stderr.trim());
        }

    }
};