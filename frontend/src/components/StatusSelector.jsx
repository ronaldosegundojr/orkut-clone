import { useState, useEffect, useRef } from 'react';

const STATUS_OPTIONS = [
    { value: 'online', label: 'Online', color: '#4caf50', description: 'Verde' },
    { value: 'away', label: 'Ausente', color: '#ff9800', description: 'Laranja' },
    { value: 'busy', label: 'Ocupado', color: '#f44336', description: 'Vermelho' },
    { value: 'invisible', label: 'Invisível', color: '#9e9e9e', description: 'Cinza' }
];

export function StatusSelector({ status, onStatusChange }) {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const currentStatus = STATUS_OPTIONS.find(s => s.value === status) || STATUS_OPTIONS[0];

    return (
        <div ref={menuRef} style={{ position: 'relative' }}>
            <div
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                }}
                style={{
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}
                title="Clique para mudar seu status"
            >
                <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: currentStatus.color,
                    border: '2px solid white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
                <span style={{ fontSize: '11px' }}>▼</span>
            </div>

            {showMenu && (
                <div style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '0',
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
                    padding: '6px',
                    zIndex: 9999,
                    minWidth: '160px',
                    marginBottom: '8px'
                }}>
                    <div style={{
                        padding: '4px 8px 8px',
                        fontSize: '11px',
                        color: '#666',
                        borderBottom: '1px solid #eee',
                        marginBottom: '4px'
                    }}>
                        Definir status
                    </div>
                    {STATUS_OPTIONS.map(opt => (
                        <div
                            key={opt.value}
                            onClick={() => {
                                onStatusChange(opt.value);
                                setShowMenu(false);
                            }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '8px 10px',
                                cursor: 'pointer',
                                borderRadius: '6px',
                                background: status === opt.value ? '#e8f0fe' : 'transparent',
                                transition: 'background 0.15s'
                            }}
                            onMouseEnter={(e) => {
                                if (status !== opt.value) e.target.style.background = '#f5f5f5';
                            }}
                            onMouseLeave={(e) => {
                                if (status !== opt.value) e.target.style.background = 'transparent';
                            }}
                        >
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: opt.color,
                                flexShrink: 0
                            }} />
                            <div>
                                <div style={{
                                    fontSize: '12px',
                                    color: status === opt.value ? '#1155cc' : '#333',
                                    fontWeight: status === opt.value ? '600' : '400'
                                }}>
                                    {opt.label}
                                </div>
                                <div style={{ fontSize: '10px', color: '#888' }}>
                                    {opt.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export { STATUS_OPTIONS };
