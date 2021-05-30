const util = require('util');
const exec = util.promisify(require('child_process').exec);
const kleur = require('kleur');

const FAILED = {
  success: false,
  message: '(No Error Message)'
};
const FAILED_ICON = kleur.red("✖");


const SUCCEEDED = {
  success: false,
  message: ''
};
const SUCCEEDED_ICON = kleur.green("✔");
const aptUpdate = async () => {
  try {
    const { stdout } = await exec('apt update');
    return {
      ...SUCCEEDED,
      message: stdout,
    };
  } catch (error) {
    return {
      ...FAILED,
      message: error.stderr,
    };
  }
}

const isNginxInstalled = async () => {
  try {
    const { stdout } = await exec('which nginx');
    if(stdout) return true;
    return false;
  } catch (error) {
    return false
  } 
}

const isUFWInstalled = async () => {
  try {
    const { stdout } = await exec('which ufw');
    if(stdout) return true;
    return false;
  } catch (error) {
    return false
  } 
}

const installNginx = async () => {
  let result;
  if(!(result = await aptUpdate()).success) return result;
  try {
    const { stdout, stderr } = await exec('apt install nginx');

    await allowInUFW('Nginx Full');
    return {
      ...SUCCEEDED,
      message: stdout,
    };
  } catch (error) {
    return {
      ...FAILED,
      message: error.stderr,
    };
  }
}

const allowInUFW = async (name) => {
  if(!await isUFWInstalled()) return FAILED;

  try {
    const { stdout, stderr } = await exec('ufw allow "${name}"');
    if(stderr) return false;
    return {
      ...SUCCEEDED,
      message: stdout,
    };
  } catch (error) {
    return {
      ...FAILED,
      message: error.stderr,
    };
  }
}

const checkNginxConfig = async () => {
  try {
    const { stderr } = await exec('nginx -t');
    const lines = stderr.trim().replace(/(\r\n|\r|\n)/g, '\n').split("\n");
    if(lines[0].endsWith('ok') && lines[1].endsWith('successful')) return SUCCEEDED;
    return {
      ...FAILED,
      message: stderr,
    };
  } catch (error) {
    return {
      ...FAILED,
      message: error.stderr,
    };
  } 
}

const reloadNginx = async (name) => {
  if(!await checkNginxConfig()) return false;
  try {
    const { stdout, stderr } = await exec('service nginx reload');
    if(stderr) return {
      ...FAILED,
      message: stderr,
    };
    return SUCCEEDED;
  } catch (error) {
    return {
      ...FAILED,
      message: error.stderr,
    };;
  }
}

module.exports = {
  FAILED_ICON,
  SUCCEEDED_ICON,
  isNginxInstalled,
  aptUpdate,
  installNginx,
  allowInUFW,
  checkNginxConfig,
  reloadNginx
}