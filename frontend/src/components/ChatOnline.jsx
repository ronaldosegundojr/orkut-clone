import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';
import { StatusSelector, STATUS_OPTIONS } from './StatusSelector';
import { Settings, Trash2, ShieldOff, MessageSquare } from 'lucide-react';

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
        'https://media.giphy.com/media/QuWKz3m6frafS/giphy.gif',
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
    'Surprised': [
        'https://media.giphy.com/media/3o7TKU8aVJm5rjmh2Q/giphy.gif',
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/l0MYv5n2lAWA0g3PM/giphy.gif',
        'https://media.giphy.com/media/l4FGlx4J6gQRAiwDe/giphy.gif',
        'https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif',
        'https://media.giphy.com/media/3o7btOHHBxZbNj9ERu/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRDvCpnEukXROM4/giphy.gif',
        'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
        'https://media.giphy.com/media/3o7TKO5OmXFuB8WMgM/giphy.gif',
        'https://media.giphy.com/media/l0HlHJGHe3yxV0nBC/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
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
    'Thinking': [
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/l3q2Lh0MiAVH0bfkU/giphy.gif',
        'https://media.giphy.com/media/3o7btOSew4FuB7tNSg/giphy.gif',
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
    'Cool': [
        'https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif',
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
        'https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif'
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
    'No': [
        'https://media.giphy.com/media/3o7btPKj25Rnbh73HO/giphy.gif',
        'https://media.giphy.com/media/3o7btOSew4FuB7tNSg/giphy.gif',
        'https://media.giphy.com/media/l3q2Lh0MiAVH0bfkU/giphy.gif',
        'https://media.giphy.com/media/l4FGlx4J6gQRAiwDe/giphy.gif',
        'https://media.giphy.com/media/xT8qBff8YmXCi08gOI/giphy.gif',
        'https://media.giphy.com/media/3o7btOHHBxZbNj9ERu/giphy.gif',
        'https://media.giphy.com/media/l4FGuhL4U2WyjdkaY/giphy.gif',
        'https://media.giphy.com/media/26BRDvCpnEukXROM4/giphy.gif',
        'https://media.giphy.com/media/l3q2XhfQ8oCkm1Ts4/giphy.gif',
        'https://media.giphy.com/media/3o7TKO5OmXFuB8WMgM/giphy.gif',
        'https://media.giphy.com/media/l0HlHJGHe3yxV0nBC/giphy.gif',
        'https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif'
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

function ChatWindow({ friend, onClose, onExpand, mode, onChangeMode }) {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [activeEmojiCategory, setActiveEmojiCategory] = useState('😀');
    const [activeGifCategory, setActiveGifCategory] = useState('Reactions');
    const { user: currentUser } = useAuth();
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

    useEffect(() => {
        if (mode === 'minimized') return;
        const fetchMessages = async () => {
            try {
                const res = await api.get(`/messages/with/${friend.id}`);
                setMessages(res.data);
            } catch (e) { console.error(e); }
        };
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [friend.id, mode]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (content, type = 'text') => {
        if (!content.trim()) return;
        setLoading(true);
        try {
            const res = await api.post('/messages', { receiver_id: friend.id, body: content, type });
            setMessages(prev => [...prev, res.data]);
            if (type === 'text') setNewMessage('');
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const handleSend = (e) => {
        e.preventDefault();
        sendMessage(newMessage, 'text');
    };

    const addEmoji = (emoji) => {
        setNewMessage(prev => prev + emoji);
    };

    const addGif = (gifUrl) => {
        sendMessage(gifUrl, 'gif');
        setShowGifPicker(false);
    };

    const isGifUrl = (url) => {
        return url && (url.includes('.gif') || url.includes('giphy') || url.includes('media.giphy.com'));
    };

    if (mode === 'minimized') {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px 12px',
                background: '#f8f8f8',
                borderBottom: '1px solid #ddd',
                cursor: 'pointer',
                gap: '8px',
                borderRadius: '8px 8px 0 0',
                minWidth: '180px'
            }}
                onClick={() => onChangeMode('medium')}
            >
                <img src={friend.avatar} alt={friend.username} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                <span style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {friend.username}
                </span>
                <button onClick={(e) => { e.stopPropagation(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', color: '#666' }}>×</button>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: mode === 'medium' ? '320px' : '420px',
            background: 'white',
            border: '1px solid #ddd',
            borderRadius: '8px',
            overflow: 'hidden'
        }}>
            <div style={{
                padding: '8px 12px',
                background: '#1155cc',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                fontWeight: 'bold'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={friend.avatar} alt={friend.username} style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                    <span>{friend.username}</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => onChangeMode('minimized')} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '10px' }} title="Minimizar">▼</button>
                    <button onClick={onExpand} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '10px' }} title="Abrir na página">↗</button>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '14px' }}>×</button>
                </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '8px', background: '#f5f5f5' }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.sender_id === currentUser.id ? 'flex-end' : 'flex-start',
                        marginBottom: '8px'
                    }}>
                        {msg.type === 'gif' || isGifUrl(msg.body) ? (
                            <img
                                src={msg.body}
                                alt="gif"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '200px',
                                    borderRadius: '12px',
                                    objectFit: 'contain',
                                    background: '#fff'
                                }}
                                loading="lazy"
                            />
                        ) : (
                            <div style={{
                                maxWidth: '80%',
                                padding: '8px 12px',
                                borderRadius: '16px',
                                background: msg.sender_id === currentUser.id ? '#1155cc' : 'white',
                                color: msg.sender_id === currentUser.id ? 'white' : '#333',
                                fontSize: '13px',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                wordBreak: 'break-word'
                            }}>
                                {msg.body}
                            </div>
                        )}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ position: 'relative', borderTop: '1px solid #ddd', background: 'white' }}>
                {showEmojiPicker && (
                    <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '50px', left: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '300px', maxHeight: '220px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {Object.keys(EMOJI_CATEGORIES).map(cat => (
                                <button key={cat} onClick={() => setActiveEmojiCategory(cat)} style={{ padding: '4px 6px', fontSize: '16px', background: activeEmojiCategory === cat ? '#1155cc' : '#eee', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{cat}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', overflow: 'auto', maxHeight: '160px' }}>
                            {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji, i) => (
                                <button key={i} onClick={() => { addEmoji(emoji); setShowEmojiPicker(false); }} style={{ fontSize: '20px', padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }}>{emoji}</button>
                            ))}
                        </div>
                    </div>
                )}

                {showGifPicker && (
                    <div ref={gifPickerRef} style={{ position: 'absolute', bottom: '50px', left: '10px', background: 'white', border: '1px solid #ddd', borderRadius: '8px', padding: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10, width: '300px', maxHeight: '280px', overflow: 'auto' }}>
                        <div style={{ display: 'flex', gap: '4px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            {Object.keys(GIF_CATEGORIES).map(cat => (
                                <button key={cat} onClick={() => setActiveGifCategory(cat)} style={{ padding: '4px 8px', fontSize: '10px', background: activeGifCategory === cat ? '#1155cc' : '#eee', color: activeGifCategory === cat ? 'white' : '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>{cat}</button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                            {GIF_CATEGORIES[activeGifCategory].map((gif, i) => (
                                <img
                                    key={i}
                                    src={gif}
                                    alt="gif"
                                    onClick={() => addGif(gif)}
                                    style={{
                                        width: '85px',
                                        height: '85px',
                                        objectFit: 'cover',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        background: '#f0f0f0'
                                    }}
                                    loading="lazy"
                                />
                            ))}
                        </div>
                    </div>
                )}

                <form onSubmit={handleSend} style={{ display: 'flex', alignItems: 'center', padding: '8px', gap: '4px' }}>
                    <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>😊</button>
                    <button type="button" onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }} style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', padding: '4px' }}>🎬</button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        style={{ flex: 1, padding: '8px', border: '1px solid #ddd', borderRadius: '16px', fontSize: '12px', outline: 'none' }}
                        disabled={loading}
                    />
                    <button type="submit" disabled={loading || !newMessage.trim()} style={{ background: 'none', border: 'none', cursor: loading ? 'default' : 'pointer', fontSize: '18px', color: '#1155cc' }}>➤</button>
                </form>
            </div>
        </div>
    );
}

export default function ChatOnline() {
    const { user: currentUser } = useAuth();
    const [friends, setFriends] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [isMainOpen, setIsMainOpen] = useState(true);
    const [openChats, setOpenChats] = useState({});
    const [userStatus, setUserStatus] = useState('online');
    const [showSettings, setShowSettings] = useState(false);
    const [isChatDisabled, setIsChatDisabled] = useState(false);
    const navigate = useNavigate();
    const settingsRef = useRef(null);
    const inactivityTimer = useRef(null);

    const STATUS_OPTIONS = [
        { value: 'online', label: 'Online', color: '#4caf50', description: 'Verde' },
        { value: 'away', label: 'Ausente', color: '#ff9800', description: 'Laranja' },
        { value: 'busy', label: 'Ocupado', color: '#f44336', description: 'Vermelho' },
        { value: 'invisible', label: 'Invisível', color: '#9e9e9e', description: 'Cinza' }
    ];

    const resetInactivityTimer = () => {
        if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
        if (userStatus !== 'invisible') {
            setUserStatus('online');
            inactivityTimer.current = setTimeout(() => {
                setUserStatus('away');
            }, 5 * 60 * 1000);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setShowSettings(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!currentUser || isChatDisabled) return;

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, resetInactivityTimer);
        });

        resetInactivityTimer();

        return () => {
            if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
            events.forEach(event => {
                document.removeEventListener(event, resetInactivityTimer);
            });
        };
    }, [currentUser, userStatus]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                const convRes = await api.get('/messages/conversations');
                setConversations(convRes.data.slice(0, 10));

                const friendsRes = await api.get(`/friends/${currentUser.id}`);
                const uniqueFriends = [];
                const seenIds = new Set();
                friendsRes.data.forEach(f => {
                    if (!seenIds.has(f.id) && f.id !== currentUser.id) {
                        seenIds.add(f.id);
                        uniqueFriends.push(f);
                    }
                });
                setFriends(uniqueFriends.slice(0, 10));
            } catch (e) {
                console.error('Erro chat', e);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    if (!currentUser) return null;

    const openChatsList = Object.entries(openChats);

    const openChat = (friend, mode = 'minimized') => {
        setOpenChats(prev => ({ ...prev, [friend.id]: { ...friend, mode } }));
    };

    const closeChat = (friendId) => {
        setOpenChats(prev => {
            const newChats = { ...prev };
            delete newChats[friendId];
            return newChats;
        });
    };

    const changeChatMode = (friendId, mode) => {
        setOpenChats(prev => ({ ...prev, [friendId]: { ...prev[friendId], mode } }));
    };

    const expandChat = (friendId) => {
        navigate(`/messages?userId=${friendId}`);
    };

    const clearAllChats = async () => {
        if (!window.confirm('Tem certeza que deseja limpar todo o histórico de conversas?')) return;
        try {
            await api.delete('/messages/all');
            setConversations([]);
            setOpenChats({});
            setShowSettings(false);
            alert('Histórico de conversas limpo com sucesso.');
        } catch (e) {
            console.error(e);
            alert('Erro ao limpar conversas.');
        }
    };

    if (isChatDisabled) {
        return (
            <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000 }}>
                <div
                    onClick={() => setIsChatDisabled(false)}
                    style={{ background: '#1155cc', color: 'white', padding: '10px', borderRadius: '50%', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
                    title="Ativar Chat"
                >
                    <MessageSquare size={24} />
                </div>
            </div>
        );
    }

    return (
        <div style={{ position: 'fixed', right: '20px', bottom: '20px', zIndex: 1000, display: 'flex', flexDirection: 'row-reverse', alignItems: 'flex-end', gap: '10px' }}>
            <div style={{
                width: '280px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1px solid #ddd',
                overflow: 'hidden'
            }}>
                <div
                    style={{
                        padding: '12px',
                        background: '#1155cc',
                        color: 'white',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontWeight: 'bold',
                        fontSize: '13px',
                        cursor: 'pointer'
                    }}
                    onClick={() => setIsMainOpen(!isMainOpen)}
                >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <StatusSelector
                            status={userStatus}
                            onStatusChange={(newStatus) => {
                                setUserStatus(newStatus);
                                if (newStatus !== 'invisible') {
                                    resetInactivityTimer();
                                }
                            }}
                        />
                        Amigos ({friends.length})
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ position: 'relative' }} ref={settingsRef}>
                            <Settings
                                size={16}
                                style={{ cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowSettings(!showSettings);
                                }}
                            />
                            {showSettings && (
                                <div style={{ position: 'absolute', bottom: '100%', right: 0, background: 'white', border: '1px solid #ddd', borderRadius: '4px', padding: '4px', width: '150px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: '#333', fontSize: '11px', fontWeight: 'normal', marginBottom: '10px' }}>
                                    <div
                                        style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={(e) => { e.stopPropagation(); setIsChatDisabled(true); setShowSettings(false); }}
                                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <ShieldOff size={14} /> Desativar chat
                                    </div>
                                    <div
                                        style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        onClick={(e) => { e.stopPropagation(); clearAllChats(); }}
                                        onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                                        onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                        <Trash2 size={14} /> Limpar todos os chats
                                    </div>
                                </div>
                            )}
                        </div>
                        <span>{isMainOpen ? '▼' : '▲'}</span>
                    </div>
                </div>

                {isMainOpen && (
                    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                        {friends.length === 0 && conversations.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
                                Nenhum amigo ainda
                            </div>
                        ) : (
                            <>
                                {friends.length > 0 && (
                                    <div style={{ padding: '8px 12px', fontSize: '10px', color: '#888', borderBottom: '1px solid #eee' }}>
                                        AMIGOS
                                    </div>
                                )}
                                {friends.map(u => (
                                    <div
                                        key={u.id}
                                        onClick={() => openChat(u, 'medium')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            color: '#333',
                                            gap: '8px',
                                            borderBottom: '1px solid #f5f5f5'
                                        }}
                                    >
                                        <div style={{ position: 'relative' }}>
                                            <img
                                                src={u.avatar}
                                                alt={u.username}
                                                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '0',
                                                right: '0',
                                                width: '8px',
                                                height: '8px',
                                                background: '#4caf50',
                                                borderRadius: '50%',
                                                border: '2px solid white'
                                            }} />
                                        </div>
                                        <div style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {u.username}
                                        </div>
                                    </div>
                                ))}

                                {conversations.length > 0 && (
                                    <div style={{ padding: '8px 12px', fontSize: '10px', color: '#888', borderBottom: '1px solid #eee', borderTop: '1px solid #eee' }}>
                                        RECENTES
                                    </div>
                                )}
                                {conversations.filter(c => !friends.find(f => f.id === c.other_id)).map(c => (
                                    <div
                                        key={c.other_id}
                                        onClick={() => openChat({ id: c.other_id, username: c.other_name, avatar: c.other_avatar }, 'medium')}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '8px 12px',
                                            cursor: 'pointer',
                                            color: '#333',
                                            gap: '8px',
                                            borderBottom: '1px solid #f5f5f5'
                                        }}
                                    >
                                        <img
                                            src={c.other_avatar}
                                            alt={c.other_name}
                                            style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div style={{ flex: 1, fontSize: '12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {c.other_name}
                                        </div>
                                        {c.unread > 0 && (
                                            <div style={{
                                                background: '#1155cc',
                                                color: 'white',
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                borderRadius: '10px'
                                            }}>
                                                {c.unread}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'row-reverse', gap: '10px' }}>
                {openChatsList.map(([friendId, chat]) => (
                    <div key={friendId} style={{
                        position: 'relative',
                        transition: 'all 0.3s ease'
                    }}>
                        <ChatWindow
                            friend={chat}
                            mode={chat.mode}
                            onClose={() => closeChat(friendId)}
                            onExpand={() => expandChat(friendId)}
                            onChangeMode={(mode) => changeChatMode(friendId, mode)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
