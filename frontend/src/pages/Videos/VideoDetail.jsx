import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import UserCard from '../../components/UserCard';

export default function VideoDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newComment, setNewComment] = useState('');
    const [owner, setOwner] = useState(null);

    const load = async () => {
        try {
            const { data } = await api.get(`/videos/${id}`);
            setVideo(data);

            // Get owner info
            const uRes = await api.get(`/users/${data.owner_id}`);
            setOwner(uRes.data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/videos/${id}/comments`, { body: newComment });
            setNewComment('');
            load();
        } catch (e) { alert('Erro ao comentar'); }
    };

    if (loading) return <div className="loading">Carregando vídeo...</div>;
    if (!video) return <div className="empty-state">Vídeo não encontrado.</div>;

    const isMe = owner?.id === user.id;

    // Helper for embedded YouTube
    const getEmbedUrl = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        const videoId = (match && match[2].length === 11) ? match[2] : null;
        if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        return null;
    };

    const embedUrl = getEmbedUrl(video.url);

    return (
        <div className="three-col">
            <div className="col-left">
                <UserCard user={owner} stats={owner?.stats} />
            </div>

            <div className="col-center">
                <div style={{ marginBottom: '10px' }}>
                    <Link to={`/${encodeURIComponent(owner?.username)}/videos`} style={{ color: '#1155cc', fontSize: '12px', textDecoration: 'none' }}>
                        « Voltar para os vídeos de {owner?.username}
                    </Link>
                </div>

                <div className="card" style={{ borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ background: 'white', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e4078' }}>{video.title}</span>
                    </div>
                    <div className="card-body" style={{ textAlign: 'center' }}>
                        {embedUrl ? (
                            <iframe
                                width="100%"
                                height="400"
                                src={embedUrl}
                                title={video.title}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ borderRadius: '4px', border: '1px solid #ddd' }}
                            ></iframe>
                        ) : (
                            <div style={{ background: '#000', color: 'white', padding: '100px 20px', borderRadius: '4px' }}>
                                <div style={{ fontSize: '24px', marginBottom: '15px' }}>🎬</div>
                                <div>Formato de vídeo não suportado para incorporação direta.</div>
                                <a href={video.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '20px', color: '#fff', textDecoration: 'underline' }}>
                                    Assistir na fonte original
                                </a>
                            </div>
                        )}

                        <div style={{ marginTop: '15px', textAlign: 'left', padding: '10px', background: '#f9f9f9', borderRadius: '4px' }}>
                            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e4078' }}>{video.title}</div>
                            <div style={{ fontSize: '11px', color: '#999', marginTop: '6px' }}>
                                {video.views} visualizações • Postada em {new Date(video.created_at).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card" style={{ marginTop: '16px', borderRadius: '8px', border: '1px solid #c9d7f1' }}>
                    <div className="card-header" style={{ background: 'white', borderBottom: '1px solid #f0f0f0' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e4078' }}>Comentários ({video.comments?.length || 0})</span>
                    </div>
                    <div className="card-body">
                        <div style={{ marginBottom: '20px' }}>
                            {video.comments?.map(c => (
                                <div key={c.id} style={{ display: 'flex', gap: '10px', padding: '10px 0', borderBottom: '1px dotted #ccc' }}>
                                    <Link to={`/profile/${encodeURIComponent(c.author_name)}`}>
                                        <img src={c.author_avatar} alt={c.author_name} style={{ width: '32px', height: '32px', borderRadius: '4px' }} />
                                    </Link>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                            <Link to={`/profile/${encodeURIComponent(c.author_name)}`} style={{ color: '#1155cc', textDecoration: 'none' }}>{c.author_name}</Link>
                                            <span style={{ fontWeight: 'normal', color: '#999', marginLeft: '10px', fontSize: '10px' }}>{new Date(c.created_at).toLocaleString()}</span>
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#333', marginTop: '4px' }}>{c.body}</div>
                                    </div>
                                </div>
                            ))}
                            {video.comments?.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#999', fontSize: '12px' }}>Ninguém comentou ainda.</div>}
                        </div>

                        <form onSubmit={handleComment} style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
                            <textarea
                                value={newComment}
                                onChange={e => setNewComment(e.target.value)}
                                placeholder="Escreva um comentário..."
                                style={{ width: '100%', padding: '8px', fontSize: '12px', minHeight: '60px', borderRadius: '4px', border: '1px solid #ccc', marginBottom: '8px' }}
                            />
                            <button type="submit" className="btn btn-pink btn-sm">Comentar</button>
                        </form>
                    </div>
                </div>
            </div>

            <div className="col-right">
                {/* Outros vídeos ou sugestões */}
            </div>
        </div>
    );
}
