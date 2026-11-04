<!-- $lib/components/TermoUso.svelte -->
<script lang="ts" context="module">
    export function verificarAceiteTermo(): boolean {
        if (typeof localStorage === 'undefined') return false;
        return localStorage.getItem('termo_aceito') === 'true';
    }
    
    export function resetarAceiteTermo(): void {
        localStorage.removeItem('termo_aceito');
        localStorage.removeItem('termo_aceito_data');
    }
    
    export function marcarTermoAceito(): void {
        localStorage.setItem('termo_aceito', 'true');
        localStorage.setItem('termo_aceito_data', new Date().toISOString());
    }
</script>

<div class="termo-container">
    <div class="termo-header">
        <h1>📜 Termo de Uso e Responsabilidade</h1>
        <p class="subtitle">Leia atentamente antes de continuar</p>
    </div>

    <div class="termo-conteudo">
        <section>
            <h2>1. Aceitação dos Termos</h2>
            <p>Ao criar uma conta e utilizar o aplicativo, VOCÊ declara ter lido, compreendido e aceitado integralmente todas as cláusulas deste Termo de Uso e Responsabilidade, sem qualquer reserva.</p>
            <p><strong>⚠️ O USUÁRIO reconhece que a criação de perfil só é permitida mediante aceitação expressa da ciência de responsabilidade.</strong></p>
        </section>

        <section>
            <h2>2. Veracidade das Informações</h2>
            <p>O USUÁRIO declara sob as penas da lei que:</p>
            <ul>
                <li><strong>Todas as informações fornecidas no cadastro e perfil são verdadeiras, atuais e completas</strong>, incluindo nome, idade, curso, gênero, interesses e demais dados pessoais.</li>
                <li>É o <strong>único e exclusivo responsável pela precisão e veracidade dos dados inseridos</strong>, isentando a plataforma e seus desenvolvedores de qualquer responsabilidade por informações falsas, desatualizadas ou enganosas fornecidas por qualquer usuário.</li>
                <li>A plataforma <strong>não realiza verificação ativa da identidade ou das informações fornecidas</strong>, e não pode garantir que outros usuários sejam quem dizem ser.</li>
                <li>O USUÁRIO reconhece que interagir com base em informações falsas é de sua exclusiva conta e risco.</li>
            </ul>
        </section>

        <section>
            <h2>3. Conteúdo Enviado pelo Usuário (Imagens e Textos)</h2>
            <p>O USUÁRIO é o <strong>único e exclusivo responsável</strong> por todo e qualquer conteúdo que enviar, publicar ou compartilhar na plataforma, incluindo, mas não se limitando a:</p>
            <ul>
                <li>📸 Fotos e imagens de perfil</li>
                <li>📝 Descrições e textos biográficos</li>
                <li>🔗 Links para redes sociais</li>
                <li>💬 Mensagens trocadas com outros usuários</li>
            </ul>
            
            <p><strong>O USUÁRIO DECLARA E GARANTE QUE:</strong></p>
            <ul>
                <li>É o titular dos direitos das imagens enviadas ou possui autorização expressa para utilizá-las</li>
                <li>Não enviará conteúdo ofensivo, difamatório, obsceno, ilegal ou que viole direitos de terceiros</li>
                <li>Não enviará imagens de terceiros sem seu consentimento explícito</li>
                <li>Não enviará conteúdo que configure nudez, atos sexuais ou qualquer material impróprio</li>
            </ul>
            
            <p><strong>⚠️ A PLATAFORMA NÃO SE RESPONSABILIZA POR:</strong></p>
            <ul>
                <li>Qualquer conteúdo enviado pelos usuários</li>
                <li>Uso indevido, cópia, distribuição ou vazamento das imagens enviadas</li>
                <li>Danos morais, materiais ou de qualquer natureza decorrentes do compartilhamento de conteúdo</li>
                <li>Violação de direitos autorais, direitos de imagem ou privacidade</li>
            </ul>
            
            <p>A plataforma se reserva o direito de remover, sem aviso prévio, qualquer conteúdo que viole estes termos ou que seja denunciado por outros usuários.</p>
        </section>

        <section>
            <h2>4. Isenção de Responsabilidade - Vazamento de Dados</h2>
            <p><strong>⚠️ O USUÁRIO RECONHECE E CONCORDA QUE:</strong></p>
            <ul>
                <li>A plataforma <strong>NÃO GARANTE segurança absoluta</strong> contra ataques cibernéticos, invasões, vazamentos de dados ou qualquer outro incidente de segurança.</li>
                <li>Em caso de vazamento, violação ou acesso não autorizado aos dados do USUÁRIO, <strong>a plataforma não será responsabilizada</strong>, exceto em caso de dolo ou negligência grave comprovada judicialmente.</li>
                <li>O USUÁRIO é responsável por manter sua senha e credenciais em segurança, não as compartilhando com terceiros.</li>
                <li>Recomenda-se que o USUÁRIO <strong>não compartilhe informações sensíveis</strong> (documentos, endereço exato, dados bancários) através da plataforma.</li>
            </ul>
        </section>

        <section>
            <h2>5. Ausência de Vínculo com Universidade</h2>
            <p><strong>⚠️ A PLATAFORMA DECLARA EXPRESSAMENTE QUE:</strong></p>
            <ul>
                <li><strong>NÃO POSSUI QUALQUER VÍNCULO, ASSOCIAÇÃO, PARCERIA OU AFILIAÇÃO COM NENHUMA UNIVERSIDADE, INSTITUIÇÃO DE ENSINO, FACULDADE OU ÓRGÃO EDUCACIONAL NO MOMENTO.</strong></li>
                <li>O uso de nomes, siglas ou referências a universidades é meramente ilustrativo ou decorre de iniciativa exclusiva dos usuários, não representando endosso ou envolvimento institucional.</li>
                <li>Nenhuma universidade participa da gestão, desenvolvimento, financiamento ou operação desta plataforma.</li>
                <li>O USUÁRIO não pode afirmar ou sugerir que a plataforma é oficialmente reconhecida ou apoiada por qualquer instituição de ensino.</li>
            </ul>
        </section>

        <section>
            <h2>6. Interações Entre Usuários</h2>
            <ul>
                <li>A plataforma é apenas um meio de conexão e <strong>NÃO participa, interfere ou se responsabiliza</strong> por encontros, interações, relacionamentos ou qualquer contato entre usuários.</li>
                <li>O USUÁRIO é inteiramente responsável por sua segurança física e digital ao interagir com outros usuários.</li>
                <li><strong>Recomendações obrigatórias:</strong>
                    <ul>
                        <li>✅ Sempre marque encontros em locais públicos</li>
                        <li>✅ Informe amigos/família sobre seus encontros</li>
                        <li>✅ Nunca compartilhe informações financeiras</li>
                        <li>✅ Desconfie de perfis suspeitos</li>
                        <li>✅ Denuncie comportamentos inadequados</li>
                    </ul>
                </li>
                <li>A plataforma NÃO realiza verificação de antecedentes criminais ou qualquer tipo de investigação sobre os usuários.</li>
            </ul>
        </section>

        <section>
            <h2>7. Menores de Idade</h2>
            <p><strong>⚠️ A PLATAFORMA É DESTINADA EXCLUSIVAMENTE PARA MAIORES DE 18 (DEZOITO) ANOS.</strong></p>
            <ul>
                <li>O USUÁRIO declara expressamente ter idade igual ou superior a 18 anos.</li>
                <li>O sistema realiza validação automática de idade baseada na data de nascimento informada.</li>
                <li>Contas de usuários menores de idade serão removidas sem aviso prévio.</li>
                <li>Os pais/responsáveis que identificarem cadastro de menor devem reportar imediatamente para remoção.</li>
            </ul>
        </section>

        <section>
            <h2>8. Suspensão e Exclusão de Conta</h2>
            <p>A plataforma se reserva o direito de, a seu exclusivo critério e sem aviso prévio:</p>
            <ul>
                <li>Suspender ou excluir permanentemente contas que violem estes termos</li>
                <li>Remover conteúdo considerado inadequado</li>
                <li>Bloquear usuários que receberem denúncias comprovadas</li>
                <li>Tomar as medidas legais cabíveis em caso de atividades ilícitas</li>
            </ul>
        </section>

        <section>
            <h2>9. Modificações nos Termos</h2>
            <p>A plataforma pode alterar estes termos a qualquer momento, notificando os usuários através do aplicativo ou e-mail. O uso continuado após alterações constitui aceitação dos novos termos.</p>
        </section>

        <section>
            <h2>10. Disposições Gerais</h2>
            <ul>
                <li>Este termo é regido pelas leis da República Federativa do Brasil.</li>
                <li>Fica eleito o foro da comarca de Aracaju/SE para dirimir quaisquer controvérsias.</li>
                <li>Se qualquer cláusula for considerada inválida, as demais permanecem em pleno vigor.</li>
            </ul>
        </section>

        <section class="resumo-rapido">
            <h3>📌 Resumo Rápido (não substitui o termo completo)</h3>
            <ul>
                <li>❌ Não garantimos que os dados dos usuários são verdadeiros</li>
                <li>❌ Não nos responsabilizamos por vazamento de dados</li>
                <li>❌ Não nos responsabilizamos por imagens que você enviar</li>
                <li>❌ Não temos vínculo com nenhuma universidade</li>
                <li>✅ Você é o único responsável pelo seu perfil e interações</li>
                <li>✅ Você deve ter 18+ anos para usar</li>
            </ul>
        </section>
    </div>
</div>

<style>
    .termo-container {
        max-width: 800px;
        margin: 2rem auto;
        width: calc(100% - 2.5rem);
        padding: 2rem;
        background: white;
        border-radius: 24px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    
    .termo-header {
        text-align: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid #e2e8f0;
    }
    
    .termo-header h1 {
        font-size: 1.8rem;
        color: #1e293b;
        margin-bottom: 0.5rem;
    }
    
    .subtitle {
        color: #64748b;
        font-size: 0.9rem;
    }
    
    .termo-conteudo {
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
        border-left: 4px solid #4F46E5;
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
        margin-bottom: 0.75rem;
    }
    
    ul {
        margin: 0.5rem 0 0.75rem 1.5rem;
    }
    
    li {
        font-size: 0.85rem;
        line-height: 1.4;
        color: #334155;
        margin-bottom: 0.25rem;
    }
    
    strong {
        color: #1e293b;
    }
    
    .resumo-rapido {
        background: #f8fafc;
        padding: 1rem;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
    }
    
    .resumo-rapido li {
        font-size: 0.8rem;
    }
</style>