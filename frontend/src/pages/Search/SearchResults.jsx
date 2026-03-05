import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../../api/client';

export default function SearchResults() {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const q = queryParams.get('q') || '';

    const [loading, setLoading] = useState(true);
    const [allResults, setAllResults] = useState([]);
    const [filteredResults, setFilteredResults] = useState([]);

    // Filters
    const [typeFilter, setTypeFilter] = useState('all'); // all, user, community
    const [cityFilter, setCityFilter] = useState('');
    const [stateFilter, setStateFilter] = useState('');
    const [countryFilter, setCountryFilter] = useState('');

    useEffect(() => {
        const fetchResults = async () => {
            if (!q) return;
            setLoading(true);
            try {
                const { data } = await api.get(`/users/search?q=${q}`);
                setAllResults(data);
                setFilteredResults(data);
            } catch (e) {
                console.error('Search error', e);
            } finally {
                setLoading(false);
            }
        };
        fetchResults();
    }, [q]);

    useEffect(() => {
        let results = [...allResults];

        if (typeFilter !== 'all') {
            results = results.filter(r => r.type === typeFilter);
        }

        if (cityFilter) {
            results = results.filter(r => r.city?.toLowerCase().includes(cityFilter.toLowerCase()));
        }

        if (stateFilter) {
            // Check state in details for users if needed, but city search route already handles some of this
            // For simplicity in this mockup, we check the city/country fields available
            results = results.filter(r =>
                (r.city?.toLowerCase().includes(stateFilter.toLowerCase())) ||
                (r.country?.toLowerCase().includes(stateFilter.toLowerCase()))
            );
        }

        if (countryFilter) {
            results = results.filter(r => r.country?.toLowerCase().includes(countryFilter.toLowerCase()));
        }

        setFilteredResults(results);
    }, [typeFilter, cityFilter, stateFilter, countryFilter, allResults]);

    if (loading) return <div className="loading">Pesquisando no Tukro...</div>;

    const usersCount = allResults.filter(r => r.type === 'user').length;
    const communitiesCount = allResults.filter(r => r.type === 'community').length;

    return (
        <div className="search-page-container" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '20px' }}>
            {/* Left Column: Filters */}
            <div className="filters-sidebar card" style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '14px', marginBottom: '15px', color: '#1155cc', borderBottom: '1px solid #c9d7f1', paddingBottom: '5px' }}>
                    Filtros
                </h3>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Tipo</label>
                    <select
                        value={typeFilter}
                        onChange={e => setTypeFilter(e.target.value)}
                        style={{ width: '100%', fontSize: '12px', padding: '4px' }}
                    >
                        <option value="all">Tudo ({allResults.length})</option>
                        <option value="user">Pessoas ({usersCount})</option>
                        <option value="community">Comunidades ({communitiesCount})</option>
                    </select>
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Cidade</label>
                    <input
                        type="text"
                        value={cityFilter}
                        onChange={e => setCityFilter(e.target.value)}
                        placeholder="Filtrar por cidade..."
                        style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #7a93b7' }}
                    />
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>Estado</label>
                    <input
                        type="text"
                        value={stateFilter}
                        onChange={e => setStateFilter(e.target.value)}
                        placeholder="Filtrar por estado..."
                        style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #7a93b7' }}
                    />
                </div>

                <div className="filter-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', marginBottom: '5px' }}>País</label>
                    <input
                        type="text"
                        value={countryFilter}
                        onChange={e => setCountryFilter(e.target.value)}
                        placeholder="Filtrar por país..."
                        style={{ width: '100%', fontSize: '11px', padding: '4px', border: '1px solid #7a93b7' }}
                    />
                </div>

                <button
                    className="btn btn-gray btn-sm"
                    style={{ width: '100%' }}
                    onClick={() => {
                        setTypeFilter('all');
                        setCityFilter('');
                        setStateFilter('');
                        setCountryFilter('');
                    }}
                >
                    Limpar Filtros
                </button>
            </div>

            {/* Right Column: Results */}
            <div className="results-main">
                <div className="card" style={{ marginBottom: '15px' }}>
                    <div className="card-header">
                        Resultados para: <span style={{ color: '#d12b8f' }}>"{q}"</span>
                        <span style={{ float: 'right', fontSize: '11px', fontWeight: 'normal' }}>
                            {filteredResults.length} Encontrado(s)
                        </span>
                    </div>
                </div>

                <div className="results-list">
                    {filteredResults.length === 0 ? (
                        <div className="card" style={{ padding: '30px', textAlign: 'center' }}>
                            <div style={{ fontSize: '14px', color: '#666' }}>
                                Nenhum resultado encontrado para sua pesquisa.
                            </div>
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '10px' }}>
                                Tente termos mais genéricos ou verifique a ortografia.
                            </div>
                        </div>
                    ) : (
                        filteredResults.map(item => (
                            <div key={item.id + item.type} className="card" style={{ marginBottom: '10px', padding: '10px' }}>
                                <div style={{ display: 'flex', gap: '15px' }}>
                                    <Link to={item.type === 'user' ? `/profile/${item.name}` : `/communities/${item.id}`}>
                                        <img
                                            src={item.avatar}
                                            alt={item.name}
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                border: '1px solid #c9d7f1',
                                                padding: '2px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    </Link>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Link
                                                to={item.type === 'user' ? `/profile/${item.name}` : `/communities/${item.id}`}
                                                style={{ fontWeight: 'bold', color: '#1155cc', textDecoration: 'none', fontSize: '14px' }}
                                            >
                                                {item.name}
                                            </Link>
                                            <span style={{
                                                fontSize: '10px',
                                                padding: '2px 6px',
                                                background: item.type === 'user' ? '#e8f0fe' : '#fce4ec',
                                                color: item.type === 'user' ? '#1155cc' : '#d12b8f',
                                                borderRadius: '10px',
                                                border: `1px solid ${item.type === 'user' ? '#c9d7f1' : '#f8bbd0'}`
                                            }}>
                                                {item.type === 'user' ? 'Pessoa' : 'Comunidade'}
                                            </span>
                                        </div>

                                        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                                            {item.city}{item.city && item.country ? ', ' : ''}{item.country}
                                        </div>

                                        <div style={{ fontSize: '12px', marginTop: '8px', color: '#333', fontStyle: item.type === 'user' ? 'italic' : 'normal' }}>
                                            {item.humor || (item.type === 'user' ? 'Sem frase de humor' : 'Sem descrição')}
                                        </div>

                                        {item.type === 'user' && (
                                            <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                                                <Link to={`/profile/${item.name}`} style={{ fontSize: '11px', color: '#1155cc' }}>ver perfil</Link>
                                                <Link to={`/scraps?to=${item.name}`} style={{ fontSize: '11px', color: '#1155cc' }}>enviar recado</Link>
                                            </div>
                                        )}
                                        {item.type === 'community' && (
                                            <div style={{ marginTop: '10px' }}>
                                                <Link to={`/communities/${item.id}`} style={{ fontSize: '11px', color: '#1155cc' }}>entrar na comunidade</Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
