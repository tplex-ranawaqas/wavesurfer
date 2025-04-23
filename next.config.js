// next.config.js
module.exports = {
  webpack(config, { isServer }) {
    if (!isServer) {
      config.module.rules.push({
        test: /\.worker\.js$/,
        use: { loader: 'worker-loader' },
      });
    }
    return config;
  },
};
