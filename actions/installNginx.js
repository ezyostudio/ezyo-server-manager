import shell from 'shelljs';
import { success, fail, exec, allowInUFW, enableUFW} from '../utils/index.js';

export default {
    title: 'Install NGINX',
    description: 'Install NGINX if not present on the system',
    value: 'installNginx',
    execute: async() => {
        if (shell.which('nginx')) {
            success('Nginx is already installed');
        } else {
            const { stderr, code } = exec('apt-get install nginx -y');
            if (code == 0) {
                success('Nginx is now installed');
            } else {
                const err = stderr.trim();
                if(err.match(/are you root\?/)) {
                    return fail('You must be root to install Nginx, relaunch the tool as sudo or run "sudo apt-get install nginx"');
                }
                return fail('An error occurred: ', stderr.trim());
            }
        }

        if (shell.which('ufw')) {
            success('UFW is already installed');
        } else {
            const { stderr, code } = exec('apt-get install ufw -y');

            if (code == 0) {
                success('UFW is now installed');
            } else {
                const err = stderr.trim();
                if(err.match(/are you root\?/)) {
                    return fail('You must be root to install UFW, relaunch the tool as sudo or run "sudo apt-get install ufw"');
                }
                return fail('An error occurred: ', stderr.trim());
            }
        }

        let enable = enableUFW();

        if (enable.code === 0) {
            success("UFW is enabled");
        } else {
            return fail('An error occurred: ', enable.stderr.trim());
        }

        let allow = allowInUFW('Nginx Full');
        if (allow.code === 0) {
            success("Nginx added to UFW");
        } else {
            return fail('An error occurred: ', allow.stderr.trim());
        }
    }
};
