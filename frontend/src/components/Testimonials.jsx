import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function Testimonials({ profileId, testimonials: initialTestimonials, isFriend, onUpdate }) {
    const { user: currentUser } = useAuth();
    const [testimonials, setTestimonials] = useState(initialTestimonials || []);
    const [showTestimonialForm, setShowTestimonialForm] = useState(false);
    const [testimonialText, setTestimonialText] = useState('');

    const handleSendTestimonial = async () => {
        if (!testimonialText.trim()) return;
        try {
            await api.post('/testimonials', { target_id: profileId, text: testimonialText });
            setTestimonialText('');
            setShowTestimonialForm(false);
            alert('Depoimento enviado! Aguarde aprovação do usuário.');
        } catch (e) {
            alert(e.response?.data?.error || 'Erro ao enviar depoimento');
        }
    };

    const isMe = currentUser?.id === profileId;

    return (
        <div className="card" style={{ marginBottom: '12px', borderRadius: 0, borderTopRightRadius: '16px', border: '1px solid #c9d7f1' }}>
            <div className="card-body" style={{ padding: '0' }}>
                <div className="profile-section-header" style={{ marginTop: 0 }}>
                    ✍️ DEPOIMENTOS ({testimonials.length})
                </div>
                <div style={{ padding: '15px' }}>
                    {!isMe && isFriend && !showTestimonialForm && (
                        <button onClick={() => setShowTestimonialForm(true)} className="btn btn-outline btn-sm" style={{ marginBottom: '15px' }}>
                            Escrever Depoimento
                        </button>
                    )}
                    {showTestimonialForm && (
                        <div style={{ marginBottom: '15px', padding: '10px', background: '#f9f9f9', borderRadius: '8px' }}>
                            <textarea
                                value={testimonialText}
                                onChange={(e) => setTestimonialText(e.target.value)}
                                placeholder="Escreva um depoimento especial para este amigo..."
                                style={{ width: '100%', padding: '8px', fontSize: '12px', minHeight: '80px', border: '1px solid #ddd', borderRadius: '4px' }}
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                                <button onClick={handleSendTestimonial} className="btn btn-pink btn-sm">Enviar</button>
                                <button onClick={() => { setShowTestimonialForm(false); setTestimonialText(''); }} className="btn btn-gray btn-sm">Cancelar</button>
                            </div>
                        </div>
                    )}
                    {testimonials.length === 0 ? (
                        <div style={{ textAlign: 'center', color: '#999', fontSize: '12px', padding: '20px' }}>
                            Nenhum depoimento ainda.
                        </div>
                    ) : (
                        testimonials.map(t => (
                            <div key={t.id} style={{ padding: '10px', borderBottom: '1px solid #eee', marginBottom: '8px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                                    <img src={t.author_avatar} alt={t.author_name} style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                                    <Link to={`/profile/${encodeURIComponent(t.author_username || t.author_id)}`} style={{ fontWeight: 'bold', fontSize: '12px', color: '#1155cc' }}>{t.author_name}</Link>
                                    <span style={{ fontSize: '10px', color: '#999' }}>• {new Date(t.created_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                                <p style={{ fontSize: '12px', color: '#333', margin: 0, lineHeight: '1.4' }}>{t.text}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
