import { Link } from 'react-router-dom';
import { Mail, Image, Film, Calendar, Users, Heart } from 'lucide-react';
import api from '../api/client';

export default function UserCard({ user, stats }) {
    if (!user) return null;

    return (
        <div className="card" style={{ borderRadius: 0, border: '1px solid #c9d7f1', boxShadow: 'none' }}>
            <div className="card-body" style={{ padding: '8px' }}>
                <img src={user.avatar} alt="Avatar" style={{ width: '100%', border: '1px solid #c9d7f1', padding: '2px', marginBottom: '8px', display: 'block' }} />

                <h2 style={{ fontSize: '12px', color: '#1155cc', marginBottom: '4px', wordBreak: 'break-word' }}>
                    » {user.username}
                </h2>

                <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                    {user.gender || 'feminino / masculino'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '8px' }}>
                    {user.country || 'Reino Unido'}
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
