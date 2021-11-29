module.exports = {
  apps : [{
    name   : "EzyoServerManager-API",
    script: 'index.js',
    cwd: './api'
  },{
    name: 'EzyoServerManager-APP',
    script: './node_modules/nuxt/bin/nuxt.js',
    args: 'start',
    cwd: './app'
  }]
}
