import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // 프로덕션 빌드 시 ESLint 검사 건너뛰기 (개발 중에는 IDE에서 확인)
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
