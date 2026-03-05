import { Link } from 'react-router-dom';

export default function Footer() {
    return (
        <footer style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-light)', borderTop: '1px solid var(--gray-border)', marginTop: '40px', fontSize: '11px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '8px' }}>
                <Link to="/about" style={{ color: 'var(--pink)' }}>Sobre o Tukro</Link>
                <Link to="/privacy" style={{ color: 'var(--pink)' }}>Privacidade</Link>
                <Link to="/terms" style={{ color: 'var(--pink)' }}>Termos de Uso</Link>
                <Link to="/copyright" style={{ color: 'var(--pink)' }}>Direitos Autorais</Link>
            </div>

            <div style={{ maxWidth: '700px', margin: '15px auto', lineHeight: '1.4', padding: '0 20px', color: '#999' }}>
                Este site é um projeto independente inspirado em experiências clássicas de redes sociais da internet.
                Não possui qualquer afiliação, associação, patrocínio ou endosso do Google LLC ou da antiga rede social Orkut.
                "Orkut" é uma marca registrada do Google LLC e é mencionada apenas para fins de referência histórica.
            </div>

            <div>&copy; {new Date().getFullYear()} Tukro - A sua rede de memórias</div>
        </footer>
    );
}
