const helpers = require('../helpers');
const kleur = require('kleur');

module.exports = {
  title: 'Install Nginx',
  description: 'Check if Nginx is present on system and install it if it is not the case',
  value: 'installNginx',
  execute: async () => {
    if (!await helpers.isNginxInstalled()) {
      let result = await helpers.installNginx()
      if (result.success) {
        console.log(helpers.SUCCEEDED_ICON, 'Nginx is installed');
        return;
      }
      console.log(helpers.FAILED_ICON, 'Something went wrong', result.message);
      return;
    }
    console.log(helpers.SUCCEEDED_ICON, 'Nginx is already installed');
    return;
  }
}