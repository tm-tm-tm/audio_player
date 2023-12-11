/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        //   domains: ['miyerypozbkyqwjxvash.supabase.co'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'miyerypozbkyqwjxvash.supabase.co'
            },
        ],
    },
}

module.exports = nextConfig