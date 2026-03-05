import React from 'react';

export default function Terms() {
    return (
        <div className="card" style={{ padding: '30px', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: 'var(--orkut-blue-title)', marginBottom: '20px', borderBottom: '1px solid #c9d7f1', paddingBottom: '10px' }}>Termos de Uso</h1>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>1. Aceitação dos Termos</h2>
                <p>Ao acessar e utilizar o Tukro, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, você não deve utilizar nossa plataforma.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>2. Regras de Conduta</h2>
                <p>Você se compromete a utilizar o Tukro de forma responsável e legal. É terminantemente proibido:</p>
                <ul style={{ marginLeft: '20px' }}>
                    <li>Enviar spam ou mensagens indesejadas.</li>
                    <li>Praticar assédio, bullying ou qualquer forma de discriminação.</li>
                    <li>Publicar conteúdo ilegal, violento ou que incite ao ódio.</li>
                    <li>Divulgar pornografia infantil ou qualquer material sexualmente explícito ilegal.</li>
                    <li>Violar direitos autorais ou propriedade intelectual de terceiros.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>3. Conteúdo Gerado pelo Usuário</h2>
                <p>O usuário é o único responsável por todo o conteúdo (mensagens, fotos, vídeos, depoimentos) que publica na plataforma.</p>
                <p>O Tukro reserva-se o direito de remover qualquer conteúdo que viole estes termos ou que seja considerado inadequado, a seu exclusivo critério, sem aviso prévio.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>4. Limitação de Responsabilidade</h2>
                <p>O Tukro é uma plataforma de entretenimento e nostalgia fornecida "como está". Não nos responsabilizamos pelo conteúdo publicado por usuários nem por danos decorrentes do uso da plataforma.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>5. Encerramento de Contas</h2>
                <p>Podemos, a qualquer momento e por qualquer motivo, suspender ou encerrar sua conta e seu acesso ao site, especialmente em casos de violação destes Termos.</p>
            </section>

            <footer style={{ marginTop: '30px', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                Última atualização: Março de 2026.
            </footer>
        </div>
    );
}
