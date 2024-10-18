/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['hbldktkcsgpvwzquudyz.supabase.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'fal.media',
                pathname: '/files/**',
            },
        ],
    },
};

module.exports = nextConfig;