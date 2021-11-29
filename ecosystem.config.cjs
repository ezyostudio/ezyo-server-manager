module.exports = {
  apps : [{
    name   : "EzyoServerManager-API",
    script: './api/index.js',
  },{
    name   : "EzyoServerManager-WEBHOOK",
    script: './api/github.js',
  },{
    name: 'EzyoServerManager-APP',
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    cwd: './app'
  }]
}
