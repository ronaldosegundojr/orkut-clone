import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';

export default function UserCard({ user, stats, onAddFriend, friendship }) {
    const { user: currentUser, updateUser } = useAuth();
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return null;
    const isMe = currentUser?.username === user?.username;
    const isPending = friendship?.status === 'pending';
    const isFriend = friendship?.status === 'accepted';

    const handlePhotoUpdate = async (avatarUrl) => {
        try {
            await api.put(`/users/${user.id}`, { avatar: avatarUrl });
            updateUser({ ...currentUser, avatar: avatarUrl });
            setShowPhotoOptions(false);
        } catch (e) {
            alert('Erro ao atualizar foto');
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            alert('Apenas arquivos jpg, jpeg ou png são permitidos.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            handlePhotoUpdate(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleLinkUpdate = () => {
        const url = prompt('Cole o link da sua nova foto (jpg, jpeg, png):');
        if (url) {
            handlePhotoUpdate(url);
        }
    };

    const username = user.username;

    return (
        <div className="card" style={{ borderRadius: '8px', border: '1px solid #c9d7f1', boxShadow: 'none' }}>
            <div className="card-body" style={{ padding: '8px' }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={user.avatar}
                        alt="Avatar"
                        style={{ width: '100%', border: '1px solid #c9d7f1', padding: '2px', marginBottom: '8px', display: 'block', cursor: isMe ? 'pointer' : 'default', borderRadius: '4px' }}
                        onClick={() => isMe && setShowPhotoOptions(!showPhotoOptions)}
                    />
                    {showPhotoOptions && isMe && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, background: 'white', border: '1px solid #ccc', zIndex: 10, width: '100%', padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px' }}>
                            <a href={user.avatar} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: '#1155cc', padding: '2px', cursor: 'pointer' }}>ver foto</a>
                            <div style={{ textDecoration: 'none', color: '#1155cc', padding: '2px', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>alterar foto (upload)</div>
                            <div style={{ textDecoration: 'none', color: '#1155cc', padding: '2px', cursor: 'pointer' }} onClick={handleLinkUpdate}>alterar foto (link)</div>
                            <input type="file" accept=".jpg,.jpeg,.png" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileUpload} />
                        </div>
                    )}
                </div>

                <h1 style={{ fontSize: '12px', color: '#4883b1', marginBottom: '8px', fontWeight: 'bold' }}>
                    {user.username}
                </h1>

                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                    {user.details?.gender || user.gender || 'não especificado'}, {user.details?.relationship || 'solteiro(a)'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                    {user.city || ''}, {user.country || ''}
                </div>

                {!isMe && (
                    <>
                        <div style={{ borderTop: '1px solid #c9d7f1', margin: '8px 0' }}></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                            {!isPending && !isFriend && (
                                <div
                                    onClick={() => onAddFriend && onAddFriend()}
                                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', cursor: 'pointer' }}
                                >
                                    <Users size={12} color="#f9c" /> adicionar amigo(a)
                                </div>
                            )}
                            {isPending && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#888', cursor: 'default' }}>
                                    <Users size={12} color="#888" /> solicitação enviada
                                </div>
                            )}
                            {isFriend && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', cursor: 'default' }}>
                                    <Users size={12} color="#3cb371" /> amigos
                                </div>
                            )}
                            <Link
                                to={`/messages?userId=${encodeURIComponent(user.username)}`}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}
                            >
                                <span style={{ width: '14px', textAlign: 'center', color: '#1155cc' }}>📧</span> mandar mensagem
                            </Link>
                            <Link
                                to={`/testimonials/user/${encodeURIComponent(username)}?write=true`}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}
                            >
                                <span style={{ width: '14px', textAlign: 'center', color: '#cc0000' }}>⭐</span> criar depoimento
                            </Link>
                            <div
                                onClick={() => alert('Usuário denunciado. Nossa equipe analisará o perfil em breve.')}
                                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', cursor: 'pointer' }}
                            >
                                <span style={{ width: '14px', textAlign: 'center', color: '#cc0000' }}>⚠️</span> denunciar abuso
                            </div>
                            <div style={{ fontSize: '11px', color: '#4883b1', cursor: 'pointer' }}>mais »</div>
                        </div>
                    </>
                )}

                <div style={{ borderTop: '1px solid #c9d7f1', margin: '8px 0' }}></div>

                {/* Navigation Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={`/profile/${encodeURIComponent(username)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#0070bc' }}>👤</span> perfil
                    </Link>
                    <Link to={`/${encodeURIComponent(username)}/scraps`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#ffcc00' }}>📝</span> recados
                    </Link>
                    <Link to={`/${encodeURIComponent(username)}/photos`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#808080' }}>📷</span> fotos
                    </Link>
                    <Link to={`/${encodeURIComponent(username)}/videos`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#000' }}>🎞️</span> vídeos
                    </Link>
                    <Link to={`/testimonials/user/${encodeURIComponent(username)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#ff66aa' }}>✍️</span> depoimentos
                    </Link>
                    <Link to={`/profile/${encodeURIComponent(username)}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#33cc33' }}>📰</span> atualizações
                    </Link>
                    <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#4883b1', textDecoration: 'none' }}>
                        <span style={{ width: '14px', textAlign: 'center', color: '#9933cc' }}>📅</span> eventos
                    </Link>
                </div>
            </div>
        </div>
    );
}
