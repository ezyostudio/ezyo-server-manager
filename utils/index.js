import kleur from 'kleur';
import shell from 'shelljs';

export const FAIL_ICON = kleur.red("✖");
export const SUCCESS_ICON = kleur.green("✔");

export const success = (...args) => {
    const first = args.shift();
    console.log(SUCCESS_ICON, kleur.bold().green(first), ...args);
}

export const fail = (...args) => {
    const first = args.shift();
    console.log(FAIL_ICON, kleur.bold().red(first), ...args);
}

export const exec = (command) => {
    return shell.exec(command, { silent: true });
}

export const allowInUFW = (name) => {
    let which = exec('which ufw')
    if (which.code != 0) {
        return {success: false, message: which.stderr || which.stdout};
    }
    let allow = exec(`ufw allow ${name}`)
    if (allow.code != 0) {
        return {success: false, message: which.stderr || which.stdout};
    }
    return {success: true, message: null};
}
