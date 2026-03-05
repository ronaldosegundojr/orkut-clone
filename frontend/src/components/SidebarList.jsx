import { Link } from 'react-router-dom';

export default function SidebarList({ title, items, count, viewAllLink, type = 'friends' }) {
    return (
        <div className="card" style={{ marginBottom: '12px', borderRadius: '8px', border: '1px solid #c9d7f1', boxShadow: 'none' }}>
            <div className="card-header" style={{ background: 'white', padding: '10px', display: 'flex', gap: '4px', borderBottom: 'none' }}>
                <span className="sidebar-title" style={{ fontSize: '13px', fontWeight: 'bold', color: '#1e4078' }}>{title}</span>
                <Link to={viewAllLink} className="sidebar-count" style={{ fontSize: '13px', color: '#6695b3', textDecoration: 'none' }}>({count})</Link>
            </div>
            <div className="card-body" style={{ padding: '8px' }}>
                <div style={{ marginBottom: '12px', display: 'flex', background: '#fff' }}>
                    <input
                        type="text"
                        placeholder={`buscar ${title}`}
                        style={{ border: '1px solid #a3b2cc', outline: 'none', width: '100%', fontSize: '11px', padding: '2px 4px', borderRadius: 0 }}
                    />
                    <span style={{ fontSize: '11px', color: '#000', marginLeft: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', border: '1px solid #a3b2cc', padding: '0 4px', background: '#e9e9e9' }}>🔍</span>
                </div>
                <div className="friends-grid-sidebar">
                    {items.slice(0, 9).map(item => (
                        <Link
                            key={item.id}
                            to={type === 'friends' ? `/profile/${encodeURIComponent(item.username)}` : `/communities/${item.id}`}
                            className="friend-item-sidebar"
                            title={type === 'friends' ? item.username : item.name}
                        >
                            <img src={type === 'friends' ? item.avatar : item.image} alt={type === 'friends' ? item.username : item.name} />
                            <span>{(type === 'friends' ? item.username : item.name).split(' ')[0]}</span>
                        </Link>
                    ))}
                </div>
                <div style={{ marginTop: '12px', textAlign: 'right' }}>
                    <Link to={viewAllLink} className="sidebar-footer-link" style={{ fontSize: '11px' }}>ver todos</Link>
                </div>
            </div>
        </div>
    );
}
