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

        const { stdout, stderr, code } = exec('apt install nginx');

        if (code == 0) {
            success('Nginx is now installed');
        } else {
            fail('An error occured: ', stderr.trim());
        }

    }
};