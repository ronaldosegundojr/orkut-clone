import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try { return JSON.parse(localStorage.getItem('tukro_user')); } catch { return null; }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const validateToken = async () => {
            const token = localStorage.getItem('tukro_token');
            const storedUser = localStorage.getItem('tukro_user');
            
            if (!token || !storedUser) {
                setLoading(false);
                return;
            }

            try {
                await api.get('/auth/me');
                setUser(JSON.parse(storedUser));
            } catch (err) {
                localStorage.removeItem('tukro_token');
                localStorage.removeItem('tukro_user');
                setUser(null);
            }
            setLoading(false);
        };

        validateToken();
    }, []);

    const login = useCallback(async (email, password) => {
        const res = await api.post('/auth/login', { email, password });
        localStorage.setItem('tukro_token', res.data.token);
        localStorage.setItem('tukro_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const register = useCallback(async (fullName, username, email, password) => {
        const res = await api.post('/auth/register', { fullName, username, email, password });
        localStorage.setItem('tukro_token', res.data.token);
        localStorage.setItem('tukro_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data.user;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('tukro_token');
        localStorage.removeItem('tukro_user');
        setUser(null);
    }, []);

    const updateUser = useCallback((newUser) => {
        localStorage.setItem('tukro_user', JSON.stringify(newUser));
        setUser(newUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateUser, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
