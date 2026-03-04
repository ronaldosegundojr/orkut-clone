import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function TopicDetail() {
    const { id, topicId } = useParams();
    const { user } = useAuth();
    const [topic, setTopic] = useState(null);
    const [isMember, setIsMember] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            const [topicRes, commRes] = await Promise.all([
                api.get(`/communities/${id}/topics/${topicId}`),
                api.get(`/communities/${id}`)
            ]);
            setTopic(topicRes.data);
            setIsMember(commRes.data.isMember);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id, topicId]);

    const handleReply = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;
        try {
            await api.post(`/communities/${id}/topics/${topicId}/comments`, { body: newComment });
            setNewComment('');
            load();
        } catch (e) { alert('Erro'); }
    };

    if (loading) return <div className="loading">Carregando tópico...</div>;
    if (!topic) return <div className="empty-state">Tópico não encontrado</div>;

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to={`/communities/${id}`} style={{ color: 'white', textDecoration: 'underline' }}>Voltar para Comunidade</Link>
                <span>&raquo;</span>
                <span>{topic.title}</span>
            </div>

            <div className="card-body">
                {/* Original Post */}
                <div style={{ display: 'flex', gap: '15px', paddingBottom: '15px', borderBottom: '2px solid var(--pink-light)', marginBottom: '15px' }}>
                    <div style={{ width: '80px', textAlign: 'center', flexShrink: 0 }}>
                        <Link to={`/profile/${topic.author_username}`}>
                            <img src={topic.author_avatar} alt="Author" className="avatar avatar-md" style={{ display: 'block', margin: '0 auto' }} />
                            <div style={{ fontSize: '10px', marginTop: '4px', wordBreak: 'break-word' }}>{topic.author_name}</div>
                        </Link>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>{new Date(topic.created_at).toLocaleString()}</div>
                        <h2 style={{ fontSize: '14px', color: 'var(--pink)', marginBottom: '10px' }}>{topic.title}</h2>
                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{topic.body}</div>
                    </div>
                </div>

                {/* Responses */}
                <h3 className="section-title">Respostas ({topic.comments?.length || 0})</h3>

                {topic.comments?.map(c => (
                    <div key={c.id} style={{ display: 'flex', gap: '15px', padding: '15px 0', borderBottom: '1px dotted #ccc' }}>
                        <div style={{ width: '80px', textAlign: 'center', flexShrink: 0 }}>
                            <Link to={`/profile/${c.author_username}`}>
                                <img src={c.author_avatar} alt="Author" className="avatar avatar-md" style={{ display: 'block', margin: '0 auto' }} />
                                <div style={{ fontSize: '10px', marginTop: '4px', wordBreak: 'break-word' }}>{c.author_name}</div>
                            </Link>
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px' }}>{new Date(c.created_at).toLocaleString()}</div>
                            <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{c.body}</div>
                        </div>
                    </div>
                ))}
                {topic.comments?.length === 0 && <div className="empty-state">Seja o primeiro a responder!</div>}

                {/* Reply Form */}
                <div style={{ marginTop: '20px', background: 'var(--gray-light)', padding: '15px', borderRadius: '8px' }}>
                    {isMember ? (
                        <form onSubmit={handleReply}>
                            <h4 style={{ marginBottom: '10px' }}>Responder Tópico</h4>
                            <textarea placeholder="Escreva sua resposta..." value={newComment} onChange={e => setNewComment(e.target.value)} required style={{ marginBottom: '10px' }} />
                            <button type="submit" className="btn btn-pink">Enviar Resposta</button>
                        </form>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#666', fontSize: '11px' }}>
                            Você precisa participar da comunidade para responder tópicos.
                            <br /><br />
                            <Link to={`/communities/${id}`} className="btn btn-pink btn-sm">Voltar e Participar</Link>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
