/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: { unoptimized: true },
  // Inlined at build time so src/content/site.js computes the same experience
  // duration in the prerendered HTML and in the client bundle.
  env: { BUILD_DATE: new Date().toISOString() },
};

export default nextConfig;
