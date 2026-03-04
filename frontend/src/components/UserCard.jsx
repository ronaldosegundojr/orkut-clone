import { Link } from 'react-router-dom';
import { Mail, Image, Film, Calendar, Users, Heart } from 'lucide-react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useState, useRef } from 'react';

export default function UserCard({ user, stats }) {
    const { user: currentUser, updateUser } = useAuth();
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const fileInputRef = useRef(null);

    if (!user) return null;
    const isMe = currentUser?.id === user?.id;

    const handlePhotoUpdate = async (avatarUrl) => {
        try {
            await api.put(`/users/${user.id}`, { avatar: avatarUrl });
            updateUser({ ...currentUser, avatar: avatarUrl });
            window.location.reload();
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

    return (
        <div className="card" style={{ borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
            <div className="card-body" style={{ padding: '8px' }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={user.avatar}
                        alt="Avatar"
                        style={{ width: '100%', border: '1px solid #c9d7f1', padding: '2px', marginBottom: '8px', display: 'block', cursor: isMe ? 'pointer' : 'default' }}
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

                <h2 style={{ fontSize: '12px', color: '#1155cc', marginBottom: '4px', wordBreak: 'break-word' }}>
                    » {user.username}
                </h2>

                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                    {user.details?.gender || user.gender || 'não especificado'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                    {user.country || ''}
                </div>

                <div style={{ borderTop: '1px solid #c9d7f1', margin: '8px 0' }}></div>

                {/* Simulated Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc', cursor: 'pointer' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>➕</span> + amigo
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc', cursor: 'pointer' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>⚠️</span> denunciar abuso
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #c9d7f1', margin: '8px 0' }}></div>

                {/* Navigation Menu */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <Link to={`/profile/${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>👤</span> perfil
                    </Link>
                    <Link to={`/scraps?to=${user.username}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>📝</span> recados
                    </Link>
                    <Link to={`/photos/user/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>📷</span> fotos
                    </Link>
                    <Link to={`/videos?user=${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>🎥</span> vídeos
                    </Link>
                    <Link to="/events" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#1155cc' }}>
                        <span style={{ width: '14px', textAlign: 'center' }}>📅</span> eventos
                    </Link>
                </div>
            </div>
        </div>
    );
}
