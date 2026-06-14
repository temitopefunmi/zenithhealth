// import theme style scss file
import Link from 'next/link';
import 'styles/theme.scss';
import AuthProvider from '@/components/auth/SessionProvider';

export const metadata = {
    title: 'Zenith Health | Clinical Admin Portal',
    description: 'Secure health-tech infrastructure managed via IaC.',
    keywords: 'HealthTech, Azure, DevOps, Terraform',
    icons: {
        icon: '/favicon.svg', // Points to the free file you just made!
    },
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body className='bg-light'>
                <AuthProvider>
                    {children}
                </AuthProvider> 

            </body>
        </html>
    )
}
