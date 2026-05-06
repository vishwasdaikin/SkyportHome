import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  /* Monorepo: parent has its own lockfile; trace from repo root for Vercel. */
  outputFileTracingRoot: path.join(__dirname, ".."),
};

export default nextConfig;
