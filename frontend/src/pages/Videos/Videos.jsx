import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../../api/client';

export default function Videos() {
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newVideo, setNewVideo] = useState({ url: '', title: '' });

    const load = async () => {
        try {
            const { data } = await api.get(`/videos/user/${user.id}`);
            setVideos(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/videos', newVideo);
            setNewVideo({ url: '', title: '' });
            setShowAdd(false);
            load();
        } catch (e) { alert('Erro ao adicionar vídeo'); }
    };

    if (loading) return <div className="loading">Carregando vídeos...</div>;

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Meus Vídeos ({videos.length})</span>
                <button className="btn btn-outline btn-sm" style={{ background: 'white', color: 'var(--pink)', border: 'none' }} onClick={() => setShowAdd(!showAdd)}>
                    + Adicionar Vídeo
                </button>
            </div>

            <div className="card-body">

                {showAdd && (
                    <form style={{ marginBottom: '20px', padding: '15px', background: 'var(--gray-light)', borderRadius: '8px' }} onSubmit={handleAdd}>
                        <h4 style={{ marginBottom: '10px' }}>Adicionar Vídeo (YouTube, Vimeo, etc)</h4>
                        <input type="url" placeholder="URL do vídeo (ex: https://youtube.com/watch...)" value={newVideo.url} onChange={e => setNewVideo({ ...newVideo, url: e.target.value })} style={{ marginBottom: '10px' }} required />
                        <input type="text" placeholder="Título" value={newVideo.title} onChange={e => setNewVideo({ ...newVideo, title: e.target.value })} style={{ marginBottom: '10px' }} required />
                        <button type="submit" className="btn btn-pink">Adicionar</button>
                        <button type="button" className="btn btn-gray" style={{ marginLeft: '10px' }} onClick={() => setShowAdd(false)}>Cancelar</button>
                    </form>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px' }}>
                    {videos.map(v => {
                        // Basic youtube thumbnail extractor
                        let thumbUrl = 'https://via.placeholder.com/300x169?text=Video';
                        if (v.url.includes('youtube.com/watch?v=')) {
                            const id = v.url.split('v=')[1].split('&')[0];
                            thumbUrl = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                        } else if (v.url.includes('youtu.be/')) {
                            const id = v.url.split('youtu.be/')[1].split('?')[0];
                            thumbUrl = `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
                        }

                        return (
                            <div key={v.id} className="video-card">
                                <a href={v.url} target="_blank" rel="noreferrer" style={{ display: 'block', position: 'relative' }}>
                                    <img src={thumbUrl} alt="Video Thumbnail" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: '4px', marginBottom: '8px' }} />
                                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.6)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>▶</div>
                                </a>
                                <div className="video-title">{v.title}</div>
                                <div className="video-meta">
                                    {v.views} views • {v.comment_count} comentários • Adicionado em {new Date(v.created_at).toLocaleDateString()}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {videos.length === 0 && <div className="empty-state">Nenhum vídeo adicionado.</div>}

            </div>
        </div>
    );
}
