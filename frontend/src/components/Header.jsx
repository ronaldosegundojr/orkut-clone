import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search } from 'lucide-react';
import { useState } from 'react';
import api from '../api/client';

export default function Header() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [q, setQ] = useState('');
    const [results, setResults] = useState([]);
    const [showResults, setShowResults] = useState(false);

    const performFullSearch = () => {
        if (q.trim()) {
            setShowResults(false);
            navigate(`/search?q=${encodeURIComponent(q)}`);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            performFullSearch();
        }
    };

    const handleSearch = async (e) => {
        const term = e.target.value;
        setQ(term);
        if (term.length > 2) {
            const { data } = await api.get(`/users/search?q=${term}`);
            setResults(data);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    if (!user) return null;

    return (
        <header style={{ background: '#d4dded', position: 'relative', zIndex: 10, borderBottom: '1px solid #c9d7f1' }}>
            <div className="page-layout" style={{ display: 'flex', alignItems: 'stretch', padding: '0', height: '36px' }}>

                {/* Logo Area (White) */}
                <div style={{ background: 'white', width: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '12px' }}>
                    <Link to="/" style={{ color: '#d12b8f', textDecoration: 'none', fontWeight: 'bold', fontSize: '24px', letterSpacing: '-1px', fontFamily: 'Arial, sans-serif' }}>
                        tukro<span style={{ fontSize: '12px', color: '#c9d7f1' }}>.com</span>
                    </Link>
                </div>

                {/* Navigation Area (Blue) */}
                <div style={{ flex: 1, background: '#8da5c9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 15px', borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}>
                    <nav style={{ display: 'flex', gap: '15px', fontSize: '11px', fontWeight: 'bold' }}>
                        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Início</Link>
                        <Link to={`/profile/${user.username}`} style={{ color: 'white', textDecoration: 'none' }}>Perfil</Link>
                        <Link to="/scraps" style={{ color: 'white', textDecoration: 'none' }}>Página de recados</Link>
                        <Link to="/friends" style={{ color: 'white', textDecoration: 'none' }}>Amigos</Link>
                        <Link to="/communities" style={{ color: 'white', textDecoration: 'none' }}>Comunidades</Link>
                    </nav>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <span style={{ color: 'white', fontSize: '11px', cursor: 'pointer' }} onClick={logout}>Sair</span>

                        {/* Search */}
                        <div style={{ position: 'relative' }}>
                            <div style={{ display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #7a93b7', padding: '2px' }}>
                                <input
                                    type="text"
                                    placeholder="pesquisa do tukro"
                                    value={q}
                                    onChange={handleSearch}
                                    onKeyDown={handleKeyPress}
                                    onBlur={() => setTimeout(() => setShowResults(false), 200)}
                                    style={{ border: 'none', outline: 'none', fontSize: '11px', padding: '2px 4px', width: '130px', margin: 0 }}
                                />
                                <div
                                    style={{ background: '#d4dded', padding: '2px 6px', cursor: 'pointer', border: '1px solid #a3b2cc' }}
                                    onClick={performFullSearch}
                                >
                                    <Search size={10} color="#000" />
                                </div>
                            </div>

                            {showResults && results.length > 0 && (
                                <div className="search-results">
                                    {results.map(r => (
                                        <Link to={r.type === 'user' ? `/profile/${r.name}` : `/communities/${r.id}`} key={r.id + r.type} className="search-result-item" style={{ color: 'inherit' }}>
                                            <img src={r.avatar} alt={r.name} className="avatar avatar-sm" style={{ width: '30px', height: '30px', borderRadius: 0, border: '1px solid var(--gray-border)' }} />
                                            <div>
                                                <div style={{ fontWeight: 'bold', fontSize: '11px' }}>{r.name} {r.type === 'community' && '(Comunidade)'}</div>
                                                <div style={{ fontSize: '10px', color: '#666' }}>{r.city ? `${r.city}, ` : ''}{r.country}</div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </header>
    );
}
