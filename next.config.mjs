import path from 'path';
import { config } from 'process';

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,  // Keep existing aliases
      'handlebars': path.resolve(process.cwd(), 'node_modules', 'handlebars', 'dist', 'handlebars.js'),
    };
    return config
  }
}; 

export default nextConfig;
