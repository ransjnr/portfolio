import type { NextConfig } from 'next';
const config: NextConfig = {transpilePackages:['@portfolio/ui','@portfolio/content'],output:'standalone'};
export default config;
