module.exports = (config, options) => {
  if (options.configuration === 'production') {
    config.plugins.push(
      new (require('webpack').DefinePlugin)({
        'process.env': JSON.stringify({
          SUPABASE_URL: process.env.SUPABASE_URL,
          SUPABASE_KEY: process.env.SUPABASE_KEY
        })
      })
    );
  }
  return config;
};