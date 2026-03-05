import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import UserCard from '../../components/UserCard';

export default function Testimonials() {
    const { username } = useParams();
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const targetQuery = username || user.username;

    const [testimonials, setTestimonials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);
    const [showWrite, setShowWrite] = useState(searchParams.get('write') === 'true');
    const [msg, setMsg] = useState('');

    const load = async () => {
        try {
            const [tRes, uRes] = await Promise.all([
                api.get(`/testimonials/user/${encodeURIComponent(targetQuery)}`),
                api.get(`/users/${encodeURIComponent(targetQuery)}`)
            ]);
            setTestimonials(tRes.data);
            setTargetUser(uRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [targetQuery]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!msg.trim()) return;
        try {
            await api.post('/testimonials', { target_id: targetUser.id, text: msg });
            alert('Depoimento enviado! Aguarde a aprovação do usuário.');
            setMsg('');
            setShowWrite(false);
        } catch (e) {
            alert(e.response?.data?.error || 'Erro ao enviar depoimento');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir este depoimento?')) return;
        try {
            await api.delete(`/testimonials/${id}`);
            load();
        } catch (e) { alert('Erro ao excluir'); }
    };

    if (loading) return <div className="loading">Carregando depoimentos...</div>;

    const isMe = targetUser?.id === user.id;

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={targetUser} stats={targetUser?.stats} />
            </div>

            <div className="col-center">
                <div className="card" style={{ borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Depoimentos de {isMe ? ' Mim' : targetUser?.username}</span>
                        {!isMe && !showWrite && (
                            <button className="btn btn-outline btn-sm" onClick={() => setShowWrite(true)}>
                                Escrever Depoimento
                            </button>
                        )}
                    </div>

                    <div className="card-body">
                        {showWrite && !isMe && (
                            <div style={{ marginBottom: '20px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                                <h4 style={{ marginBottom: '10px', fontSize: '13px' }}>Escrever depoimento para {targetUser.username}</h4>
                                <p style={{ fontSize: '11px', color: '#666', marginBottom: '10px' }}>
                                    Lembre-se: depoimentos são declarações públicas de amizade. O usuário deve aprovar antes de aparecer no perfil.
                                </p>
                                <form onSubmit={handleSend}>
                                    <textarea
                                        value={msg}
                                        onChange={e => setMsg(e.target.value)}
                                        placeholder="Escreva algo especial..."
                                        style={{ width: '100%', minHeight: '100px', padding: '10px', fontSize: '12px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
                                        required
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button type="submit" className="btn btn-pink">Enviar</button>
                                        <button type="button" className="btn btn-gray" onClick={() => setShowWrite(false)}>Cancelar</button>
                                    </div>
                                </form>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            {testimonials.map(t => (
                                <div key={t.id} style={{ display: 'flex', gap: '15px', padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                    <Link to={`/profile/${encodeURIComponent(t.author_username)}`}>
                                        <img src={t.author_avatar} alt={t.author_name} style={{ width: '50px', height: '50px', borderRadius: '4px' }} />
                                    </Link>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <Link to={`/profile/${encodeURIComponent(t.author_username)}`} style={{ fontWeight: 'bold', color: '#1155cc', textDecoration: 'none', fontSize: '13px' }}>
                                                {t.author_name}
                                            </Link>
                                            <div style={{ fontSize: '10px', color: '#999' }}>{new Date(t.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <p style={{ fontSize: '12px', color: '#333', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>{t.text}</p>
                                        {(isMe || t.author_id === user.id) && (
                                            <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                                <button
                                                    onClick={() => handleDelete(t.id)}
                                                    style={{ background: 'none', border: 'none', color: '#cc0000', fontSize: '10px', cursor: 'pointer', textDecoration: 'underline' }}
                                                >
                                                    excluir
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            {testimonials.length === 0 && (
                                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                                    Nenhum depoimento aprovado ainda.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-right">
                {/* Could show potential testimonial donors? */}
            </div>
        </div>
    );
}
