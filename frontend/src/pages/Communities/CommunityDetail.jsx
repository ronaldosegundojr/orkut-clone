import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/client';

export default function CommunityDetail() {
    const { id } = useParams();
    const [comm, setComm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showTopicForm, setShowTopicForm] = useState(false);
    const [newTopic, setNewTopic] = useState({ title: '', body: '' });

    const load = async () => {
        try {
            const { data } = await api.get(`/communities/${id}`);
            setComm(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, [id]);

    const handleJoin = async () => {
        try {
            if (comm.isMember) await api.delete(`/communities/${id}/leave`);
            else await api.post(`/communities/${id}/join`);
            load();
        } catch (e) { alert('Erro'); }
    };

    const handleCreateTopic = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/communities/${id}/topics`, newTopic);
            setNewTopic({ title: '', body: '' });
            setShowTopicForm(false);
            load();
        } catch (e) { alert('Erro ao criar tópico'); }
    };

    if (loading) return <div className="loading">Carregando comunidade...</div>;
    if (!comm) return <div className="empty-state">Comunidade não encontrada</div>;

    return (
        <div className="two-col">
            {/* Left Column - Info */}
            <div className="col-left">
                <div className="card" style={{ textAlign: 'center' }}>
                    <div className="card-body">
                        <img src={comm.image} alt={comm.name} style={{ width: '100%', maxWidth: '200px', borderRadius: '8px', marginBottom: '10px' }} />
                        <h2 style={{ fontSize: '14px', marginBottom: '6px', color: '#1e4078' }}>{comm.name}</h2>
                        <Link to={`/communities/${id}/members`} style={{ fontSize: '11px', color: '#6695b3', textDecoration: 'none', display: 'block', marginBottom: '12px' }}>
                            ({comm.member_count} membros)
                        </Link>

                        <button className={`btn btn-full ${comm.isMember ? 'btn-gray' : 'btn-pink'}`} onClick={handleJoin} style={{ marginBottom: '15px' }}>
                            {comm.isMember ? 'Deixar comunidade' : 'Participar ( + )'}
                        </button>

                        <div style={{ textAlign: 'left', fontSize: '11px', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
                            <div style={{ marginBottom: '6px' }}><strong>Dono:</strong> <Link to={`/profile/${comm.owner_username}`}>{comm.owner_name}</Link></div>
                            <div style={{ marginBottom: '6px' }}><strong>Categoria:</strong> {comm.category}</div>
                            <div style={{ marginBottom: '6px' }}><strong>Criada em:</strong> {new Date(comm.created_at).toLocaleDateString()}</div>
                        </div>

                        <div style={{ marginTop: '15px', textAlign: 'left', borderTop: '1px dotted #ccc', paddingTop: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Link to={`/communities/${id}/members`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                    <strong style={{ fontSize: '11px', color: '#1e4078' }}>Membros ({comm.member_count})</strong>
                                </Link>
                                {comm.member_count > 9 && (
                                    <Link to={`/communities/${id}/members`} style={{ fontSize: '10px', color: '#1155cc' }}>Ver todos</Link>
                                )}
                            </div>
                            <div className="friends-grid-sidebar" style={{ marginTop: '8px' }}>
                                {comm.members.slice(0, 9).map(m => (
                                    <Link key={m.id} to={`/profile/${encodeURIComponent(m.username)}`} title={m.username} className="friend-item-sidebar">
                                        <img src={m.avatar} alt={m.username} />
                                        <span style={{ fontSize: '9px' }}>{m.username.split(' ')[0]}</span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column - Forum & Desc */}
            <div className="col-right">
                <div className="card" style={{ marginBottom: '12px' }}>
                    <div className="card-header">Descrição</div>
                    <div className="card-body" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                        {comm.description || 'Nenhuma descrição fornecida.'}
                    </div>
                </div>

                <div className="card">
                    <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Fórum ({comm.topics?.length || 0} tópicos)</span>
                        {comm.isMember && (
                            <button className="btn btn-sm" style={{ background: 'white', color: 'var(--pink)', border: 'none' }} onClick={() => setShowTopicForm(!showTopicForm)}>
                                Novo Tópico
                            </button>
                        )}
                    </div>
                    <div className="card-body">

                        {showTopicForm && comm.isMember && (
                            <form onSubmit={handleCreateTopic} style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid #ccc' }}>
                                <input type="text" placeholder="Título do tópico" value={newTopic.title} onChange={e => setNewTopic({ ...newTopic, title: e.target.value })} required style={{ marginBottom: '8px' }} />
                                <textarea placeholder="Mensagem" value={newTopic.body} onChange={e => setNewTopic({ ...newTopic, body: e.target.value })} required style={{ marginBottom: '8px' }} />
                                <button type="submit" className="btn btn-pink btn-sm">Criar Tópico</button>
                                <button type="button" className="btn btn-gray btn-sm" style={{ marginLeft: '6px' }} onClick={() => setShowTopicForm(false)}>Cancelar</button>
                            </form>
                        )}

                        {!comm.isMember && comm.topics.length > 0 && (
                            <div style={{ background: '#FFE8EC', padding: '8px', fontSize: '11px', color: '#cc0044', borderRadius: '4px', marginBottom: '10px', textAlign: 'center' }}>
                                Você precisa ser membro para participar do fórum.
                            </div>
                        )}

                        {comm.topics?.map(t => (
                            <div key={t.id} className="topic-item">
                                <Link to={`/communities/${id}/topics/${t.id}`} className="topic-title">{t.title}</Link>
                                <div className="topic-meta">
                                    Por: <Link to={`/profile/${t.author_username}`}>{t.author_name}</Link> • {t.comment_count} respostas • {new Date(t.created_at).toLocaleString()}
                                </div>
                            </div>
                        ))}
                        {comm.topics?.length === 0 && <div className="empty-state">Fórum vazio. Crie o primeiro tópico!</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
