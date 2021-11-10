import shell from 'shelljs';
import { success, fail, exec, allowInUFW } from '../utils/index.js';

export default {
    title: 'Install NGINX',
    description: 'Install NGINX if needed',
    value: 'installNginx',
    execute: async() => {
        if (shell.which('nginx')) {
            success('Nginx is already installed');
            return;
        }

        const { stdout, stderr, code } = exec('apt-get install nginx -y');

        if (code == 0) {
            success('Nginx is now installed');
        } else {
            const err = stderr.trim();
            if(err.match(/are you root\?/)) {
                return fail('You must be root to install Nginx, relaunch the tool as sudo or run "sudo apt-get install nginx"');
            }
            
            return fail('An error occurred: ', stderr.trim());
        }

        if (shell.which('ufw')) {
            success('ufw is already installed')
        } else {
            const { stdout, stderr, code } = exec('apt-get install ufw -y');

            if (code == 0) {
                success('ufw is now installed');
            } else {
                const err = stderr.trim();
                if(err.match(/are you root\?/)) {
                    return fail('You must be root to install ufw, relaunch the tool as sudo or run "sudo apt-get install ufw"');
                }
                return fail('An error occurred: ', stderr.trim());
            }
        }

        let allow = allowInUFW('Nginx Full')
        if (allow.success) {
            success("ufw is correctly configured")
        } else {
            return fail('An error occurred: ', allow.message.trim())
        }
    }
};
