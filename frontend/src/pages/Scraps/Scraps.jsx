import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Scraps() {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const query = new URLSearchParams(location.search);
    const targetParam = query.get('to') || user.username;

    const [scraps, setScraps] = useState([]);
    const [newScrap, setNewScrap] = useState('');
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [scrapsRes, userRes] = await Promise.all([
                    api.get(`/scraps/${targetParam}`),
                    api.get(`/users/${targetParam}`)
                ]);
                setScraps(scrapsRes.data);
                setTargetUser(userRes.data);
            } catch (e) { console.error('Error load scraps', e); }
            finally { setLoading(false); }
        };
        load();
    }, [targetParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newScrap.trim()) return;
        try {
            const res = await api.post('/scraps', { target_id: targetUser.id, text: newScrap });
            setScraps([res.data, ...scraps]);
            setNewScrap('');
        } catch (e) { alert('Erro ao enviar'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este scrap?')) return;
        try {
            await api.delete(`/scraps/${id}`);
            setScraps(scraps.filter(s => s.id !== id));
        } catch (e) { alert('Erro ao excluir'); }
    };

    if (loading) return <div className="loading">Carregando livro de recados...</div>;

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header">
                Livro de Recados {targetUser?.id === user.id ? 'de ' + user.username : `para ${targetUser?.username}`}
            </div>
            <div className="card-body">

                {targetUser && targetUser.id !== user.id && (
                    <div style={{ marginBottom: '16px', background: 'var(--pink-light)', padding: '10px', borderRadius: '4px' }}>
                        Escrevendo um recado para <strong>{targetUser.username}</strong>
                        <button className="btn btn-outline btn-sm" style={{ float: 'right' }} onClick={() => navigate('/scraps')}>Cancelar</button>
                    </div>
                )}

                {/* Input box */}
                <form onSubmit={handleSubmit} style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid var(--pink-light)' }}>
                    <textarea
                        placeholder="Deixe um recado..."
                        value={newScrap}
                        onChange={(e) => setNewScrap(e.target.value)}
                        style={{ width: '100%', height: '80px', marginBottom: '8px' }}
                    />
                    <div style={{ textAlign: 'right' }}>
                        <button type="submit" className="btn btn-pink" disabled={!newScrap.trim()}>Enviar Scrap</button>
                    </div>
                </form>

                {/* Scraps list */}
                <h3 className="section-title">Últimos Recados ({scraps.length})</h3>

                {scraps.length === 0 && <div className="empty-state">O livro de recados está vazio.</div>}

                {scraps.map(scrap => (
                    <div key={scrap.id} className="scrap-item">
                        <Link to={`/profile/${scrap.author_username}`}>
                            <img src={scrap.author_avatar} alt="Avatar" className="avatar avatar-md" />
                        </Link>
                        <div className="scrap-content">
                            <div className="scrap-meta">
                                <Link to={`/profile/${scrap.author_username}`}>{scrap.author_name}</Link> ({new Date(scrap.created_at).toLocaleString()})
                            </div>
                            <div className="scrap-text">{scrap.text}</div>
                            <div className="scrap-actions">
                                {user.id !== scrap.author_id && (
                                    <Link to={`/scraps?to=${scrap.author_username}`} className="btn btn-outline btn-sm">Responder</Link>
                                )}
                                {(user.id === targetUser?.id || user.id === scrap.author_id) && (
                                    <button onClick={() => handleDelete(scrap.id)} className="btn btn-gray btn-sm">Excluir</button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
}
