import shell from 'shelljs';

export const gitPull = (webhook) => {
    const cd = shell.cd(`/var/www/${webhook.repository_name}`)
    if (cd.code) {
        return
    }

    const puller = shell.exec('git pull')

    puller.code ? puller.stderr : puller.stdout
}
