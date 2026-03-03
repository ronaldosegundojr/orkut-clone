import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import UserCard from '../../components/UserCard';

export default function Home() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [friends, setFriends] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [recentScraps, setRecentScraps] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [updates, setUpdates] = useState([]);
    const [pendingTestimonials, setPendingTestimonials] = useState([]);
    const [testimonialText, setTestimonialText] = useState('');
    const [showTestimonialForm, setShowTestimonialForm] = useState(null);

    useEffect(() => {
        const loadHomeData = async () => {
            try {
                const [userRes, scrapsRes, friendsRes, commRes, suggRes] = await Promise.all([
                    api.get(`/users/${user.id}`),
                    api.get(`/scraps/${user.id}`),
                    api.get(`/friends/${user.id}`),
                    api.get('/communities/mine'),
                    api.get(`/friends/suggestions/${user.id}`)
                ]);
                setStats(userRes.data.stats);
                setRecentScraps(scrapsRes.data.slice(0, 5));
                setFriends(friendsRes.data.slice(0, 9));
                setCommunities(commRes.data.slice(0, 9));
                setSuggestions(suggRes.data);
            } catch (e) {
                console.error('Home load error:', e);
            }
        };
        loadHomeData();
    }, [user.id]);

    useEffect(() => {
        const loadUpdates = async () => {
            try {
                const friendsRes = await api.get(`/friends/${user.id}`);
                const friendIds = friendsRes.data.map(f => f.id);
                
                const [scrapsRes, photosRes, videosRes] = await Promise.all([
                    api.get(`/scraps/${user.id}`),
                    api.get(`/photos`),
                    api.get(`/videos`)
                ]);
                
                const scraps = scrapsRes.data.filter(s => friendIds.includes(s.author_id)).slice(0, 5).map(s => ({ ...s, type: 'scrap' }));
                const photos = photosRes.data.filter(p => friendIds.includes(p.owner_id)).slice(0, 5).map(p => ({ ...p, type: 'photo' }));
                const videos = videosRes.data.filter(v => friendIds.includes(v.owner_id)).slice(0, 5).map(v => ({ ...v, type: 'video' }));
                
                const allUpdates = [...scraps, ...photos, ...videos].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 10);
                setUpdates(allUpdates);
            } catch (e) {
                console.error('Updates load error:', e);
            }
        };
        loadUpdates();
    }, [user.id]);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const res = await api.get('/testimonials/pending');
                setPendingTestimonials(res.data);
            } catch (e) {
                console.error('Testimonials load error:', e);
            }
        };
        loadTestimonials();
    }, [user.id]);

    const handleApproveTestimonial = async (id) => {
        try {
            await api.put(`/testimonials/${id}/approve`);
            setPendingTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            alert('Erro ao aprovar depoimento');
        }
    };

    const handleRejectTestimonial = async (id) => {
        try {
            await api.put(`/testimonials/${id}/reject`);
            setPendingTestimonials(prev => prev.filter(t => t.id !== id));
        } catch (e) {
            alert('Erro ao rejeitar depoimento');
        }
    };

    const handleSendTestimonial = async (friendId) => {
        if (!testimonialText.trim()) return;
        try {
            await api.post('/testimonials', { target_id: friendId, text: testimonialText });
            setTestimonialText('');
            setShowTestimonialForm(null);
            alert('Depoimento enviado! Aguarde aprovação do usuário.');
        } catch (e) {
            alert(e.response?.data?.error || 'Erro ao enviar depoimento');
        }
    };

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={user} stats={stats} />
                
                {pendingTestimonials.length > 0 && (
                    <div className="card" style={{ marginTop: '12px', border: '2px solid #d12b8f' }}>
                        <div className="card-header" style={{ background: '#d12b8f', color: 'white' }}>
                            Depoimentos Pendentes ({pendingTestimonials.length})
                        </div>
                        <div className="card-body">
                            {pendingTestimonials.map(t => (
                                <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <img src={t.author_avatar} alt={t.author_name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        <Link to={`/profile/${t.author_id}`} style={{ fontWeight: 'bold', fontSize: '13px' }}>{t.author_name}</Link>
                                    </div>
                                    <p style={{ fontSize: '12px', color: '#333', margin: '0 0 8px 0' }}>{t.text}</p>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button onClick={() => handleApproveTestimonial(t.id)} className="btn btn-pink btn-sm">Aprovar</button>
                                        <button onClick={() => handleRejectTestimonial(t.id)} className="btn btn-gray btn-sm">Rejeitar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="col-center">
                <div className="card" style={{ marginBottom: '12px' }}>
                    <div className="card-header">Bem-vindo(a) ao Tukro, {user.username}!</div>
                    <div className="card-body">
                        <h3 className="section-title">Sugestões de Amizade</h3>
                        <div className="user-grid">
                            {suggestions.map(s => (
                                <div key={s.id} className="user-card-mini">
                                    <Link to={`/profile/${s.id}`}>
                                        <img src={s.avatar} alt={s.username} className="avatar avatar-sm" />
                                        <div className="name">{s.username}</div>
                                    </Link>
                                    <button className="btn btn-outline btn-sm" style={{ marginTop: '6px' }} onClick={() => api.post('/friends/request', { friend_id: s.id })}>
                                        Adicionar
                                    </button>
                                </div>
                            ))}
                            {suggestions.length === 0 && <span style={{ color: '#999' }}>Sem sugestões no momento.</span>}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '12px' }}>
                    <div className="card-header">📰 Atualizações dos Amigos</div>
                    <div className="card-body">
                        {updates.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                                Nenhuma atualização dos seus amigos ainda.
                            </div>
                        ) : (
                            updates.map(update => (
                                <div key={`${update.type}-${update.id}`} style={{ display: 'flex', gap: '10px', padding: '10px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                    {update.type === 'scrap' && (
                                        <>
                                            <img src={update.author_avatar} alt={update.author_name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontSize: '12px' }}>
                                                    <Link to={`/profile/${update.author_id}`} style={{ fontWeight: 'bold' }}>{update.author_name}</Link>
                                                    {' '}enviou um recado
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#333', marginTop: '4px' }}>{update.text?.substring(0, 100)}...</div>
                                                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>{new Date(update.created_at).toLocaleString('pt-BR')}</div>
                                            </div>
                                        </>
                                    )}
                                    {update.type === 'photo' && (
                                        <>
                                            <img src={update.owner_avatar} alt={update.owner_name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontSize: '12px' }}>
                                                    <Link to={`/profile/${update.owner_id}`} style={{ fontWeight: 'bold' }}>{update.owner_name}</Link>
                                                    {' '}publicou uma foto
                                                </div>
                                                <img src={update.url} alt={update.caption} style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '4px', marginTop: '4px' }} />
                                                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>{update.caption}</div>
                                            </div>
                                        </>
                                    )}
                                    {update.type === 'video' && (
                                        <>
                                            <img src={update.owner_avatar} alt={update.owner_name} style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
                                            <div>
                                                <div style={{ fontSize: '12px' }}>
                                                    <Link to={`/profile/${update.owner_id}`} style={{ fontWeight: 'bold' }}>{update.owner_name}</Link>
                                                    {' '}compartilhou um vídeo
                                                </div>
                                                <div style={{ fontSize: '13px', color: '#1155cc', marginTop: '4px' }}>🎬 {update.title}</div>
                                                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>{update.views} visualizações</div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header">✍️ Depoimentos</div>
                    <div className="card-body">
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                            Envie um depoimento especial para um amigo! O depoimento só aparecerá no perfil após a aprovação do usuário.
                        </p>
                        <div style={{ marginBottom: '12px' }}>
                            <select id="testimonial-friend" style={{ padding: '6px', fontSize: '12px', width: '100%', marginBottom: '8px' }}>
                                <option value="">Selecione um amigo...</option>
                                {friends.filter(f => f.id !== user.id).map(f => (
                                    <option key={f.id} value={f.id}>{f.username}</option>
                                ))}
                            </select>
                            {showTestimonialForm && showTestimonialForm === document.getElementById('testimonial-friend')?.value ? (
                                <div>
                                    <textarea 
                                        value={testimonialText}
                                        onChange={(e) => setTestimonialText(e.target.value)}
                                        placeholder="Escreva um depoimento especial para o seu amigo..."
                                        style={{ width: '100%', padding: '8px', fontSize: '12px', minHeight: '80px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={() => handleSendTestimonial(showTestimonialForm)} className="btn btn-pink btn-sm">Enviar Depoimento</button>
                                        <button onClick={() => { setShowTestimonialForm(null); setTestimonialText(''); }} className="btn btn-gray btn-sm">Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowTestimonialForm(document.getElementById('testimonial-friend')?.value)} className="btn btn-outline btn-sm">
                                    Escrever Depoimento
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-right">
                <div className="card" style={{ marginBottom: '12px', borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
                    <div className="card-header" style={{ background: '#e4edf5', color: '#000', padding: '5px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: 'none' }}>
                        amigos ({stats?.friends || 0})
                    </div>
                    <div className="card-body" style={{ padding: '8px' }}>
                        <div style={{ marginBottom: '12px', display: 'flex', background: '#fff' }}>
                            <input type="text" placeholder="buscar amigos" style={{ border: '1px solid #a3b2cc', outline: 'none', width: '100%', fontSize: '11px', padding: '2px 4px', borderRadius: 0 }} />
                            <span style={{ fontSize: '11px', color: '#000', marginLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', border: '1px solid #a3b2cc', padding: '0 4px', background: '#e9e9e9' }}>🔍</span>
                        </div>
                        <div className="friends-grid-sidebar">
                            {friends.map(f => (
                                <Link key={f.id} to={`/profile/${f.id}`} className="friend-item-sidebar" title={f.username}>
                                    <img src={f.avatar} alt={f.username} />
                                    <span>{f.username.split(' ')[0]}</span>
                                </Link>
                            ))}
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                            <Link to="/friends" style={{ fontSize: '11px', color: '#1155cc' }}>ver todos</Link>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
                    <div className="card-header" style={{ background: '#e4edf5', color: '#000', padding: '5px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: 'none' }}>
                        comunidades ({stats?.communities || communities.length})
                    </div>
                    <div className="card-body" style={{ padding: '8px' }}>
                        <div style={{ marginBottom: '12px', display: 'flex', background: '#fff' }}>
                            <input type="text" placeholder="buscar comunidades" style={{ border: '1px solid #a3b2cc', outline: 'none', width: '100%', fontSize: '11px', padding: '2px 4px', borderRadius: 0 }} />
                            <span style={{ fontSize: '11px', color: '#000', marginLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', border: '1px solid #a3b2cc', padding: '0 4px', background: '#e9e9e9' }}>🔍</span>
                        </div>
                        <div className="friends-grid-sidebar">
                            {communities.map(c => (
                                <Link key={c.id} to={`/communities/${c.id}`} className="friend-item-sidebar" title={c.name}>
                                    <img src={c.image} alt={c.name} />
                                    <span>{c.name.split(' ')[0]}</span>
                                </Link>
                            ))}
                        </div>
                        <div style={{ marginTop: '12px', textAlign: 'right' }}>
                            <Link to="/communities" style={{ fontSize: '11px', color: '#1155cc' }}>ver todas</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
