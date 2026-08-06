const C = {
  bg:      "#121212",
  card:    "#202020",
  border:  "rgba(255,255,255,0.06)",
  accent:  "#D8B15A",
  text:    "#FFFFFF",
  muted:   "#B6B6B6",
  dim:     "#7A7A7A",
};

const secao = { marginBottom: 24 };
const titulo = { fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 8 };
const paragrafo = { fontSize: 13, color: C.muted, lineHeight: 1.7 };

export default function PoliticaPrivacidade() {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'Satoshi',sans-serif", padding:"40px 16px" }}>
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ maxWidth:640, margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontWeight:900, fontSize:24, letterSpacing:"-0.02em" }}>
            Agenda<span style={{color:C.accent}}>OS</span>
          </div>
          <div style={{ fontSize:12, color:C.dim, marginTop:4 }}>Política de Privacidade</div>
        </div>

        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32 }}>
          <div style={secao}>
            <div style={titulo}>1. Quem trata os seus dados</div>
            <p style={paragrafo}>
              O AgendaOS é a plataforma de tecnologia usada pelo profissional/negócio com quem você está
              agendando um horário. Os seus dados são coletados para uso exclusivo desse profissional/negócio,
              que é o responsável por gerenciar a sua agenda de atendimento.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>2. Quais dados coletamos</div>
            <p style={paragrafo}>
              Coletamos apenas o necessário para o agendamento: seu nome, seu número de WhatsApp, e as
              informações do próprio agendamento (serviço escolhido, profissional, data e horário).
              Não coletamos dados sensíveis, financeiros ou de localização.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>3. Para que usamos esses dados</div>
            <p style={paragrafo}>
              Usamos seus dados exclusivamente para: confirmar, lembrar ou cancelar seu agendamento
              (inclusive via WhatsApp), e para o profissional/negócio organizar sua própria agenda e
              histórico de clientes.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>4. Com quem compartilhamos</div>
            <p style={paragrafo}>
              Seus dados ficam visíveis apenas para o profissional/negócio específico com quem você agendou —
              nunca são compartilhados com outros negócios que também usam o AgendaOS, nem vendidos ou usados
              para fins de marketing por terceiros.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>5. Por quanto tempo guardamos</div>
            <p style={paragrafo}>
              Seus dados ficam armazenados enquanto você mantiver relacionamento com o profissional/negócio
              (ou seja, enquanto seguir sendo cliente), podendo ser excluídos a qualquer momento mediante
              solicitação.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>6. Seus direitos</div>
            <p style={paragrafo}>
              De acordo com a Lei Geral de Proteção de Dados (LGPD), você pode solicitar a qualquer momento:
              acesso aos seus dados, correção de informações incorretas, ou exclusão completa do seu cadastro.
              Para isso, entre em contato diretamente com o profissional/negócio onde você agendou, ou envie
              um email para <strong style={{color:C.text}}>naoresponda.agendaos@gmail.com</strong>.
            </p>
          </div>

          <div style={secao}>
            <div style={titulo}>7. Segurança</div>
            <p style={paragrafo}>
              Toda comunicação com o site é criptografada (HTTPS), e senhas de acesso ao painel são
              armazenadas com hash criptográfico, nunca em texto puro.
            </p>
          </div>
        </div>

        <div style={{ textAlign:"center", marginTop:20 }}>
          <a href="/agendar" style={{ color:C.accent, fontSize:12, textDecoration:"underline" }}>
            ← Voltar
          </a>
        </div>
      </div>
    </div>
  );
}
