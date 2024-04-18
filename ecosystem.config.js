module.exports = {
  apps: [
    {
      script: "index.js",
      watch: ".",
    },
    {
      script: "./app.js/",
      watch: ["./service-worker"],
    },
  ],

  deploy: {
    production: {
      // user : 'SSH_USERNAME',
      // host : 'SSH_HOSTMACHINE',
      // ref  : 'origin/master',
      repo: "https://github.com/amandeep-saxena/mckinsole-node.js.git",
      // path : 'DESTINATION_PATH',
      // 'pre-deploy-local': '',
      // 'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      // 'pre-setup': ''
    },
  },
};
