// PM2 process config
// Запуск: pm2 start deploy/ecosystem.config.cjs
// Reload: pm2 reload photoorder
// Логи:   pm2 logs photoorder

module.exports = {
  apps: [
    {
      name: 'photoorder',
      cwd: './server',
      script: 'src/index.js',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      kill_timeout: 8000,
      env: {
        NODE_ENV: 'production',
      },
      error_file: '/var/www/photoorder/logs/pm2-error.log',
      out_file: '/var/www/photoorder/logs/pm2-out.log',
      merge_logs: true,
      time: true,
    },
  ],
};
