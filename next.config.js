/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow Firebase Admin SDK to work in API routes
  serverExternalPackages: ['firebase-admin'],
};

module.exports = nextConfig;
