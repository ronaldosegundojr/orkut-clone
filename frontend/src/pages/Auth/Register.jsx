import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', password: '',
        secondaryEmail: '', birthDate: '', socialNetworks: '',
        city: '', state: '', country: 'Brasil',
        preferences: {
            movies: false, series: false, music: false, concerts: false,
            travels: false, work: false, reading: false, physical_activities: false,
            instruments: false, sleep: false, eat: false, other: false
        }
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handlePrefChange = (e) => {
        setFormData({
            ...formData,
            preferences: { ...formData.preferences, [e.target.name]: e.target.checked }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(formData);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Erro ao registrar');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page" style={{ height: 'auto', minHeight: '100vh', padding: '40px 0' }}>
            <div className="auth-card" style={{ width: '500px', maxWidth: '95%' }}>
                <div className="auth-logo">
                    <h1 style={{ color: 'var(--pink)', fontSize: '36px', letterSpacing: '-2px', margin: 0 }}>tukro</h1>
                    <p className="auth-title" style={{ color: 'var(--text-light)', fontSize: '12px', marginTop: '4px' }}>crie sua conta</p>
                </div>

                {error && <div className="auth-error">{error}</div>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                        <div className="form-group">
                            <label>Nome Completo</label>
                            <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Nome de usuário</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="ex: arthur.monzelli" required />
                        </div>
                        <div className="form-group">
                            <label>E-mail</label>
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Senha</label>
                            <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength="6" />
                        </div>
                        <div className="form-group">
                            <label>E-mail Secundário</label>
                            <input type="email" value={formData.secondaryEmail} onChange={e => setFormData({ ...formData, secondaryEmail: e.target.value })} />
                        </div>
                        <div className="form-group">
                            <label>Data de Nascimento</label>
                            <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Cidade</label>
                            <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Estado</label>
                            <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>País</label>
                            <input type="text" value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} required />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '10px' }}>
                        <label>Outras Redes Sociais</label>
                        <input type="text" value={formData.socialNetworks} onChange={e => setFormData({ ...formData, socialNetworks: e.target.value })} placeholder="Twitter, Instagram..." />
                    </div>

                    <div className="form-group" style={{ marginTop: '15px' }}>
                        <label style={{ marginBottom: '8px', display: 'block' }}>Preferências (Gosto de:)</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', fontSize: '12px' }}>
                            <label><input type="checkbox" name="movies" checked={formData.preferences.movies} onChange={handlePrefChange} /> Filmes</label>
                            <label><input type="checkbox" name="series" checked={formData.preferences.series} onChange={handlePrefChange} /> Séries</label>
                            <label><input type="checkbox" name="music" checked={formData.preferences.music} onChange={handlePrefChange} /> Músicas</label>
                            <label><input type="checkbox" name="concerts" checked={formData.preferences.concerts} onChange={handlePrefChange} /> Shows</label>
                            <label><input type="checkbox" name="travels" checked={formData.preferences.travels} onChange={handlePrefChange} /> Viagens</label>
                            <label><input type="checkbox" name="work" checked={formData.preferences.work} onChange={handlePrefChange} /> Trabalho</label>
                            <label><input type="checkbox" name="reading" checked={formData.preferences.reading} onChange={handlePrefChange} /> Leitura</label>
                            <label><input type="checkbox" name="physical_activities" checked={formData.preferences.physical_activities} onChange={handlePrefChange} /> Atividades Físicas</label>
                            <label><input type="checkbox" name="instruments" checked={formData.preferences.instruments} onChange={handlePrefChange} /> Tocar Instrumentos</label>
                            <label><input type="checkbox" name="sleep" checked={formData.preferences.sleep} onChange={handlePrefChange} /> Dormir</label>
                            <label><input type="checkbox" name="eat" checked={formData.preferences.eat} onChange={handlePrefChange} /> Comer</label>
                            <label><input type="checkbox" name="other" checked={formData.preferences.other} onChange={handlePrefChange} /> Outros</label>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-pink btn-full" disabled={loading} style={{ padding: '10px', fontSize: '13px', marginTop: '15px' }}>
                        {loading ? 'Criando Conta...' : 'Criar Conta'}
                    </button>
                </form>

                <div className="auth-switch" style={{ marginTop: '20px' }}>
                    Já tem uma conta? <Link to="/login">Entre aqui</Link>
                </div>
            </div>
        </div>
    );
}
