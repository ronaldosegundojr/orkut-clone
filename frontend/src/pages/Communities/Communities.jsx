import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Communities() {
    const { user } = useAuth();
    const { username } = useParams();
    const navigate = useNavigate();
    const [communities, setCommunities] = useState([]);
    const [myCommunities, setMyCommunities] = useState([]);
    const [q, setQ] = useState('');
    const [tab, setTab] = useState(username ? 'mine' : 'all');
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newComm, setNewComm] = useState({ name: '', description: '', category: 'Geral' });

    const loadData = async () => {
        setLoading(true);
        try {
            const [allRes, mineRes] = await Promise.all([
                api.get(`/communities?q=${q}`),
                api.get(username ? `/communities/user/${encodeURIComponent(username)}` : '/communities/mine')
            ]);
            setCommunities(allRes.data);
            setMyCommunities(mineRes.data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, [q]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/communities', newComm);
            setShowCreate(false);
            setNewComm({ name: '', description: '', category: 'Geral' });
            navigate(`/communities/${data.id}`);
        } catch (e) { alert('Erro ao criar comunidade'); }
    };

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                    <span style={{ cursor: 'pointer', opacity: tab === 'all' ? 1 : 0.6 }} onClick={() => setTab('all')}>Explorar</span>
                    <span style={{ cursor: 'pointer', opacity: tab === 'mine' ? 1 : 0.6 }} onClick={() => setTab('mine')}>
                        {username && username !== user.username ? `Comunidades de ${username}` : 'Minhas Comunidades'} ({myCommunities.length})
                    </span>
                </div>
                <button className="btn btn-outline btn-sm" style={{ background: 'white', color: 'var(--pink)', border: 'none' }} onClick={() => setShowCreate(!showCreate)}>
                    + Criar Comunidade
                </button>
            </div>

            <div className="card-body">

                {showCreate && (
                    <form style={{ marginBottom: '20px', padding: '15px', background: 'var(--gray-light)', borderRadius: '8px' }} onSubmit={handleCreate}>
                        <h4 style={{ marginBottom: '10px' }}>Nova Comunidade</h4>
                        <input type="text" placeholder="Nome da comunidade" value={newComm.name} onChange={e => setNewComm({ ...newComm, name: e.target.value })} style={{ marginBottom: '10px' }} required />
                        <select value={newComm.category} onChange={e => setNewComm({ ...newComm, category: e.target.value })} style={{ marginBottom: '10px' }}>
                            <option>Geral</option>
                            <option>Tecnologia</option>
                            <option>Música</option>
                            <option>Games</option>
                            <option>Esportes</option>
                            <option>Filmes e TV</option>
                        </select>
                        <textarea placeholder="Descrição" value={newComm.description} onChange={e => setNewComm({ ...newComm, description: e.target.value })} style={{ marginBottom: '10px' }} />
                        <button type="submit" className="btn btn-pink">Criar</button>
                        <button type="button" className="btn btn-gray" style={{ marginLeft: '10px' }} onClick={() => setShowCreate(false)}>Cancelar</button>
                    </form>
                )}

                {tab === 'all' && (
                    <>
                        <input
                            type="text"
                            placeholder="Buscar comunidades..."
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            style={{ marginBottom: '20px' }}
                        />

                        {loading ? <div className="loading">Buscando...</div> : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {communities.map(c => (
                                    <Link key={c.id} to={`/communities/${c.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                        <div className="community-card">
                                            <img src={c.image} alt={c.name} />
                                            <div className="community-info">
                                                <div className="community-name" style={{ color: '#1e4078' }}>{c.name}</div>
                                                <div className="community-desc">{c.description}</div>
                                                <div className="community-meta" style={{ color: '#6695b3' }}>{c.member_count} membros • Categoria: {c.category}</div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                                {communities.length === 0 && <div className="empty-state">Nenhuma comunidade encontrada.</div>}
                            </div>
                        )}
                    </>
                )}

                {tab === 'mine' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {myCommunities.map(c => (
                            <Link key={c.id} to={`/communities/${c.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                                <div className="community-card">
                                    <img src={c.image} alt={c.name} />
                                    <div className="community-info">
                                        <div className="community-name" style={{ color: '#1e4078' }}>{c.name}</div>
                                        <div className="community-desc">{c.description}</div>
                                        <div className="community-meta" style={{ color: '#6695b3' }}>{c.member_count} membros {c.owner_id === user.id ? '(Você é dono)' : ''}</div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                        {myCommunities.length === 0 && <div className="empty-state">Você ainda não participa de nenhuma comunidade.</div>}
                    </div>
                )}

            </div>
        </div>
    );
}
