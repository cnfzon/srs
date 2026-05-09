/** @type {import('next').NextConfig} */
const nextConfig = {
  // 只需要保留這個，讓 Next.js 幫忙轉譯 3D 語法即可
  transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
};

module.exports = nextConfig;