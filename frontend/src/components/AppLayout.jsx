import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import Footer from './Footer';
import ChatOnline from './ChatOnline';

// A wrapper component that handles authentication routing
export function AppLayout({ children }) {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

        if (!user && !isAuthPage) {
            navigate('/login');
        } else if (user && isAuthPage) {
            navigate('/');
        }
    }, [user, location.pathname, navigate]);

    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    if (!user && !isAuthPage) return null; // Wait for redirect
    if (isAuthPage) return children; // Auth pages don't have header/footer

    return (
        <>
            <Header />
            <main className="page-layout">
                {children}
            </main>
            <Footer />
            <ChatOnline />
        </>
    );
}
