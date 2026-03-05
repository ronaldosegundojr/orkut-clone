import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import UserCard from '../../components/UserCard';
import SidebarList from '../../components/SidebarList';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    const [carouselIndex, setCarouselIndex] = useState(0);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteLoading, setInviteLoading] = useState(false);

    const loadHomeData = async () => {
        try {
            const [userRes, scrapsRes, friendsRes, commRes, suggRes] = await Promise.all([
                api.get(`/users/${encodeURIComponent(user.username)}`),
                api.get(`/scraps/${encodeURIComponent(user.username)}`),
                api.get(`/friends/${encodeURIComponent(user.username)}`),
                api.get(`/communities/user/${user.id}`), // standardizing to use ID
                api.get(`/friends/suggestions/${encodeURIComponent(user.username)}`)
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

    useEffect(() => {
        if (user?.username) {
            loadHomeData();
        }
    }, [user?.username]);

    useEffect(() => {
        const loadUpdates = async () => {
            try {
                const res = await api.get('/updates');
                setUpdates(res.data);
            } catch (e) {
                console.error('Updates load error:', e);
            }
        };
        if (user?.id) loadUpdates();
    }, [user?.id]);

    useEffect(() => {
        const loadTestimonials = async () => {
            try {
                const res = await api.get('/testimonials/pending');
                setPendingTestimonials(res.data);
            } catch (e) {
                console.error('Testimonials load error:', e);
            }
        };
        if (user?.id) loadTestimonials();
    }, [user?.id]);

    const handleAddFriend = async (friendId) => {
        try {
            await api.post('/friends/request', { friend_id: friendId });
            setSuggestions(prev => prev.filter(s => s.id !== friendId));
            alert('Convite enviado!');
        } catch (e) {
            alert('Erro ao adicionar amigo');
        }
    };

    const handleApproveTestimonial = async (id) => {
        try {
            await api.put(`/testimonials/${id}/approve`);
            setPendingTestimonials(prev => prev.filter(t => t.id !== id));
            loadHomeData();
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

    const handleSendTestimonial = async () => {
        const friendId = document.getElementById('testimonial-friend')?.value;
        if (!friendId || !testimonialText.trim()) return;
        try {
            await api.post('/testimonials', { target_id: friendId, text: testimonialText });
            setTestimonialText('');
            setShowTestimonialForm(null);
            alert('Depoimento enviado! Aguarde aprovação.');
        } catch (e) {
            alert(e.response?.data?.error || 'Erro ao enviar depoimento');
        }
    };

    const handleSendInvite = async () => {
        if (!inviteEmail) return;
        setInviteLoading(true);
        try {
            await api.post('/auth/invite', { email: inviteEmail, senderName: user.username });
            alert('Convite enviado com sucesso!');
            setInviteEmail('');
            setShowInviteModal(false);
        } catch (e) {
            alert(e.response?.data?.error || 'Erro ao enviar convite');
        } finally {
            setInviteLoading(false);
        }
    };

    const nextCarousel = () => {
        if (carouselIndex + 4 < suggestions.length) {
            setCarouselIndex(prev => prev + 1);
        }
    };

    const prevCarousel = () => {
        if (carouselIndex > 0) {
            setCarouselIndex(prev => prev - 1);
        }
    };

    if (!user) return null;

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={user} stats={stats} />

                {pendingTestimonials.length > 0 && (
                    <div className="card" style={{ marginTop: '12px', border: '2px solid #d12b8f', borderRadius: '8px' }}>
                        <div className="card-header" style={{ background: '#d12b8f', color: 'white', borderRadius: '6px 6px 0 0' }}>
                            Depoimentos Pendentes ({pendingTestimonials.length})
                        </div>
                        <div className="card-body">
                            {pendingTestimonials.map(t => (
                                <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                        <img src={t.author_avatar} alt={t.author_name} style={{ width: '32px', height: '32px', borderRadius: '50%' }} />
                                        <Link to={`/profile/${t.author_username}`} style={{ fontWeight: 'bold', fontSize: '12px', color: '#1155cc' }}>{t.author_name}</Link>
                                    </div>
                                    <p style={{ fontSize: '11px', color: '#333', margin: '0 0 8px 0' }}>{t.text}</p>
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
                <div className="card" style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ color: '#1155cc', fontSize: '10px' }}>●</span>
                        <span style={{ fontSize: '11px', color: '#333' }}>Amigos sugeridos pelo Tukro</span>
                    </div>
                    <div className="card-body" style={{ position: 'relative', padding: '15px 45px', overflow: 'hidden', minHeight: '160px' }}>
                        {suggestions.length > 4 && (
                            <>
                                <button
                                    onClick={prevCarousel}
                                    disabled={carouselIndex === 0}
                                    style={{
                                        position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)',
                                        background: carouselIndex === 0 ? '#f0f0f0' : '#d12b8f',
                                        border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: carouselIndex === 0 ? 'default' : 'pointer', zIndex: 10,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={nextCarousel}
                                    disabled={carouselIndex + 4 >= suggestions.length}
                                    style={{
                                        position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
                                        background: carouselIndex + 4 >= suggestions.length ? '#f0f0f0' : '#d12b8f',
                                        border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: carouselIndex + 4 >= suggestions.length ? 'default' : 'pointer', zIndex: 10,
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)', color: 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}

                        <div style={{ display: 'flex', gap: '15px', transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)', transform: `translateX(-${carouselIndex * 110}px)` }}>
                            {suggestions.map(s => (
                                <div key={s.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '95px', flexShrink: 0 }}>
                                    <Link to={`/profile/${encodeURIComponent(s.username)}`} style={{ position: 'relative' }}>
                                        <img src={s.avatar} alt={s.username} style={{ width: '85px', height: '85px', objectFit: 'cover', border: '1px solid #c9d7f1', padding: '2px', background: 'white', borderRadius: '4px' }} />
                                    </Link>
                                    <Link to={`/profile/${encodeURIComponent(s.username)}`} style={{ fontSize: '11px', fontWeight: 'bold', color: '#1155cc', textDecoration: 'none', textAlign: 'center', width: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '4px' }}>
                                        {s.username}
                                    </Link>
                                    <button
                                        className="btn btn-outline btn-sm"
                                        style={{ marginTop: '6px', fontSize: '9px', padding: '2px 6px', width: '100%', whiteSpace: 'nowrap' }}
                                        onClick={() => handleAddFriend(s.id)}
                                    >
                                        adicionar amigo(a)
                                    </button>
                                </div>
                            ))}
                            {suggestions.length === 0 && (
                                <div style={{ textAlign: 'center', width: '100%', padding: '20px', color: '#999', fontSize: '12px' }}>
                                    Nenhuma nova sugestão disponível agora.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>📰 Atualizações dos Amigos</span>
                    </div>
                    <div className="card-body" style={{ padding: '0' }}>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '10px' }}>
                            {updates.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#666', fontSize: '12px' }}>
                                    Nenhuma atualização recente.
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {updates.map(update => (
                                        <div key={`${update.type}-${update.id}`} style={{ display: 'flex', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f5f5f5' }}>
                                            <Link to={`/profile/${encodeURIComponent(update.author_username || update.owner_username)}`}>
                                                <img
                                                    src={update.author_avatar || update.owner_avatar}
                                                    alt="avatar"
                                                    style={{ width: '40px', height: '40px', borderRadius: '4px', border: '1px solid #ddd' }}
                                                />
                                            </Link>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '12px' }}>
                                                    <Link to={`/profile/${encodeURIComponent(update.author_username || update.owner_username)}`} style={{ fontWeight: 'bold', color: '#1155cc', textDecoration: 'none' }}>
                                                        {update.author_username || update.owner_username}
                                                    </Link>
                                                    <span style={{ color: '#666' }}>
                                                        {update.type === 'scrap' ? ' recebeu um novo recado' :
                                                            update.type === 'photo' ? ' postou uma nova foto' :
                                                                update.type === 'video' ? ' compartilhou um vídeo' :
                                                                    ' atualizou o perfil'}
                                                    </span>
                                                </div>
                                                {update.type === 'scrap' && update.text && (
                                                    <div style={{ fontSize: '11px', color: '#444', marginTop: '2px', fontStyle: 'italic' }}>"{update.text}"</div>
                                                )}
                                                {update.type === 'photo' && update.url && (
                                                    <Link to={`/photos/${update.id}`} style={{ display: 'block', marginTop: '8px' }}>
                                                        <img src={update.url} alt="Update" style={{ maxWidth: '200px', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} />
                                                    </Link>
                                                )}
                                                {update.type === 'video' && update.url && (
                                                    <Link to={`/videos/${update.id}`} style={{ display: 'block', marginTop: '8px', textDecoration: 'none' }}>
                                                        <div style={{ position: 'relative', width: '200px', height: '112px', borderRadius: '4px', overflow: 'hidden', border: '1px solid #ddd' }}>
                                                            {(() => {
                                                                const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                                const match = update.url.match(regExp);
                                                                const videoId = (match && match[2].length === 11) ? match[2] : null;
                                                                if (videoId) {
                                                                    return <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt="Thumbnail" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />;
                                                                }
                                                                return (
                                                                    <div style={{ width: '100%', height: '100%', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '24px' }}>
                                                                        🎬
                                                                    </div>
                                                                );
                                                            })()}
                                                            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                                                                ▶️
                                                            </div>
                                                        </div>
                                                        <div style={{ marginTop: '4px' }}>
                                                            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#1a4078' }}>{update.title}</div>
                                                            <div style={{ fontSize: '9px', color: '#6695b3' }}>Clique para comentar e assistir</div>
                                                        </div>
                                                    </Link>
                                                )}
                                                {update.type === 'photo' && update.caption && (
                                                    <div style={{ fontSize: '11px', color: '#444', marginTop: '4px' }}>{update.caption}</div>
                                                )}
                                                {update.type === 'video' && update.title && !update.url && (
                                                    <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>{update.title}</div>
                                                )}
                                                <div style={{ fontSize: '10px', color: '#999', marginTop: '4px' }}>
                                                    {new Date(update.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginBottom: '16px', borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header">✍️ Depoimentos</div>
                    <div className="card-body">
                        <p style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>
                            Envie um depoimento especial para um amigo! O depoimento só aparecerá no perfil após a aprovação do usuário.
                        </p>
                        <div style={{ marginBottom: '12px' }}>
                            <select id="testimonial-friend" style={{ padding: '6px', fontSize: '12px', width: '100%', marginBottom: '8px' }}>
                                <option value="">Selecione um amigo...</option>
                                {friends.map(f => (
                                    <option key={f.id} value={f.id}>{f.username}</option>
                                ))}
                            </select>
                            {showTestimonialForm ? (
                                <div>
                                    <textarea
                                        value={testimonialText}
                                        onChange={(e) => setTestimonialText(e.target.value)}
                                        placeholder="Escreva um depoimento especial..."
                                        style={{ width: '100%', padding: '8px', fontSize: '12px', minHeight: '80px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    />
                                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                        <button onClick={handleSendTestimonial} className="btn btn-pink btn-sm">Enviar</button>
                                        <button onClick={() => { setShowTestimonialForm(false); setTestimonialText(''); }} className="btn btn-gray btn-sm">Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setShowTestimonialForm(true)} className="btn btn-outline btn-sm">
                                    Escrever Depoimento
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="col-right">
                <SidebarList
                    title="amigos"
                    items={friends}
                    count={stats?.friends || 0}
                    viewAllLink={`/${encodeURIComponent(user.username)}/friends`}
                    type="friends"
                />

                <SidebarList
                    title="comunidades"
                    items={communities}
                    count={stats?.communities || communities.length}
                    viewAllLink={`/${encodeURIComponent(user.username)}/communities`}
                    type="communities"
                />

                {/* Invites Box */}
                <div className="card" style={{ marginTop: '12px', border: '1px solid #c9d7f1', borderRadius: '8px' }}>
                    <div className="card-body" style={{ textAlign: 'center', padding: '15px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}>
                            <div style={{ position: 'relative', width: '60px', height: '60px', marginBottom: '5px' }}>
                                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '50%', border: '4px solid #d12b8f', opacity: 1 }}></div>
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d12b8f', fontSize: '30px' }}>
                                    ○
                                </div>
                            </div>
                            <div style={{ fontSize: '18px', color: '#666' }}>10 convites</div>
                            <div style={{ fontSize: '13px', color: '#333' }}>restantes para o Tukro</div>

                            <button
                                onClick={() => setShowInviteModal(true)}
                                style={{
                                    marginTop: '8px',
                                    padding: '4px 20px',
                                    background: '#f0f0f0',
                                    border: '1px solid #ccc',
                                    borderRadius: '2px',
                                    fontSize: '13px',
                                    cursor: 'pointer',
                                    fontWeight: 'normal',
                                    color: '#333'
                                }}
                            >
                                convide seus amigos
                            </button>
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div className="card" style={{ width: '400px', padding: '20px' }}>
                            <h3 style={{ marginBottom: '15px', color: '#1e4078' }}>Convidar amigos para o Tukro</h3>
                            <p style={{ fontSize: '12px', marginBottom: '15px' }}>Insira o e-mail do seu amigo abaixo para enviar um convite exclusivo.</p>
                            <input
                                type="email"
                                placeholder="ex: amigo@email.com"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                style={{ marginBottom: '15px' }}
                            />
                            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                                <button className="btn btn-gray" onClick={() => setShowInviteModal(false)}>Cancelar</button>
                                <button
                                    className="btn btn-pink"
                                    disabled={inviteLoading || !inviteEmail}
                                    onClick={handleSendInvite}
                                >
                                    {inviteLoading ? 'Enviando...' : 'Enviar Convite'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
