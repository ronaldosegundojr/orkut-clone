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
        <div style={{ backgroundColor: '#d4e3f8', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Arial, sans-serif' }}>
            <div style={{ display: 'flex', maxWidth: '800px', width: '100%', marginTop: '50px', backgroundColor: '#fff', padding: '15px' }}>
                <div style={{ flex: 1, paddingRight: '20px' }}>
                    <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '40px' }}>
                        <h1 style={{ color: '#d12b8f', fontSize: '60px', margin: 0, letterSpacing: '-2px', display: 'inline-block' }}>tukro</h1>
                        <span style={{ color: '#c3c3c3', fontSize: '12px', verticalAlign: 'top', marginLeft: '5px' }}>beta</span>
                    </div>
                    <div style={{ textAlign: 'center', color: '#333', fontSize: '12px', lineHeight: '1.6' }}>
                        <p style={{ margin: '5px 0' }}><strong style={{ color: '#d12b8f' }}>Conecta-se</strong> aos seus amigos e familiares usando recados e mensagens instantâneas</p>
                        <p style={{ margin: '5px 0' }}><strong style={{ color: '#d12b8f' }}>Conheça</strong> novas pessoas através de amigos de seus amigos e comunidades</p>
                        <p style={{ margin: '5px 0' }}><strong style={{ color: '#d12b8f' }}>Compartilhe</strong> seus vídeos, fotos e paixões em um só lugar</p>
                    </div>
                </div>

                <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ backgroundColor: '#eef4fa', border: '1px solid #c9d7f1', padding: '15px', paddingBottom: '25px' }}>
                        <div style={{ textAlign: 'center', fontSize: '12px', color: '#333', marginBottom: '15px' }}>Acesse o tukro com a sua conta</div>

                        {error && <div style={{ color: 'red', fontSize: '11px', marginBottom: '10px', textAlign: 'center' }}>{error}</div>}

                        <form onSubmit={handleSubmit} style={{ fontSize: '12px', color: '#333' }}>
                            <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
                                <label style={{ width: '60px', textAlign: 'right', marginRight: '10px' }}>E-mail:</label>
                                <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ flex: 1, padding: '3px', border: '1px solid #ccc' }} required />
                            </div>
                            <div style={{ display: 'flex', marginBottom: '8px', alignItems: 'center' }}>
                                <label style={{ width: '60px', textAlign: 'right', marginRight: '10px' }}>Senha:</label>
                                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ flex: 1, padding: '3px', border: '1px solid #ccc' }} required />
                            </div>
                            <div style={{ display: 'flex', marginTop: '10px' }}>
                                <div style={{ width: '60px', marginRight: '10px' }}></div>
                                <div>
                                    <label style={{ display: 'flex', alignItems: 'flex-start', fontSize: '11px', color: '#333', cursor: 'pointer' }}>
                                        <input type="checkbox" style={{ marginTop: '2px', marginRight: '5px' }} />
                                        <span>
                                            Salvar as minhas informações neste computador.<br />
                                            <span style={{ color: '#999', fontSize: '10px' }}>Não use em computadores públicos. [?]</span>
                                        </span>
                                    </label>
                                    <button type="submit" disabled={loading} style={{ background: '#f5f5f5', border: '1px solid #ccc', padding: '3px 15px', marginTop: '10px', cursor: 'pointer', fontSize: '12px', color: '#333' }}>
                                        {loading ? 'Entrando...' : 'Login'}
                                    </button>
                                </div>
                            </div>
                        </form>
                        <div style={{ textAlign: 'center', marginTop: '20px' }}>
                            <Link to="/forgot-password" style={{ color: '#1155cc', fontSize: '11px', textDecoration: 'underline' }}>esqueci a senha</Link>
                        </div>
                    </div>

                    <div style={{ backgroundColor: '#eef4fa', border: '1px solid #c9d7f1', padding: '15px', textAlign: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#333', marginBottom: '5px' }}>Ainda não é membro?</div>
                        <Link to="/register" style={{ color: '#1155cc', fontSize: '12px', fontWeight: 'bold', textDecoration: 'underline', textTransform: 'uppercase' }}>ENTRAR JÁ</Link>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: '800px', width: '100%', textAlign: 'center', marginTop: '10px', fontSize: '11px', color: '#1155cc', background: '#e4edf5', padding: '5px 0' }}>
                <span style={{ color: '#666' }}>© 2026 Tukro</span> - <a href="#" style={{ color: '#1155cc', textDecoration: 'underline' }}>Sobre o Tukro</a> - <a href="#" style={{ color: '#1155cc', textDecoration: 'underline' }}>Centro de segurança</a> - <a href="#" style={{ color: '#1155cc', textDecoration: 'underline' }}>Privacidade</a> - <a href="#" style={{ color: '#1155cc', textDecoration: 'underline' }}>Termos</a>
            </div>
        </div>
    );
}
