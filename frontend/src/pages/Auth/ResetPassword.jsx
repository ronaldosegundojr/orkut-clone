import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await api.post('/auth/reset-password', { token, password });
            setMessage('Senha redefinida com sucesso! Você será redirecionado para o login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao redefinir senha');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ backgroundColor: '#d4e3f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Arial, sans-serif' }}>
                <div style={{ backgroundColor: '#fff', padding: '20px', border: '1px solid #c9d7f1' }}>
                    <p style={{ color: 'red' }}>Token de recuperação inválido ou ausente.</p>
                    <Link to="/forgot-password" style={{ color: '#1155cc', textDecoration: 'underline' }}>Solicitar novo link</Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ backgroundColor: '#d4e3f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ maxWidth: '500px', width: '100%', marginTop: '50px', backgroundColor: '#fff', padding: '30px', border: '1px solid #c9d7f1' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#d12b8f', fontSize: '40px', margin: 0 }}>tukro</h1>
                </div>

                <div style={{ backgroundColor: '#eef4fa', border: '1px solid #c9d7f1', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#333' }}>Redefinir Senha</h3>

                    {message && <div style={{ color: 'green', fontSize: '12px', marginBottom: '15px', background: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>{message}</div>}
                    {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '15px', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}

                    {!message && (
                        <form onSubmit={handleSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#333' }}>Nova Senha:</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc' }}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#333' }}>Confirmar Nova Senha:</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc' }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '8px 20px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                {loading ? 'Processando...' : 'Alterar Senha'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
