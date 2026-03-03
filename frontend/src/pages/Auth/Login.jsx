import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Login() {
    const { login } = useAuth();
    const [email, setEmail] = useState('demo@tukro.com');
    const [password, setPassword] = useState('123456');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao fazer login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1 style={{ color: 'var(--pink)', fontSize: '36px', letterSpacing: '-2px', margin: 0 }}>tukro</h1>
                    <p className="auth-title" style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>conecta você aos seus amigos</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>E-mail (Ou use demo@tukro.com)</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Senha (123456)</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-pink btn-full" disabled={loading} style={{ padding: '10px', fontSize: '13px', marginTop: '10px' }}>
                        {loading ? 'Entrando...' : 'Entrar no Tukro'}
                    </button>
                </form>

                <div className="auth-switch">
                    Ainda não tem conta? <Link to="/register">Crie uma agora</Link>
                </div>
            </div>
        </div>
    );
}
