import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Friends() {
    const { user } = useAuth();
    const [tab, setTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fRes, rRes] = await Promise.all([
                api.get(`/friends/${user.id}`),
                api.get('/friends/requests/pending')
            ]);
            setFriends(fRes.data);
            setRequests(rRes.data);
        } catch (e) {
            console.error('Error load friends', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleRequest = async (id, status) => {
        try {
            await api.put(`/friends/${id}`, { status });
            loadData();
        } catch (e) { alert('Erro'); }
    };

    const handleRemove = async (friendId) => {
        if (!confirm('Remover amigo?')) return;
        try {
            await api.delete(`/friends/${friendId}`);
            loadData();
        } catch (e) { alert('Erro'); }
    };

    if (loading) return <div className="loading">Carregando amigos...</div>;

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', gap: '15px' }}>
                <div style={{ cursor: 'pointer', opacity: tab === 'friends' ? 1 : 0.6 }} onClick={() => setTab('friends')}>
                    Meus Amigos ({friends.length})
                </div>
                <div style={{ cursor: 'pointer', opacity: tab === 'requests' ? 1 : 0.6 }} onClick={() => setTab('requests')}>
                    Solicitações ({requests.length})
                </div>
            </div>

            <div className="card-body">
                {tab === 'friends' && (
                    <div>
                        <div className="user-grid">
                            {friends.map(f => (
                                <div key={f.id} className="user-card-mini">
                                    <Link to={`/profile/${f.id}`}>
                                        <img src={f.avatar} alt={f.username} className="avatar avatar-md" />
                                        <div className="name">{f.username}</div>
                                    </Link>
                                    <button className="btn btn-gray btn-sm" style={{ marginTop: '8px' }} onClick={() => handleRemove(f.id)}>Remover</button>
                                </div>
                            ))}
                            {friends.length === 0 && <div className="empty-state">Você ainda não tem amigos no Tukro.</div>}
                        </div>
                    </div>
                )}

                {tab === 'requests' && (
                    <div>
                        {requests.map(r => (
                            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px dotted #ccc' }}>
                                <Link to={`/profile/${r.user_id}`}>
                                    <img src={r.avatar} alt={r.username} className="avatar avatar-lg" />
                                </Link>
                                <div style={{ flex: 1 }}>
                                    <Link to={`/profile/${r.user_id}`} style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.username}</Link>
                                    <div className="humor-text" style={{ marginTop: '4px' }}>{r.humor}</div>
                                    <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                                        Solicitado em {new Date(r.created_at).toLocaleDateString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button className="btn btn-pink" onClick={() => handleRequest(r.id, 'accepted')}>Aceitar</button>
                                    <button className="btn btn-gray" onClick={() => handleRequest(r.id, 'rejected')}>Recusar</button>
                                </div>
                            </div>
                        ))}
                        {requests.length === 0 && <div className="empty-state">Nenhuma solicitação pendente.</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
