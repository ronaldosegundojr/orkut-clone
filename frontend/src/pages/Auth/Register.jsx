import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData.username, formData.email, formData.password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao registrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <h1 style={{ color: 'var(--pink)', fontSize: '36px', letterSpacing: '-2px', margin: 0 }}>tukro</h1>
                    <p className="auth-title" style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>crie sua conta</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Nome Completo</label>
                        <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>E-mail</label>
                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                        <label>Senha</label>
                        <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength="6" />
                    </div>

                    <button type="submit" className="btn btn-pink btn-full" disabled={loading} style={{ padding: '10px', fontSize: '13px', marginTop: '10px' }}>
                        {loading ? 'Criando...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="auth-switch">
                    Já tem uma conta? <Link to="/login">Entre aqui</Link>
                </div>
            </div>
        </div>
    );
}
