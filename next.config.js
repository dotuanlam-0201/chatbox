/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack5: true,
    webpack: config => {
      config.resolve.fallback = {
        tls: false,
        net: false,
      };
  
      return config;
    },
}

module.exports = nextConfig
