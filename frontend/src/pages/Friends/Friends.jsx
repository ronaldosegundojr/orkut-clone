import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useParams } from 'react-router-dom';
import api from '../../api/client';
import UserCard from '../../components/UserCard';

export default function Friends() {
    const { username } = useParams();
    const { user } = useAuth();
    const targetQuery = username || user?.username;
    const [tab, setTab] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [fRes, uRes] = await Promise.all([
                api.get(`/friends/${encodeURIComponent(targetQuery)}`),
                api.get(`/users/${encodeURIComponent(targetQuery)}`)
            ]);
            setFriends(fRes.data);
            setTargetUser(uRes.data);

            if (user && targetQuery === user.username) {
                const rRes = await api.get('/friends/requests/pending');
                setRequests(rRes.data);
            }
        } catch (e) {
            console.error('Error load friends', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (targetQuery) loadData();
    }, [targetQuery]);

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

    const isMe = targetUser?.id === user.id;

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={isMe ? user : targetUser} stats={targetUser?.stats} />
            </div>

            <div className="col-center">
                <div className="card">
                    <div className="card-header" style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ cursor: 'pointer', opacity: tab === 'friends' ? 1 : 0.6 }} onClick={() => setTab('friends')}>
                            {isMe ? 'Meus Amigos' : `Amigos de ${targetUser?.username}`} ({friends.length})
                        </div>
                        {isMe && (
                            <div style={{ cursor: 'pointer', opacity: tab === 'requests' ? 1 : 0.6 }} onClick={() => setTab('requests')}>
                                Solicitações ({requests.length})
                            </div>
                        )}
                    </div>

                    <div className="card-body">
                        {tab === 'friends' && (
                            <div>
                                <div className="friends-page-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                                    {friends.map(f => (
                                        <div key={f.id} className="friend-card">
                                            <Link to={`/profile/${encodeURIComponent(f.username)}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                                <img src={f.avatar} alt={f.username} />
                                                <div className="name">{f.username}</div>
                                            </Link>
                                            {isMe && <button className="btn btn-gray btn-sm" style={{ marginTop: '8px', fontSize: '9px' }} onClick={() => handleRemove(f.id)}>Remover</button>}
                                        </div>
                                    ))}
                                    {friends.length === 0 && <div className="empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>{isMe ? 'Você ainda não tem amigos no Tukro.' : 'Este usuário ainda não tem amigos.'}</div>}
                                </div>
                            </div>
                        )}

                        {tab === 'requests' && isMe && (
                            <div>
                                {requests.map(r => (
                                    <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 0', borderBottom: '1px dotted #ccc' }}>
                                        <Link to={`/profile/${encodeURIComponent(r.username)}`}>
                                            <img src={r.avatar} alt={r.username} className="avatar avatar-lg" />
                                        </Link>
                                        <div style={{ flex: 1 }}>
                                            <Link to={`/profile/${encodeURIComponent(r.username)}`} style={{ fontWeight: 'bold', fontSize: '14px' }}>{r.username}</Link>
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
            </div>

            <div className="col-right">
                {/* Empty for now or can show suggestions */}
            </div>
        </div>
    );
}
