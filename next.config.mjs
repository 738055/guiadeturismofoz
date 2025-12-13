// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Adicione esta linha para desativar a otimização da Vercel e evitar o erro 402
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oghvwsixolilslpcfhhi.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;