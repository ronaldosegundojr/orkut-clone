import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Photos() {
    const { username } = useParams();
    const { user } = useAuth();
    const targetQuery = username || user.username;

    const [photos, setPhotos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [targetUser, setTargetUser] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [newPhoto, setNewPhoto] = useState({ url: '', caption: '', album: 'Geral' });

    const load = async () => {
        try {
            const [photoRes, userRes] = await Promise.all([
                api.get(`/photos/user/${targetQuery}`),
                api.get(`/users/${targetQuery}`)
            ]);
            setPhotos(photoRes.data);
            setTargetUser(userRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [targetQuery]);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/photos', newPhoto);
            setNewPhoto({ url: '', caption: '', album: 'Geral' });
            setShowAdd(false);
            load();
        } catch (e) { alert('Erro ao adicionar foto'); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Excluir esta foto?')) return;
        try {
            await api.delete(`/photos/${id}`);
            load();
        } catch (e) { alert('Erro'); }
    };

    if (loading) return <div className="loading">Carregando fotos...</div>;

    const isMe = targetUser?.id === user.id;

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Álbum de Fotos de {isMe ? 'Mim' : targetUser?.username}</span>
                {isMe && (
                    <button className="btn btn-outline btn-sm" style={{ background: 'white', color: 'var(--pink)', border: 'none' }} onClick={() => setShowAdd(!showAdd)}>
                        + Adicionar Foto
                    </button>
                )}
            </div>

            <div className="card-body">

                {showAdd && isMe && (
                    <form style={{ marginBottom: '20px', padding: '15px', background: 'var(--gray-light)', borderRadius: '8px' }} onSubmit={handleAdd}>
                        <h4 style={{ marginBottom: '10px' }}>Adicionar Foto</h4>
                        <input type="url" placeholder="URL da foto (ex: https://site.com/foto.jpg)" value={newPhoto.url} onChange={e => setNewPhoto({ ...newPhoto, url: e.target.value })} style={{ marginBottom: '10px' }} required />
                        <input type="text" placeholder="Álbum" value={newPhoto.album} onChange={e => setNewPhoto({ ...newPhoto, album: e.target.value })} style={{ marginBottom: '10px' }} />
                        <textarea placeholder="Legenda (opcional)" value={newPhoto.caption} onChange={e => setNewPhoto({ ...newPhoto, caption: e.target.value })} style={{ marginBottom: '10px' }} />
                        <button type="submit" className="btn btn-pink">Adicionar</button>
                        <button type="button" className="btn btn-gray" style={{ marginLeft: '10px' }} onClick={() => setShowAdd(false)}>Cancelar</button>
                    </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {photos.map(p => (
                        <div key={p.id} style={{ border: '1px solid var(--gray-border)', borderRadius: 'var(--radius)', overflow: 'hidden' }}>
                            <div style={{ aspectRatio: '4/3', width: '100%', background: '#eee' }}>
                                <img src={p.url} alt="Foto" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <div style={{ padding: '10px' }}>
                                <div style={{ fontSize: '11px', color: '#666', marginBottom: '6px' }}>Álbum: {p.album}</div>
                                <div style={{ fontSize: '12px', marginBottom: '8px' }}>{p.caption || 'Sem legenda'}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '10px', color: '#999' }}>{p.comment_count} comentários</span>
                                    {isMe && <button style={{ fontSize: '10px', background: 'none', border: 'none', color: '#cc0044', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => handleDelete(p.id)}>Excluir</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {photos.length === 0 && <div className="empty-state">Nenhuma foto no álbum.</div>}
            </div>
        </div>
    );
}
