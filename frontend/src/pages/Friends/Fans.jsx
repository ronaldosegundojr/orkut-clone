import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export default function Fans() {
    const { userId } = useParams();
    const [fans, setFans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [fansRes, userRes] = await Promise.all([
                    api.get(`/fans/${userId}`),
                    api.get(`/users/${userId}`)
                ]);
                setFans(fansRes.data);
                setTargetUser(userRes.data);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    if (loading) return <div className="loading">Carregando fãs...</div>;

    return (
        <div className="card">
            <div className="card-header">
                Fãs de {targetUser?.username}
            </div>
            <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px' }}>
                    {fans.map(f => (
                        <Link key={f.id} to={`/profile/${f.id}`} style={{ textDecoration: 'none', textAlign: 'center' }}>
                            <img src={f.avatar} alt={f.username} style={{ width: '80px', height: '80px', borderRadius: '4px', objectFit: 'cover', border: '1px solid #c9d7f1' }} />
                            <div style={{ fontSize: '11px', color: '#1155cc', marginTop: '4px' }}>{f.username}</div>
                        </Link>
                    ))}
                </div>
                {fans.length === 0 && <div className="empty-state">Ninguém é fã ainda. Seja o primeiro!</div>}
            </div>
        </div>
    );
}
