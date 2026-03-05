import React from 'react';

export default function Privacy() {
    return (
        <div className="card" style={{ padding: '30px', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: 'var(--orkut-blue-title)', marginBottom: '20px', borderBottom: '1px solid #c9d7f1', paddingBottom: '10px' }}>Política de Privacidade</h1>

            <p style={{ marginBottom: '15px' }}>Sua privacidade é muito importante para nós. Esta política explica como lidamos com seus dados no Tukro, em conformidade com as diretrizes da LGPD (Lei Geral de Proteção de Dados).</p>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>1. Dados que Coletamos</h2>
                <ul style={{ marginLeft: '20px' }}>
                    <li><strong>Informações de Registro:</strong> E-mail, nome, data de nascimento e gênero.</li>
                    <li><strong>Conteúdo:</strong> Fotos, vídeos, recados, depoimentos e mensagens que você publica.</li>
                    <li><strong>Dados Técnicos:</strong> Endereço IP, cookies e dados de acesso para segurança e análise de desempenho.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>2. Como Usamos seus Dados</h2>
                <p>Os dados são utilizados exclusivamente para o funcionamento da plataforma, permitindo que você interaja com outros usuários. Não vendemos seus dados para terceiros ou anunciantes.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>3. Armazenamento e Segurança</h2>
                <p>Seus dados são armazenados em servidores seguros. Utilizamos criptografia para proteger senhas e tokens de acesso.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>4. Seus Direitos</h2>
                <p>Você tem o direito de acessar, corrigir ou excluir seus dados a qualquer momento. Caso deseje a exclusão definitiva da sua conta e de todos os seus dados, você pode solicitar através das configurações do seu perfil ou enviando um e-mail para nossa equipe.</p>
            </section>

            <footer style={{ marginTop: '30px', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                Última atualização: Março de 2026.
            </footer>
        </div>
    );
}
