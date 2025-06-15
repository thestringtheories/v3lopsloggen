// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // … resten av Next.js-innstillingene dine
};

export default createNextIntlPlugin()(nextConfig);