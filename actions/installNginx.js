import shell from 'shelljs';
import { success, fail, exec } from '../utils/index.js';

export default {
    title: 'Install NGINX',
    description: 'Install NGINX if needed',
    value: 'installNginx',
    execute: async() => {
        if (shell.which('nginx')) {
            success('Nginx is already installed');
            return;
        }

        const { stdout, stderr, code } = exec('apt-get install nginx');

        if (code == 0) {
            success('Nginx is now installed');
        } else {
            const err = stderr.trim();
            if(err.match(/are you root\?/)) {
                return fail('You must be root to install Nginx, relaunch the tool as sudo or run "sudo apt-get install nginx"');
            }
            
            return fail('An error occured: ', stderr.trim());
        }
    }
};
