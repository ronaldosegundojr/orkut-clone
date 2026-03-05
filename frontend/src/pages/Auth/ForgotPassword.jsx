import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            await api.post('/auth/forgot-password', { email });
            setMessage('Um link de recuperação foi enviado para o seu e-mail (verifique o console do servidor em modo dev).');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao processar solicitação');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ backgroundColor: '#d4e3f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ maxWidth: '500px', width: '100%', marginTop: '50px', backgroundColor: '#fff', padding: '30px', border: '1px solid #c9d7f1' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ color: '#d12b8f', fontSize: '40px', margin: 0 }}>tukro</h1>
                </div>

                <div style={{ backgroundColor: '#eef4fa', border: '1px solid #c9d7f1', padding: '20px' }}>
                    <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#333' }}>Recuperar Senha</h3>

                    {message && <div style={{ color: 'green', fontSize: '12px', marginBottom: '15px', background: '#e8f5e9', padding: '10px', borderRadius: '4px' }}>{message}</div>}
                    {error && <div style={{ color: 'red', fontSize: '12px', marginBottom: '15px', background: '#ffebee', padding: '10px', borderRadius: '4px' }}>{error}</div>}

                    {!message && (
                        <form onSubmit={handleSubmit}>
                            <p style={{ fontSize: '12px', color: '#666', marginBottom: '15px' }}>
                                Insira o seu endereço de e-mail abaixo e enviaremos um link para você redefinir sua senha.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '15px' }}>
                                <label style={{ fontSize: '12px', color: '#333' }}>E-mail:</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    style={{ padding: '8px', border: '1px solid #ccc' }}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '8px 20px', cursor: 'pointer', fontSize: '12px' }}
                            >
                                {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                            </button>
                        </form>
                    )}

                    <div style={{ marginTop: '20px', textAlign: 'center' }}>
                        <Link to="/login" style={{ color: '#1155cc', fontSize: '12px', textDecoration: 'underline' }}>Voltar para o Login</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
