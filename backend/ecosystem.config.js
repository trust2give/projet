module.exports = {
  apps: [
    {
      name: 'hardhat-node',
      script: 'npx hardhat node --hostname 0.0.0.0',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
    },
  ],
};

