import React from 'react';

export default function About() {
    return (
        <div className="card" style={{ padding: '40px', lineHeight: '1.8', color: '#333', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ color: 'var(--orkut-blue-title)', fontSize: '24px', marginBottom: '25px', borderBottom: '2px solid #c9d7f1', paddingBottom: '15px', textAlign: 'center' }}>
                Sobre o Tukro
            </h1>

            <div style={{ fontSize: '14px', textAlign: 'justify' }}>
                <p style={{ marginBottom: '20px' }}>
                    O <strong>Tukro</strong> nasceu em 2026 com uma missão clara: resgatar a essência genuína das conexões humanas no ambiente digital. Inspirado na era áurea das redes sociais, como o lendário Orkut, o Tukro surge como um projeto totalmente independente e novo, sem qualquer vínculo com marcas registradas ou corporações de tecnologia como o Google LLC.
                </p>

                <p style={{ marginBottom: '20px' }}>
                    Vivemos em um mundo onde as redes sociais se transformaram em gigantescas plataformas de marketing, focadas em cooptar leads, vender anúncios e transformar experiências em métricas de consumo. O Tukro propõe o caminho inverso. Queremos trazer de volta a sensação de pertencer a uma comunidade real, onde o foco são as <strong>pessoas e suas histórias</strong>, não o seu perfil como consumidor.
                </p>

                <p style={{ marginBottom: '20px' }}>
                    Desde a popularização da internet e o surgimento de ferramentas icônicas como o ICQ, MSN, Orkut e as primeiras versões do Facebook, a forma como interagimos mudou drasticamente. A proposta do Tukro é reacender aquela chama da descoberta, da amizade por afinidade e da criação de comunidades vibrantes onde a troca de experiências é o único lucro que buscamos.
                </p>

                <blockquote style={{ borderLeft: '4px solid var(--pink)', paddingLeft: '20px', fontStyle: 'italic', margin: '30px 0', color: '#555' }}>
                    "Tukro é onde a nostalgia encontra o futuro das conexões humanas. Um espaço livre do ruído comercial, feito para você ser quem você é."
                </blockquote>

                <p style={{ marginBottom: '20px', fontWeight: 'bold', color: 'var(--orkut-blue-title)' }}>
                    Vamos juntos reconstruir uma internet mais humana?
                </p>

                <p style={{ marginBottom: '30px' }}>
                    Venha para o Tukro, convide seus amigos e amigas, e ajude-nos a criar um espaço onde as conexões acontecem de pessoa para pessoa. Juntos, somos mais que um feed – somos uma comunidade.
                </p>
            </div>

            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <a href="/register" className="btn btn-pink" style={{ padding: '12px 30px', fontSize: '14px' }}>
                    Fazer parte da comunidade
                </a>
            </div>

            <footer style={{ marginTop: '50px', fontSize: '11px', color: '#999', textAlign: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                Tukro 2026 - Onde a amizade é a peça central.
            </footer>
        </div>
    );
}
