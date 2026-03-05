import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';
import UserCard from '../../components/UserCard';
import { useAuth } from '../../context/AuthContext';

export default function CommunityMembers() {
    const { id } = useParams();
    const { user } = useAuth();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [community, setCommunity] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [commRes, membersRes] = await Promise.all([
                    api.get(`/communities/${id}`),
                    api.get(`/communities/${id}/members`)
                ]);
                setCommunity(commRes.data);
                setMembers(membersRes.data);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        };
        load();
    }, [id]);

    if (loading) return <div className="three-col"><div className="col-center"><div className="loading">Carregando membros...</div></div></div>;

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={user} stats={user?.stats} />
            </div>

            <div className="col-center">
                <div style={{ marginBottom: '10px' }}>
                    <Link to={`/communities/${id}`} style={{ color: '#1155cc', fontSize: '12px', textDecoration: 'none' }}>« Voltar para {community?.name}</Link>
                </div>

                <div className="card" style={{ borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ background: 'white', color: '#000', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #f0f0f0' }}>
                        membros ({members.length})
                    </div>
                    <div className="card-body" style={{ padding: '15px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '15px' }}>
                            {members.map(m => (
                                <div key={m.id} className="friend-card">
                                    <Link to={`/profile/${encodeURIComponent(m.username)}`} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <img src={m.avatar} alt={m.username} />
                                        <div className="name">{m.username}</div>
                                    </Link>
                                    {m.role === 'admin' && (
                                        <span style={{ fontSize: '9px', color: '#cc4488', marginTop: '4px' }}>Dono</span>
                                    )}
                                </div>
                            ))}
                        </div>
                        {members.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '30px', color: '#666', fontSize: '12px' }}>Nenhum membro encontrado.</div>
                        )}
                    </div>
                </div>
            </div>

            <div className="col-right">
                {/* Opcional: Sugestões ou outras infos */}
            </div>
        </div>
    );
}
