import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/client';

const EMOJI_CATEGORIES = {
    '😀': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕'],
    '👋': ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🙏', '✍️', '💅', '🤳', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃'],
    '❤️': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️', '♦️', '♠️', '♣️'],
    '🎁': ['🎁', '🎀', '🎊', '🎉', '🎈', '🏆', '🥇', '⚽', '🏀', '🎮', '🎲', '🎵', '🎶', '🎤', '🎧', '🎸', '🎺', '🎻', '🥁', '🎹', '🍕', '🍔', '🍟', '🌮', '🍣', '🍜', '🍝', '🍰', '🍦', '☕', '🍺', '🍻', '🥂', '🍷', '🌸', '💮', '🌹', '🌺', '🌻', '🌼', '🌟', '✨', '🔥', '💥', '⚡', '🌈', '☀️', '🌙', '⭐'],
    '🌸': ['🌸', '💮', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🌱', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🌾', '🌵', '🎄', '🌲', '🌳', '🌴', '🌪️', '🌈', '⭐', '🌟', '💫', '✨', '🔥', '💥', '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '❄️', '☃️', '⛄', '🌬️', '💨', '🌊', '💧', '💦', '☔'],
    '🍎': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶️', '🫑', '🌽', '🥕', '🫒', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪'],
    '⚽': ['⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🥏', '🎾', '🥊', '🥋', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🪃', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛼', '🛷', '⛸️', '🥌', '🎿', '⛷️', '🏂', '🪂', '🏋️', '🤼', '🤸', '⛹️', '🤺', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🤽', '🚣', '🧗', '🚴', '🚵', '🎪', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🪘', '🎷', '🎺', '🪗', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🕹️', '🎰'],
    '🏳️': ['🏳️', '🏴', '🏴‍☠️', '🏁', '🚩', '🎌', '🏮', '🪕', '🇧🇷', '🇺🇸', '🇬🇧', '🇪🇸', '🇫🇷', '🇩🇪', '🇮🇹', '🇷🇺', '🇨🇳', '🇯🇵', '🇰🇷', '🇮🇳', '🇲🇽', '🇨🇦', '🇦🇺', '🇿🇦', '🇦🇷', '🇵🇹', '🇳🇱', '🇧🇪', '🇨🇭', '🇸🇪', '🇳🇴', '🇩🇰', '🇫🇮', '🇵🇱', '🇨🇿', '🇭🇺', '🇬🇷', '🇹🇷', '🇸🇦', '🇦🇪', '🇮🇱', '🇹🇭', '🇻🇳', '🇮🇩', '🇵🇭', '🇲🇾', '🇸🇬', '🇹🇼', '🇳🇿', '🇮🇪']
};

const GIF_CATEGORIES = {
    'Reactions': [
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        'https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif',
        'https://media.giphy.com/media/l41YtZOb9EUABnuqA/giphy.gif',
        'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        'https://media.giphy.com/media/l0HlHJGHe3yxV0nBC/giphy.gif',
        'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
        'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/3o6ozvv0zsJskzOCbW/giphy.gif'
    ],
    'Love': [
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
        'https://media.giphy.com/media/3o7TKO5OmXFuB8WMgM/giphy.gif',
        'https://media.giphy.com/media/25onB8W0WdMyJZPo0g/giphy.gif',
        'https://media.giphy.com/media/QuWKz3m6prafS/giphy.gif',
        'https://media.giphy.com/media/3o7btOh9hQdU7GXCgg/giphy.gif',
        'https://media.giphy.com/media/J0WtGU7W9knOo/giphy.gif',
        'https://media.giphy.com/media/l4FGlG3pVEOmK4vXG/giphy.gif',
        'https://media.giphy.com/media/l0MYv5n2lAWA0g3PM/giphy.gif',
        'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
        'https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif'
    ],
    'Happy': [
        'https://media.giphy.com/media/l378giAZgxPw2eO52/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        'https://media.giphy.com/media/J0WtGU7W9knOo/giphy.gif',
        'https://media.giphy.com/media/l4FGlG3pVEOmK4vXG/giphy.gif',
        'https://media.giphy.com/media/l3q2SH4Cmhh8lW9lO/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/3o6ozvv0zsJskzOCbW/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif'
    ],
    'Sad': [
        'https://media.giphy.com/media/l4FGqRcxMmC2Ezw4M/giphy.gif',
        'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        'https://media.giphy.com/media/l4FGlx4J6gQRAiwDe/giphy.gif',
        'https://media.giphy.com/media/xT8qBff8YmXCi08gOI/giphy.gif',
        'https://media.giphy.com/media/3o7btOHHBxZbNj9ERu/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRDvCpnEukXROM4/giphy.gif',
        'https://media.giphy.com/media/3o7TKO5OmXFuB8WMgM/giphy.gif',
        'https://media.giphy.com/media/l0HlHJGHe3yxV0nBC/giphy.gif',
        'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif'
    ],
    'Angry': [
        'https://media.giphy.com/media/l3q2Lh0MiAVH0bfkU/giphy.gif',
        'https://media.giphy.com/media/3o7btOSew4FuB7tNSg/giphy.gif',
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRDvCpnEukXROM4/giphy.gif',
        'https://media.giphy.com/media/3o7TKSjRrfIPjeiVyM/giphy.gif',
        'https://media.giphy.com/media/l3q2SH4Cmhh8lW9lO/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        'https://media.giphy.com/media/xT9IgzoKnwFNmISR8I/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif'
    ],
    'Celebration': [
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
        'https://media.giphy.com/media/3o7TKO5OmXFuB8WMgM/giphy.gif',
        'https://media.giphy.com/media/J0WtGU7W9knOo/giphy.gif',
        'https://media.giphy.com/media/l4FGlG3pVEOmK4vXG/giphy.gif',
        'https://media.giphy.com/media/l3q2SH4Cmhh8lW9lO/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/3o6ozvv0zsJskzOCbW/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif'
    ],
    'Yes': [
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/l0MYv5n2lAWA0g3PM/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif',
        'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        'https://media.giphy.com/media/J0WtGU7W9knOo/giphy.gif',
        'https://media.giphy.com/media/l4FGlG3pVEOmK4vXG/giphy.gif',
        'https://media.giphy.com/media/l3q2SH4Cmhh8lW9lO/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/3o6ozvv0zsJskzOCbW/giphy.gif'
    ],
    'WhatsApp': [
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif',
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif',
        'https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif',
        'https://media.giphy.com/media/l3q2SH4Cmhh8lW9lO/giphy.gif',
        'https://media.giphy.com/media/l0MYGb1LuZ3n7dRnO/giphy.gif',
        'https://media.giphy.com/media/g9582DNuQppxC/giphy.gif',
        'https://media.giphy.com/media/3o6ozvv0zsJskzOCbW/giphy.gif',
        'https://media.giphy.com/media/J0WtGU7W9knOo/giphy.gif',
        'https://media.giphy.com/media/l4FGlG3pVEOmK4vXG/giphy.gif',
        'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif'
    ]
};

export default function Messages() {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const [convos, setConvos] = useState([]);
    const [activeConvo, setActiveConvo] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMsg, setNewMsg] = useState('');
    const [loading, setLoading] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState('😀');
    const [activeGifCategory, setActiveGifCategory] = useState('Reactions');
    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const gifPickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
            if (gifPickerRef.current && !gifPickerRef.current.contains(event.target)) {
                setShowGifPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const loadConvos = async () => {
        try {
            const { data } = await api.get('/messages/conversations');
            setConvos(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadMessages = async (userId) => {
        try {
            const { data } = await api.get(`/messages/with/${userId}`);
            setMessages(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        loadConvos();
    }, []);

    useEffect(() => {
        const userIdParam = searchParams.get('userId');
        if (!userIdParam) {
            setActiveConvo(null);
            return;
        }

        // Try to find in existing convos
        const convo = convos.find(c => c.other_username === userIdParam || c.other_id === userIdParam);
        if (convo) {
            if (activeConvo?.other_id !== convo.other_id) {
                setActiveConvo(convo);
                loadMessages(convo.other_id);
            }
        } else if (!loading) {
            // Not in list, check if we're already trying to load this user as a placeholder
            if (activeConvo?.other_username === userIdParam || activeConvo?.other_id === userIdParam) {
                return;
            }

            const fetchAndStart = async () => {
                try {
                    const { data: otherUser } = await api.get(`/users/${encodeURIComponent(userIdParam)}`);
                    setActiveConvo({
                        other_id: otherUser.id,
                        other_name: otherUser.username,
                        other_username: otherUser.username,
                        other_avatar: otherUser.avatar,
                        placeholder: true
                    });
                    setMessages([]);
                } catch (e) {
                    console.error('Error fetching user for message:', e);
                }
            };
            fetchAndStart();
        }
    }, [searchParams, convos, loading, activeConvo]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const selectConvo = (c) => {
        setActiveConvo(c);
        loadMessages(c.other_id);
        setConvos(convos.map(co => co.other_id === c.other_id ? { ...co, unread: 0 } : co));
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMsg.trim() || !activeConvo) return;
        try {
            const { data } = await api.post('/messages', { receiver_id: activeConvo.other_id, body: newMsg });
            setMessages([...messages, data]);
            setNewMsg('');
            loadConvos();
        } catch (e) { alert('Erro ao enviar'); }
    };

    const sendGif = async (gifUrl) => {
        if (!activeConvo) return;
        try {
            const { data } = await api.post('/messages', { receiver_id: activeConvo.other_id, body: gifUrl, type: 'gif' });
            setMessages([...messages, data]);
            loadConvos();
        } catch (e) { alert('Erro ao enviar GIF'); }
        setShowGifPicker(false);
    };

    const addEmoji = (emoji) => {
        setNewMsg(prev => prev + emoji);
    };

    const isGifUrl = (url) => {
        return url && (url.includes('.gif') || url.includes('giphy') || url.includes('media.giphy.com'));
    };

    if (loading) return <div className="loading">Carregando mensagens...</div>;

    return (
        <div className="card" style={{ display: 'flex', height: '600px' }}>
            <div style={{ width: '280px', borderRight: '1px solid var(--gray-border)', display: 'flex', flexDirection: 'column' }}>
                <div className="card-header">Minhas Mensagens</div>
                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {convos.map(c => (
                        <div key={c.other_id} className={`convo-item ${activeConvo?.other_id === c.other_id ? 'active' : ''}`} onClick={() => selectConvo(c)}>
                            <img src={c.other_avatar} alt="Avatar" className="avatar avatar-md" />
                            <div className="convo-info">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="convo-name">{c.other_name}</div>
                                    {c.unread > 0 && <span className="badge" style={{ fontSize: '9px', padding: '2px 5px' }}>{c.unread}</span>}
                                </div>
                                <div className="convo-preview" style={{ fontWeight: c.unread > 0 ? 'bold' : 'normal', color: c.unread > 0 ? 'var(--text)' : 'inherit' }}>
                                    {c.last_message}
                                </div>
                            </div>
                        </div>
                    ))}
                    {convos.length === 0 && <div className="empty-state" style={{ padding: '20px 10px' }}>Nenhuma conversa iniciada.</div>}
                </div>
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FAFAFA' }}>
                {activeConvo ? (
                    <>
                        <div style={{ padding: '15px', borderBottom: '1px solid var(--gray-border)', background: 'white', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={activeConvo.other_avatar} alt="Avatar" className="avatar avatar-sm" />
                            <div>
                                <Link to={`/profile/${activeConvo.other_username}`} style={{ fontWeight: 'bold', fontSize: '14px', color: 'var(--text)' }}>
                                    {activeConvo.other_name}
                                </Link>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column' }}>
                            {messages.map(m => {
                                const isSentByMe = m.sender_id === user.id;
                                return (
                                    <div key={m.id} style={{ alignSelf: isSentByMe ? 'flex-end' : 'flex-start', maxWidth: '70%', marginBottom: '15px', display: 'flex', gap: '8px' }}>
                                        {!isSentByMe && <img src={m.sender_avatar} alt="Av" className="avatar avatar-sm" style={{ alignSelf: 'flex-end' }} />}
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isSentByMe ? 'flex-end' : 'flex-start' }}>
                                            {m.type === 'gif' || isGifUrl(m.body) ? (
                                                <img
                                                    src={m.body}
                                                    alt="gif"
                                                    style={{
                                                        maxWidth: '250px',
                                                        maxHeight: '250px',
                                                        borderRadius: '12px',
                                                        objectFit: 'contain',
                                                        background: '#fff'
                                                    }}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className={`msg-bubble ${isSentByMe ? 'sent' : 'recv'}`} style={{ margin: 0 }}>
                                                    {m.body}
                                                </div>
                                            )}
                                            <div className="msg-time">{new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{ position: 'relative', padding: '15px', background: 'white', borderTop: '1px solid var(--gray-border)' }}>
                            {showEmojiPicker && (
                                <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '60px', left: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '320px', maxHeight: '240px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                            <button key={cat} onClick={() => setActiveEmojiCategory(cat)} style={{ padding: '4px 6px', fontSize: '16px', background: activeEmojiCategory === cat ? '#d12b8f' : '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{cat}</button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', overflow: 'auto', maxHeight: '180px' }}>
                                        {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
                                            <button key={i} onClick={() => { addEmoji(emoji); setShowEmojiPicker(false); }} style={{ fontSize: '20px', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>{emoji}</button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {showGifPicker && (
                                <div ref={gifPickerRef} style={{ position: 'absolute', bottom: '60px', left: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '320px', maxHeight: '280px', overflow: 'auto' }}>
                                    <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                        {Object.keys(GIF_CATEGORIES).map(cat => (
                                            <button key={cat} onClick={() => setActiveGifCategory(cat)} style={{ padding: '4px 8px', fontSize: '10px', background: activeGifCategory === cat ? '#d12b8f' : '#eee', color: activeGifCategory === cat ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{cat}</button>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                        {GIF_CATEGORIES[activeGifCategory].map((gif, i) => (
                                            <img key={i} src={gif} alt="gif" onClick={() => sendGif(gif)} style={{ width: '90px', height: '90px', objectFit: 'cover', borderRadius: '4px', cursor: 'pointer', background: '#f0f0f0' }} loading="lazy" />
                                        ))}
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>😊</button>
                                <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', padding: '4px' }}>🎬</button>
                                <input
                                    type="text"
                                    placeholder="Digite sua mensagem..."
                                    value={newMsg}
                                    onChange={e => setNewMsg(e.target.value)}
                                    style={{ flex: 1, padding: '10px', fontSize: '13px' }}
                                />
                                <button type="submit" className="btn btn-pink" disabled={!newMsg.trim()}>Enviar</button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', flexDirection: 'column' }}>
                        <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
                        Selecione uma conversa para começar
                    </div>
                )}
            </div>
        </div>
    );
}
