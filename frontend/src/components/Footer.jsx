import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-light)', borderTop: '1px solid var(--gray-border)', marginTop: '40px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
                <Link to="/about" style={{ color: 'var(--pink)' }}>Sobre o Tukro</Link>
                <Link to="/privacy" style={{ color: 'var(--pink)' }}>Privacidade</Link>
                <Link to="/terms" style={{ color: 'var(--pink)' }}>Termos</Link>
                <Link to="/help" style={{ color: 'var(--pink)' }}>Ajuda</Link>
            </div>
            <div>&copy; {new Date().getFullYear()} Tukro - A sua rede de memórias</div>
        </footer>
    );
}
