const util = require('util');
const exec = util.promisify(require('child_process').exec);

const aptUpdate = async () => {
  try {
    const { stdout } = await exec('apt update');
    return stdout;
  } catch (error) {
    return false
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
  if(!await aptUpdate()) return false;
  try {
    const { stdout, stderr } = await exec('apt install nginx');
    if(stderr) return false;
    await allowInUFW('Nginx Full');
    return true;
  } catch (error) {
    return false
  } 
}

const allowInUFW = async (name) => {
  if(!await isUFWInstalled()) return false;
  try {
    const { stdout, stderr } = await exec('ufw allow "${name}"');
    if(stderr) return false;
    return true;
  } catch (error) {
    return false;
  } 
}

const checkNginxConfig = async () => {
  try {
    const { stderr } = await exec('nginx -t');
    const lines = stderr.trim().replace(/(\r\n|\r|\n)/g, '\n').split("\n");
    if(lines[0].endsWith('ok') && lines[1].endsWith('successful')) return true
    return false;
  } catch (error) {
    return false
  } 
}

const reloadNginx = async (name) => {
  if(!await checkNginxConfig()) return false;
  try {
    const { stdout, stderr } = await exec('service nginx reload');
    if(stderr) return false;
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  isNginxInstalled,
  aptUpdate,
  installNginx,
  allowInUFW,
  checkNginxConfig,
  reloadNginx
}