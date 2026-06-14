'use client'
import { dynamic } from 'next/dynamic';
import { useSession } from "next-auth/react";

const AdminDashboard = dynamic(() => import('sub-components/dashboard/AdminDashboard'), {
    loading: () => <div className="text-center mt-5">Loading dashboard...</div>,
    ssr: false
});

const DoctorDashboard = dynamic(() => import('sub-components/dashboard/DoctorDashboard'), {
    loading: () => <div className="text-center mt-5">Loading dashboard...</div>,
    ssr: false
});

const NurseDashboard = dynamic(() => import('sub-components/dashboard/NurseDashboard'), {
    loading: () => <div className="text-center mt-5">Loading dashboard...</div>,
    ssr: false
});

const Home = () => {
    const { data: session, status } = useSession();

    if (status === "loading") {
        return (
            <div className="text-center mt-5">
                Loading dashboard...
            </div>
        );
    }

    const role = session?.user?.role;

    if (!role) {
        return (
            <div className="text-center mt-5">
                <p>Unable to determine user role. Please log in again.</p>
            </div>
        );
    }

    switch (role) {
        case 'ADMIN':
            return <AdminDashboard />;
        case 'DOCTOR':
            return <DoctorDashboard />;
        case 'NURSE':
            return <NurseDashboard />;
        default:
            return (
                <div className="text-center mt-5">
                    <p>Unknown role: {role}. Please contact support.</p>
                </div>
            );
    }
}

export default Home;