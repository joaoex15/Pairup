<!-- $lib/components/PoliticaPrivacidade.svelte -->
<script lang="ts" context="module">
    export function verificarAceitePrivacidade(): boolean {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem('privacidade_aceita') === 'true';
    }
    
    export function marcarPrivacidadeAceita(): void {
        localStorage.setItem('privacidade_aceita', 'true');
        localStorage.setItem('privacidade_aceita_data', new Date().toISOString());
    }
</script>

<div class="privacidade-container">
    <div class="privacidade-header">
        <h1>🔒 Política de Privacidade</h1>
        <p class="subtitle">Como tratamos seus dados pessoais</p>
    </div>

    <div class="privacidade-conteudo">
        <section>
            <h2>1. Dados Coletados</h2>
            <p>A plataforma coleta os seguintes dados fornecidos voluntariamente pelo USUÁRIO:</p>
            <ul>
                <li><strong>Identificação:</strong> Nome, e-mail, data de nascimento</li>
                <li><strong>Perfil:</strong> Curso, gênero, interesse (sexualidade), descrição pessoal</li>
                <li><strong>Contato (opcional):</strong> Instagram, WhatsApp, Telegram</li>
                <li><strong>Imagens:</strong> Fotos de perfil e galeria (armazenadas no Cloudinary)</li>
                <li><strong>Interações:</strong> Likes, matches, conversas</li>
                <li><strong>Dados técnicos:</strong> Endereço IP, tipo de dispositivo, logs de acesso</li>
            </ul>
        </section>

        <section>
            <h2>2. Finalidade do Tratamento</h2>
            <p>Seus dados são utilizados exclusivamente para:</p>
            <ul>
                <li>✅ Criar e manter seu perfil na plataforma</li>
                <li>✅ Permitir interações (likes e matches) com outros usuários</li>
                <li>✅ Exibir perfis compatíveis com seus interesses</li>
                <li>✅ Manter a segurança e integridade da plataforma</li>
                <li>✅ Cumprir obrigações legais quando aplicável</li>
                <li>✅ Melhorar a experiência do usuário</li>
            </ul>
            <p><strong>A plataforma NÃO utiliza seus dados para:</strong> marketing automatizado, venda de dados a terceiros, publicidade comportamental ou qualquer finalidade não autorizada expressamente.</p>
        </section>

        <section>
            <h2>3. Compartilhamento de Dados</h2>
            <p><strong>⚠️ A PLATAFORMA NÃO VENDE, ALUGA OU COMPARTILHA SEUS DADOS PESSOAIS COM TERCEIROS PARA FINS COMERCIAIS.</strong></p>
            <p>Exceções limitadas e necessárias:</p>
            <ul>
                <li><strong>Cloudinary:</strong> Armazenamento das imagens enviadas pelos usuários (serviço externo de nuvem)</li>
                <li><strong>Google OAuth:</strong> Se o usuário optar por login com Google, dados básicos do perfil Google são recebidos</li>
                <li><strong>Autoridades judiciais/policiais:</strong> Mediante ordem judicial ou requisição legal</li>
                <li><strong>Outros usuários:</strong> Seu perfil público (nome, fotos, descrição, curso, tags) é visível para outros usuários autenticados. Redes sociais (Instagram, WhatsApp, Telegram) só ficam visíveis após MATCH.</li>
            </ul>
        </section>

        <section>
            <h2>4. Armazenamento e Segurança</h2>
            <ul>
                <li>Seus dados são armazenados em servidores seguros com criptografia em trânsito (TLS/SSL)</li>
                <li>Senhas são armazenadas de forma hasheada (não legível)</li>
                <li>Tokens JWT são utilizados para autenticação</li>
                <li><strong>⚠️ NENHUM SISTEMA É 100% SEGURO.</strong> Em caso de violação de segurança, os usuários serão notificados dentro do prazo legal.</li>
            </ul>
        </section>

        <section>
            <h2>5. Seus Direitos (LGPD - Lei 13.709/2018)</h2>
            <p>O USUÁRIO residente no Brasil tem direito a:</p>
            <ul>
                <li>✅ Confirmar a existência de tratamento de seus dados</li>
                <li>✅ Acessar seus dados pessoais</li>
                <li>✅ Corrigir dados incompletos, inexatos ou desatualizados</li>
                <li>✅ Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários</li>
                <li>✅ Solicitar a portabilidade dos dados a outro fornecedor</li>
                <li>✅ Eliminar seus dados pessoais (exclusão de conta)</li>
                <li>✅ Revogar o consentimento a qualquer momento</li>
            </ul>
            <p>Para exercer seus direitos, entre em contato pelo e-mail: <strong><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="a4d4d6cdd2c5c7cdc0c5c0c1e4d4c5cdd6d1d48ac7cbc9">[email&#160;protected]</a></strong></p>
        </section>

        <section>
            <h2>6. Retenção de Dados</h2>
            <ul>
                <li>Seus dados são mantidos enquanto sua conta estiver ativa</li>
                <li>Após exclusão da conta, os dados são removidos em até 30 dias</li>
                <li>Likes e matches são desassociados e anonimizados</li>
                <li>Logs de acesso podem ser mantidos por até 6 meses para fins de segurança</li>
                <li>Imagens removidas são deletadas permanentemente do Cloudinary</li>
            </ul>
        </section>

        <section>
            <h2>7. Cookies e Tecnologias</h2>
            <p>A plataforma utiliza:</p>
            <ul>
                <li><strong>LocalStorage:</strong> Armazenamento do token JWT e preferências</li>
                <li><strong>SessionStorage:</strong> Dados temporários da sessão</li>
                <li><strong>Não utilizamos cookies de rastreamento ou terceiros</strong> para publicidade</li>
            </ul>
        </section>

        <section>
            <h2>8. Menores de 18 Anos</h2>
            <p><strong>⚠️ A PLATAFORMA NÃO COLETA CONSCIENTEMENTE DADOS DE MENORES DE 18 ANOS.</strong></p>
            <p>Se você é menor de idade, NÃO pode criar uma conta. Se identificarmos um cadastro de menor, a conta será imediatamente excluída e os dados removidos.</p>
        </section>

        <section>
            <h2>9. Alterações nesta Política</h2>
            <p>Podemos atualizar esta política periodicamente. Notificaremos os usuários sobre mudanças significativas através do aplicativo ou e-mail. O uso continuado após alterações constitui aceitação da nova política.</p>
        </section>

        <section>
            <h2>10. Contato</h2>
            <p>Para questões sobre privacidade, dados pessoais ou exercício de direitos:</p>
            <ul>
                <li>📧 E-mail: <strong><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="d1a1a3b8a7b0b2b8b5b0b5b491a1b0b8a3a4a1ffb2bebc">[email&#160;protected]</a></strong></li>
                <li>📧 DPO (Encarregado de Dados): <strong><a href="/cdn-cgi/l/email-protection" class="__cf_email__" data-cfemail="e581958aa595848c979095cb868a88">[email&#160;protected]</a></strong></li>
            </ul>
        </section>

        <section class="resumo">
            <h3>📌 Resumo da Política de Privacidade</h3>
            <ul>
                <li>Coletamos dados que você fornece voluntariamente</li>
                <li>Não vendemos seus dados para ninguém</li>
                <li>Suas redes sociais só ficam visíveis após MATCH</li>
                <li>Você pode excluir sua conta e todos os dados a qualquer momento</li>
                <li>Menores de 18 anos NÃO podem usar a plataforma</li>
                <li>Armazenamos imagens no Cloudinary (serviço externo)</li>
            </ul>
        </section>
    </div>
</div>

<style>
    .privacidade-container {
        max-width: 800px;
        margin: 0 auto;
        padding: 2rem;
        background: white;
        border-radius: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    .privacidade-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .privacidade-header h1 {
        font-size: 1.8rem;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        color: #64748b;
        font-size: 0.9rem;
    }
    
    .privacidade-conteudo {
        max-height: 70vh;
        overflow-y: auto;
        padding-right: 1rem;
    }
    
    section {
        margin-bottom: 1.5rem;
    }
    
    h2 {
        font-size: 1.2rem;
        color: #334155;
        margin-bottom: 0.75rem;
        border-left: 4px solid #10b981;
        padding-left: 0.75rem;
    }
    
    h3 {
        font-size: 1rem;
        color: #475569;
        margin-bottom: 0.5rem;
    }
    
    p {
        font-size: 0.9rem;
        line-height: 1.5;
        color: #1e293b;
        mar