import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Hide the dev-only "N" badge that overlaps the sidebar footer logo.
  devIndicators: false,
};

export default withMDX(config);
