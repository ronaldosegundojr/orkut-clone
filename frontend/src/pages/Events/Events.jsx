import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';

export default function Events() {
    const { user } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [newEvent, setNewEvent] = useState({ name: '', description: '', date: '', location: '' });

    const load = async () => {
        try {
            const { data } = await api.get('/events');
            setEvents(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        try {
            await api.post('/events', newEvent);
            setNewEvent({ name: '', description: '', date: '', location: '' });
            setShowAdd(false);
            load();
        } catch (e) { alert('Erro ao criar evento'); }
    };

    const toggleParticipate = async (id) => {
        try {
            await api.post(`/events/${id}/participate`);
            load();
        } catch (e) { alert('Erro'); }
    };

    if (loading) return <div className="loading">Carregando eventos...</div>;

    return (
        <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Eventos ({events.length})</span>
                <button className="btn btn-outline btn-sm" style={{ background: 'white', color: 'var(--pink)', border: 'none' }} onClick={() => setShowAdd(!showAdd)}>
                    + Criar Evento
                </button>
            </div>

            <div className="card-body">

                {showAdd && (
                    <form style={{ marginBottom: '20px', padding: '15px', background: 'var(--gray-light)', borderRadius: '8px' }} onSubmit={handleAdd}>
                        <h4 style={{ marginBottom: '10px' }}>Novo Evento</h4>
                        <input type="text" placeholder="Nome do evento" value={newEvent.name} onChange={e => setNewEvent({ ...newEvent, name: e.target.value })} style={{ marginBottom: '10px' }} required />
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                            <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required style={{ flex: 1 }} />
                            <input type="text" placeholder="Local" value={newEvent.location} onChange={e => setNewEvent({ ...newEvent, location: e.target.value })} style={{ flex: 2 }} />
                        </div>
                        <textarea placeholder="Descrição" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} style={{ marginBottom: '10px' }} />
                        <button type="submit" className="btn btn-pink">Criar Evento</button>
                        <button type="button" className="btn btn-gray" style={{ marginLeft: '10px' }} onClick={() => setShowAdd(false)}>Cancelar</button>
                    </form>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {events.map(ev => (
                        <div key={ev.id} className="event-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="event-name" style={{ fontSize: '15px' }}>{ev.name}</div>
                                    <div className="event-meta">
                                        <span style={{ color: 'var(--pink)', fontWeight: 'bold' }}>📅 {new Date(ev.date).toLocaleDateString()}</span>
                                        <span>📍 {ev.location}</span>
                                    </div>
                                    <div style={{ fontSize: '12px', marginBottom: '10px', color: '#666', lineHeight: '1.4' }}>{ev.description}</div>
                                    <div style={{ fontSize: '10px', color: '#999' }}>
                                        Criado por <Link to={`/profile/${ev.owner_username}`}>{ev.owner_name}</Link> • {ev.participant_count} participantes
                                    </div>
                                </div>
                                <div style={{ width: '120px', textAlign: 'center' }}>
                                    <img src={ev.owner_avatar} alt="Org" className="avatar avatar-md" style={{ marginBottom: '8px' }} />
                                    <button className={`btn btn-full ${ev.isParticipating ? 'btn-gray' : 'btn-pink'}`} onClick={() => toggleParticipate(ev.id)}>
                                        {ev.isParticipating ? 'Desconfirmar' : 'Vou!'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {events.length === 0 && <div className="empty-state">Nenhum evento futuro marcado.</div>}
                </div>

            </div>
        </div>
    );
}
