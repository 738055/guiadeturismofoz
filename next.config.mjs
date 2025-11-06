/** @type {import('next').NextConfig} */
const nextConfig = {

  images: {
    // ADICIONE AQUI O HOSTNAME DO SEU SUPABASE STORAGE
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vfdvmozlnrdwnqksyfxo.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default nextConfig;