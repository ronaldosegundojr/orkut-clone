import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import UserCard from '../../components/UserCard';
import Testimonials from '../../components/Testimonials';

export default function Profile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth();
    
    if (!currentUser) {
        return <div className="loading">Carregando...</div>;
    }
    
    const profileUsername = username || currentUser.username;
    const isMe = profileUsername === currentUser.username;

    const [profile, setProfile] = useState(null);
    const [profileId, setProfileId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [humorEdit, setHumorEdit] = useState(false);
    const [newHumor, setNewHumor] = useState('');
    const [nameEdit, setNameEdit] = useState(false);
    const [newName, setNewName] = useState('');
    const [friends, setFriends] = useState([]);
    const [communities, setCommunities] = useState([]);
    const [editDetails, setEditDetails] = useState(false);
    const [detailsForm, setDetailsForm] = useState({});
    const [testimonials, setTestimonials] = useState([]);

    const loadProfile = async () => {
        if (!profileUsername) return;
        try {
            const profileRes = await api.get(`/users/${profileUsername}`);
            const userData = profileRes.data;
            setProfile(userData);
            setProfileId(userData.id);
            setNewHumor(userData.humor);
            
            const [friendsRes, commRes, testimonialRes] = await Promise.all([
                api.get(`/friends/${userData.id}`),
                api.get(`/communities/user/${userData.id}`),
                api.get(`/testimonials/user/${userData.id}`)
            ]);
            setFriends(friendsRes.data.slice(0, 9));
            setCommunities(commRes.data.slice(0, 9));
            setTestimonials(testimonialRes.data);
        } catch (e) {
            console.error('Erro profile', e.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        loadProfile();
    }, [profileUsername]);

    useEffect(() => {
        if (profile) {
            setDetailsForm({
                ...(profile.details || {}),
                bio: profile.bio || '',
                city: profile.city || '',
                country: profile.country || '',
                relationship: profile.relationship || '',
                humor: profile.humor || ''
            });
        }
    }, [profile]);

    const saveDetails = async () => {
        try {
            const { bio, city, country, relationship, humor, ...rest } = detailsForm;
            await api.put(`/users/${profile.id}`, {
                bio, city, country, relationship, humor,
                details: rest
            });
            setProfile({ ...profile, bio, city, country, relationship, humor, details: rest });
            if (isMe) updateUser({ ...currentUser, bio, city, country, relationship, humor });
            setEditDetails(false);
        } catch (e) { alert('Erro ao salvar detalhes'); }
    };

    const saveHumor = async () => {
        await api.put(`/users/${profileId}`, { humor: newHumor });
        setProfile({ ...profile, humor: newHumor });
        if (isMe) updateUser({ ...currentUser, humor: newHumor });
        setHumorEdit(false);
    };

    const saveName = async () => {
        if (!newName.trim()) return;
        try {
            await api.put(`/users/${profileId}`, { username: newName });
            setProfile({ ...profile, username: newName });
            if (isMe) updateUser({ ...currentUser, username: newName });
            setNameEdit(false);
        } catch (e) { alert('Erro ao salvar nome'); }
    };

    const handleAction = async (action, type) => {
        try {
            if (action === 'addFriend') {
                await api.post('/friends/request', { friend_id: profileId });
                loadProfile();
            } else if (action === 'fan') {
                await api.post('/fans', { user_id: profileId });
                loadProfile();
            } else if (action === 'unfan') {
                await api.delete(`/fans/${profileId}`);
                loadProfile();
            } else if (action === 'vote') {
                await api.post(`/users/${profileId}/vote`, { type });
                loadProfile();
            }
        } catch (e) {
            alert(e.response?.data?.error || 'Erro');
        }
    };

    const isFriend = profile?.friendship || friends.some(f => f.username === currentUser.username);

    if (loading) return <div className="loading">Carregando Tukro...</div>;
    if (!profile) return <div className="empty-state">Carregando perfil...</div>;

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={profile} stats={profile.stats} />

                {!isMe && (
                    <div className="card" style={{ marginTop: '12px' }}>
                        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {!profile.friendship && (
                                <button className="btn btn-pink btn-full" onClick={() => handleAction('addFriend')}>Adicionar Amigo</button>
                            )}
                            {profile.friendship?.status === 'pending' && (
                                <button className="btn btn-gray btn-full" disabled>Solicitação enviada</button>
                            )}
                            <Link to={`/scraps?to=${profile.username}`} className="btn btn-outline btn-full">Deixar recado</Link>
                            <Link to={`/messages?userId=${profile.username}`} className="btn btn-outline btn-full">Enviar mensagem</Link>

                            <button className={`btn ${profile.isFan ? 'btn-gray' : 'btn-outline'} btn-full`} onClick={() => handleAction(profile.isFan ? 'unfan' : 'fan')}>
                                {profile.isFan ? 'Deixar de ser Fã' : 'Virar Fã (♥)'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className="col-center">
                <div className="card" style={{ marginBottom: '12px', borderRadius: 0, borderTopRightRadius: '16px', border: '1px solid #c9d7f1' }}>
                    <div className="card-body" style={{ padding: '0' }}>

                        {/* Header Box (White) */}
                        <div style={{ padding: '20px 20px 10px 20px', background: 'white', borderTopRightRadius: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                {nameEdit && isMe ? (
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        <h1 style={{ fontSize: '20px', color: '#000', fontWeight: 'normal', fontFamily: 'Arial, sans-serif' }}>» </h1>
                                        <input 
                                            type="text" 
                                            value={newName} 
                                            onChange={e => setNewName(e.target.value)} 
                                            style={{ padding: '2px 4px', fontSize: '18px' }}
                                            autoFocus
                                        />
                                        <button className="btn btn-pink btn-sm" onClick={saveName}>Salvar</button>
                                        <button className="btn btn-gray btn-sm" onClick={() => setNameEdit(false)}>x</button>
                                    </div>
                                ) : (
                                    <h1 
                                        style={{ fontSize: '20px', color: '#000', fontWeight: 'normal', fontFamily: 'Arial, sans-serif', cursor: isMe ? 'pointer' : 'default' }}
                                        onClick={() => { if (isMe) { setNewName(profile.username); setNameEdit(true); } }}
                                        title={isMe ? 'Clique para editar' : ''}
                                    >
                                        » {profile.username}
                                    </h1>
                                )}
                            </div>

                            {/* Humor text line (bordered box) - click to edit */}
                            <div 
                                style={{
                                    border: '1px solid #e5e5e5',
                                    padding: '6px 8px',
                                    marginBottom: '16px',
                                    fontSize: '13px',
                                    color: '#333',
                                    display: 'flex',
                                    alignItems: 'center',
                                    minHeight: '30px',
                                    cursor: isMe ? 'text' : 'default'
                                }}
                                onClick={() => { if (isMe && !humorEdit) { setNewHumor(profile.humor || ''); setHumorEdit(true); } }}
                            >
                                {humorEdit && isMe ? (
                                    <div style={{ display: 'flex', gap: '4px', width: '100%' }}>
                                        <input type="text" value={newHumor} onChange={e => setNewHumor(e.target.value)} style={{ flex: 1, padding: '2px 4px' }} />
                                        <button className="btn btn-pink btn-sm" onClick={saveHumor}>Salvar</button>
                                        <button className="btn btn-gray btn-sm" onClick={(e) => { e.stopPropagation(); setHumorEdit(false); }}>x</button>
                                    </div>
                                ) : (
                                    <div style={{ width: '100%' }}>
                                        {profile.humor || 'Sem humor definido...'}
                                    </div>
                                )}
                            </div>

                            {/* Stats Horizontal */}
                            <div style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '10px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div>recados</div>
                                    <div style={{ color: '#000', marginTop: '2px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Link to={`/scraps?to=${profile.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '14px' }}>📝</span>
                                            {profile.stats?.scraps || 0}
                                        </Link>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div>fotos</div>
                                    <div style={{ color: '#000', marginTop: '2px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Link to={`/photos/user/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '14px' }}>📷</span>
                                            {profile.stats?.photos || 0}
                                        </Link>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div>vídeos</div>
                                    <div style={{ color: '#000', marginTop: '2px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Link to={`/videos?user=${profile.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '14px' }}>🎥</span>
                                            {profile.stats?.videos || 0}
                                        </Link>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div>fãs</div>
                                    <div style={{ color: '#000', marginTop: '2px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        <Link to={`/fans/${profile.id}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                            <span style={{ fontSize: '14px', color: '#e5ad00' }}>⭐</span>
                                            {profile.stats?.fans || 0}
                                        </Link>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#e5ad00' }}>confiável</div>
                                    <div style={{ fontSize: '14px', marginTop: '2px', cursor: !isMe ? 'pointer' : 'default' }} onClick={() => !isMe && handleAction('vote', 'trusty')}>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <span key={i} style={{ opacity: i < (profile.stats?.trusty || 0) ? 1 : 0.2 }}>😊</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#8da5c9' }}>legal</div>
                                    <div style={{ fontSize: '14px', marginTop: '2px', cursor: !isMe ? 'pointer' : 'default' }} onClick={() => !isMe && handleAction('vote', 'cool')}>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <span key={i} style={{ opacity: i < (profile.stats?.cool || 0) ? 1 : 0.2 }}>🧊</span>
                                        ))}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ color: '#cc4488' }}>sexy</div>
                                    <div style={{ fontSize: '14px', marginTop: '2px', cursor: !isMe ? 'pointer' : 'default' }} onClick={() => !isMe && handleAction('vote', 'sexy')}>
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <span key={i} style={{ opacity: i < (profile.stats?.sexy || 0) ? 1 : 0.2 }}>❤️</span>
                                        ))}
                        </div>
                    </div>
                </div>


            </div>

                        <div style={{ borderTop: '2px solid #e4edf5' }}></div>

                        {/* Bio / Quem Sou Eu Box (Light Blue) */}
                        <div style={{ padding: '15px 20px', background: '#e4edf5', display: 'flex', gap: '10px' }}>
                            <div style={{ width: '110px', color: '#666', fontSize: '11px', textAlign: 'right', fontWeight: 'bold' }}>
                                quem sou eu:
                            </div>
                            <div style={{ flex: 1, color: '#333', fontSize: '12px', whiteSpace: 'pre-wrap', fontFamily: 'Arial, sans-serif' }}>
                                {editDetails ? (
                                    <textarea
                                        value={detailsForm.bio || ''}
                                        onChange={e => setDetailsForm({ ...detailsForm, bio: e.target.value })}
                                        style={{ width: '100%', minHeight: '80px', padding: '5px', fontSize: '12px', border: '1px solid #c9d7f1' }}
                                    />
                                ) : (
                                    profile.bio || 'Este usuário ainda não escreveu nada sobre si.'
                                )}
                            </div>
                        </div>

                        {/* Detailed Information Rows */}
                        <div style={{ padding: '10px 0', background: 'white' }}>
                            {isMe && (
                                <div style={{ padding: '0 20px 10px', textAlign: 'right' }}>
                                    <button onClick={() => setEditDetails(!editDetails)} style={{ fontSize: '11px', color: '#1155cc', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>
                                        {editDetails ? 'cancelar edição' : 'editar informações'}
                                    </button>
                                    {editDetails && <button onClick={saveDetails} style={{ fontSize: '11px', color: '#1155cc', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginLeft: '10px' }}>salvar tudo</button>}
                                </div>
                            )}

                            {[
                                {
                                    label: 'social:', fields: [
                                        { key: 'relationship', label: 'relacionamento:' },
                                        { key: 'birthday', label: 'aniversário:' },
                                        { key: 'children', label: 'filhos:' },
                                        { key: 'ethnicity', label: 'etnia:' },
                                        { key: 'religion', label: 'religião:' },
                                        { key: 'humor', label: 'humor:', global: true }
                                    ]
                                },
                                {
                                    label: 'contato:', fields: [
                                        { key: 'city', label: 'cidade:', global: true },
                                        { key: 'state_or_region', label: 'estado:' },
                                        { key: 'country', label: 'país:', global: true },
                                        { key: 'zip_code', label: 'cep:' }
                                    ]
                                },
                                {
                                    label: 'interesses:', fields: [
                                        { key: 'here_for', label: 'estou aqui para:' },
                                        { key: 'passions', label: 'paixões:' },
                                        { key: 'sports', label: 'esportes:' },
                                        { key: 'activities', label: 'atividades:' },
                                        { key: 'books', label: 'livros:' },
                                        { key: 'music', label: 'músicas:' },
                                        { key: 'tv_shows', label: 'programas de tv:' },
                                        { key: 'movies', label: 'filmes:' },
                                        { key: 'cuisines', label: 'comidas:' }
                                    ]
                                }
                            ].map((section, idx) => (
                                <div key={idx} style={{ marginBottom: '15px' }}>
                                    <div style={{ padding: '4px 20px', background: '#d4dded', color: '#333', fontSize: '11px', fontWeight: 'bold' }}>
                                        {section.label}
                                    </div>
                                    {section.fields.map(f => (
                                        <div key={f.key} style={{ display: 'flex', padding: '4px 20px', fontSize: '11px' }}>
                                            <div style={{ width: '110px', color: '#666', textAlign: 'right', paddingRight: '10px' }}>{f.label}</div>
                                            <div style={{ flex: 1, color: '#333' }}>
                                                {editDetails ? (
                                                    <input
                                                        type="text"
                                                        value={detailsForm[f.key] || ''}
                                                        onChange={e => setDetailsForm({ ...detailsForm, [f.key]: e.target.value })}
                                                        style={{ width: '100%', padding: '1px 4px', fontSize: '11px' }}
                                                    />
                                                ) : (
                                                    f.global ? profile[f.key] : profile.details?.[f.key] || 'não informado'
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Depoimentos Section - Below the details */}
                <Testimonials 
                    profileId={profileId} 
                    testimonials={testimonials} 
                    isFriend={isFriend} 
                />
            </div>

            <div className="col-right">
                {/* Friends */}
                <div className="card" style={{ marginBottom: '12px', borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
                    <div className="card-header" style={{ background: '#e4edf5', color: '#000', padding: '5px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: 'none' }}>
                        amigos ({profile.stats?.friends || 0})
                    </div>
                    <div className="card-body" style={{ padding: '8px' }}>
                        <div className="friends-grid-sidebar">
                            {friends.map(f => (
                                <Link key={f.friendship_id || f.id} to={`/profile/${f.username}`} className="friend-item-sidebar" title={f.username}>
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

                {/* Communities */}
                <div className="card" style={{ borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
                    <div className="card-header" style={{ background: '#e4edf5', color: '#000', padding: '5px 8px', fontSize: '11px', fontWeight: 'bold', borderBottom: 'none' }}>
                        comunidades ({profile.stats?.communities || communities.length})
                    </div>
                    <div className="card-body" style={{ padding: '8px' }}>
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
        </div >
    );
}
