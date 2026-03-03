import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export default function CommunityMembers() {
    const { id } = useParams();
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

    if (loading) return <div className="loading">Carregando membros...</div>;

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
                <Link to={`/communities/${id}`} style={{ color: '#1155cc', fontSize: '12px' }}>← Voltar para {community?.name}</Link>
            </div>
            
            <div className="card">
                <div className="card-header" style={{ background: '#e4edf5', color: '#000', fontSize: '12px', fontWeight: 'bold' }}>
                    Membros da comunidade ({members.length})
                </div>
                <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px' }}>
                        {members.map(m => (
                            <div key={m.id} style={{ textAlign: 'center', padding: '10px', border: '1px solid #eee', borderRadius: '8px' }}>
                                <Link to={`/profile/${m.id}`}>
                                    <img 
                                        src={m.avatar} 
                                        alt={m.username} 
                                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} 
                                    />
                                </Link>
                                <Link to={`/profile/${m.id}`} style={{ color: '#1155cc', fontSize: '12px', fontWeight: 'bold', display: 'block' }}>
                                    {m.username}
                                </Link>
                                {m.role === 'admin' && (
                                    <span style={{ fontSize: '10px', color: '#cc4488', display: 'block', marginTop: '4px' }}>Administrador</span>
                                )}
                                {m.role === 'moderator' && (
                                    <span style={{ fontSize: '10px', color: '#1155cc', display: 'block', marginTop: '4px' }}>Moderador</span>
                                )}
                            </div>
                        ))}
                    </div>
                    {members.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '30px', color: '#666' }}>Nenhum membro encontrado.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
