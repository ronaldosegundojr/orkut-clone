import React from 'react';

export default function Copyright() {
    return (
        <div className="card" style={{ padding: '30px', lineHeight: '1.6', color: '#333' }}>
            <h1 style={{ color: 'var(--orkut-blue-title)', marginBottom: '20px', borderBottom: '1px solid #c9d7f1', paddingBottom: '10px' }}>Propriedade Intelectual e DMCA</h1>

            <p style={{ marginBottom: '15px' }}>O Tukro respeita os direitos de propriedade intelectual de terceiros e espera que seus usuários façam o mesmo.</p>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>1. Notificação de Violação de Direitos Autorais</h2>
                <p>Se você acredita que qualquer conteúdo disponível no Tukro viola seus direitos autorais, você pode enviar uma notificação contendo:</p>
                <ul style={{ marginLeft: '20px' }}>
                    <li>Identificação do trabalho protegido por direitos autorais que você alega ter sido violado.</li>
                    <li>Identificação do material que você alega ser infrator e que deve ser removido.</li>
                    <li>Suas informações de contato (nome, endereço, telefone e e-mail).</li>
                    <li>Uma declaração de que você acredita de boa-fé que o uso do material não é autorizado pelo proprietário dos direitos autorais.</li>
                </ul>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>2. Procedimento de Remoção</h2>
                <p>Ao receber uma notificação válida, removeremos ou desabilitaremos o acesso ao material infrator prontamente. Usuários que infringirem repetidamente direitos autorais poderão ter suas contas permanentemente encerradas.</p>
            </section>

            <section style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '16px', color: 'var(--pink)', marginBottom: '10px' }}>3. Marcas Registradas</h2>
                <p>O Tukro é um projeto independente inspirado em redes sociais clássicas. As marcas mencionadas como "Orkut" e "Google" são propriedades dos seus respectivos detentores (Google LLC). O uso dessas marcas neste site é feito apenas para fins de referência histórica e cultural.</p>
            </section>

            <footer style={{ marginTop: '30px', fontSize: '11px', color: '#999', fontStyle: 'italic' }}>
                Última atualização: Março de 2026.
            </footer>
        </div>
    );
}
