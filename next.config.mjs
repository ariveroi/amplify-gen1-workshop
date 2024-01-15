/** @type {import('next').NextConfig} */
const nextConfig = {
    distDir: ".next",
    transpilePackages: [
      '@cloudscape-design/components',
      '@cloudscape-design/component-toolkit'
    ]
  };
   
  export default nextConfig