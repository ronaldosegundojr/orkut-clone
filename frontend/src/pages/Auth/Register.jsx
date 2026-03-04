import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '', username: '', email: '', password: '',
        secondaryEmail: '', birthDate: '', gender: '', socialNetworks: '',
        city: '', state: '', country: 'Brasil',
        preferences: {
            movies: false, series: false, music: false, concerts: false,
            travels: false, work: false, reading: false, physical_activities: false,
            instruments: false, sleep: false, eat: false, other: false
        }
    });
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [secEmailError, setSecEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState('');
    const [countriesList, setCountriesList] = useState([]);
    const [statesList, setStatesList] = useState([]);
    const [citiesList, setCitiesList] = useState([]);

    useEffect(() => {
        fetch('https://servicodados.ibge.gov.br/api/v1/localidades/paises?orderBy=nome')
            .then(res => res.json())
            .then(data => setCountriesList(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (formData.country === 'Brasil') {
            fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
                .then(res => res.json())
                .then(data => setStatesList(data))
                .catch(err => console.error(err));
        } else {
            setStatesList([]);
            setCitiesList([]);
        }
    }, [formData.country]);

    useEffect(() => {
        if (formData.state && formData.country === 'Brasil') {
            const st = statesList.find(s => s.nome === formData.state || s.sigla === formData.state);
            if (st) {
                fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${st.id}/municipios?orderBy=nome`)
                    .then(res => res.json())
                    .then(data => setCitiesList(data))
                    .catch(err => console.error(err));
            }
        }
    }, [formData.state, statesList, formData.country]);

    const handlePasswordChange = (e) => {
        const pwd = e.target.value;
        setFormData({ ...formData, password: pwd });
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-Z]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

        if (pwd.length === 0) setPasswordStrength('');
        else if (score < 2) setPasswordStrength('Fraca');
        else if (score < 4) setPasswordStrength('Média');
        else setPasswordStrength('Forte');
    };

    const handlePrefChange = (e) => {
        setFormData({
            ...formData,
            preferences: { ...formData.preferences, [e.target.name]: e.target.checked }
        });
    };

    const isEmailValid = (email) => {
        if (!email) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleEmailBlur = (e) => {
        const val = e.target.value;
        if (val && !isEmailValid(val)) {
            setEmailError('E-mail inválido. Verifique o formato digitado.');
        } else if (val && formData.secondaryEmail && val === formData.secondaryEmail) {
            setEmailError('Os e-mails principal e secundário não podem ser iguais.');
            setSecEmailError('Os e-mails principal e secundário não podem ser iguais.');
        } else {
            setEmailError('');
            if (secEmailError === 'Os e-mails principal e secundário não podem ser iguais.') {
                setSecEmailError('');
            }
        }
    };

    const handleSecEmailBlur = (e) => {
        const val = e.target.value;
        if (val && !isEmailValid(val)) {
            setSecEmailError('E-mail secundário inválido. Verifique o formato digitado.');
        } else if (val && formData.email && val === formData.email) {
            setSecEmailError('O e-mail secundário não pode ser igual ao e-mail principal.');
        } else {
            setSecEmailError('');
            if (emailError === 'Os e-mails principal e secundário não podem ser iguais.') {
                setEmailError('');
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isEmailValid(formData.email) || !formData.email) {
            return setError('O e-mail principal digitado não é válido.');
        }
        if (!isEmailValid(formData.secondaryEmail) || !formData.secondaryEmail) {
            return setError('O e-mail secundário é obrigatório e precisa ser válido.');
        }
        if (formData.email === formData.secondaryEmail) {
            return setError('O e-mail secundário não pode ser igual ao e-mail principal.');
        }
        if (passwordStrength === 'Fraca' || passwordStrength === '') {
            return setError('A senha deve ser média ou forte. Utilize letras, números ou símbolos.');
        }

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
                            <label>Nome Completo *</label>
                            <input type="text" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Nome de usuário *</label>
                            <input type="text" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="ex: primeironome.segundonome" required />
                        </div>
                        <div className="form-group">
                            <label>E-mail *</label>
                            <input type="email" value={formData.email} onChange={e => { setFormData({ ...formData, email: e.target.value }); setEmailError(''); }} onBlur={handleEmailBlur} required />
                            {emailError && <div style={{ color: 'red', fontSize: '11px', marginTop: '2px' }}>{emailError}</div>}
                        </div>
                        <div className="form-group">
                            <label>E-mail Secundário *</label>
                            <input type="email" value={formData.secondaryEmail} onChange={e => { setFormData({ ...formData, secondaryEmail: e.target.value }); setSecEmailError(''); }} onBlur={handleSecEmailBlur} required />
                            {secEmailError && <div style={{ color: 'red', fontSize: '11px', marginTop: '2px' }}>{secEmailError}</div>}
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Senha *</label>
                            <input type="password" value={formData.password} onChange={handlePasswordChange} required minLength="6" />
                            {passwordStrength && (
                                <div style={{ fontSize: '11px', marginTop: '4px', color: passwordStrength === 'Fraca' ? 'red' : passwordStrength === 'Média' ? 'orange' : 'green' }}>
                                    Força da senha: {passwordStrength}
                                </div>
                            )}
                        </div>
                        <div className="form-group">
                            <label>Data de Nascimento *</label>
                            <input type="date" value={formData.birthDate} onChange={e => setFormData({ ...formData, birthDate: e.target.value })} required />
                        </div>
                        <div className="form-group">
                            <label>Sexo *</label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} required style={{ width: '100%', padding: '6px' }}>
                                <option value="">Selecione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Feminino">Feminino</option>
                                <option value="Prefiro não dizer">Prefiro não dizer</option>
                                <option value="Outro">Outro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>País *</label>
                            <select value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value, state: '', city: '' })} required style={{ width: '100%', padding: '6px' }}>
                                <option value="Brasil">Brasil</option>
                                {countriesList.filter(c => c.nome !== 'Brasil').map(c => <option key={c.id?.['M49'] || c.id?.['ISO-3166-1-ALPHA-2'] || c.nome} value={c.nome}>{c.nome}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Estado *</label>
                            {formData.country === 'Brasil' ? (
                                <select value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value, city: '' })} required style={{ width: '100%', padding: '6px' }}>
                                    <option value="">Selecione...</option>
                                    {statesList.map(s => <option key={s.id} value={s.nome}>{s.nome}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} required />
                            )}
                        </div>
                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                            <label>Cidade *</label>
                            {formData.country === 'Brasil' && formData.state ? (
                                <select value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required style={{ width: '100%', padding: '6px' }}>
                                    <option value="">Selecione...</option>
                                    {citiesList.map(c => <option key={c.id} value={c.nome}>{c.nome}</option>)}
                                </select>
                            ) : (
                                <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} required disabled={formData.country === 'Brasil'} placeholder={formData.country === 'Brasil' ? 'Selecione o estado primeiro' : ''} />
                            )}
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
