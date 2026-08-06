import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const API = "https://agendaos-backend-production.up.railway.app";

const C = {
  bg:      "#121212",
  surface: "#1B1B1B",
  card:    "#202020",
  border:  "rgba(255,255,255,0.06)",
  accent:  "#D8B15A",
  accent2: "#E5C87A",
  green:   "#57C785",
  yellow:  "#F59E0B",
  red:     "#EF4444",
  text:    "#FFFFFF",
  muted:   "#B6B6B6",
  dim:     "#7A7A7A",
};

function Input({ value, onChange, placeholder, type="text" }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
        borderRadius:10, padding:"10px 14px", color:C.text, fontSize:13,
        outline:"none", fontFamily:"inherit", width:"100%" }} />
  );
}

function Btn({ children, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
      border:"none", borderRadius:10, color:"#111111",
      fontSize:13, fontWeight:700, padding:"12px 24px",
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1,
      fontFamily:"inherit", width:"100%", marginTop:8,
    }}>{children}</button>
  );
}

function TelaMensagem({ emoji, titulo, texto }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"'Satoshi',sans-serif", padding:24 }}>
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:32, maxWidth:400, textAlign:"center" }}>
        <div style={{ fontSize:40, marginBottom:12 }}>{emoji}</div>
        <div style={{ fontWeight:800, fontSize:17, marginBottom:8 }}>{titulo}</div>
        <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>{texto}</div>
      </div>
    </div>
  );
}

export default function Agendar() {
  const { slug } = useParams();
  const [donoId, setDonoId] = useState(null);
  const [nomeNegocio, setNomeNegocio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [horarioAbertura, setHorarioAbertura] = useState("08:00");
  const [horarioFechamento, setHorarioFechamento] = useState("18:00");
  const [carregandoNegocio, setCarregandoNegocio] = useState(true);
  const [negocioNaoEncontrado, setNegocioNaoEncontrado] = useState(false);
  const [negocioIndisponivel, setNegocioIndisponivel] = useState(false);

  useEffect(() => {
    document.title = nomeNegocio ? `Agendar horário - ${nomeNegocio}` : "Agendar horário - AgendaOS";
  }, [nomeNegocio]);

  const [modo, setModo] = useState("agendar"); // "agendar" | "gerenciar"
  const [telefoneBusca, setTelefoneBusca] = useState("");
  const [agendamentosEncontrados, setAgendamentosEncontrados] = useState(null); // null=nao buscou ainda
  const [buscandoAgendamentos, setBuscandoAgendamentos] = useState(false);
  const [cancelandoId, setCancelandoId] = useState(null);
  const [erroBusca, setErroBusca] = useState("");

  const [services,  setServices]  = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [step,      setStep]      = useState(1); // 1=dados, 2=serviço, 3=profissional, 4=horário, 5=confirmado
  const [nome,      setNome]      = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [email,     setEmail]     = useState("");
  const [aceitouPrivacidade, setAceitouPrivacidade] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [profissionalId, setProfissionalId] = useState(undefined); // undefined=nao escolheu, "any"=sem preferencia, ou id
  const [data,      setData]      = useState("");
  const [hora,      setHora]      = useState(9);
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const horaAberturaInt = parseInt(horarioAbertura.split(":")[0]);
  const horaFechamentoInt = parseInt(horarioFechamento.split(":")[0]);
  const HOURS = Array.from(
    { length: Math.max(horaFechamentoInt - horaAberturaInt + 1, 1) },
    (_, i) => horaAberturaInt + i
  );

  useEffect(() => {
    if (!slug) { setCarregandoNegocio(false); return; }
    fetch(`${API}/negocio/${slug}`)
      .then(r => { if (!r.ok) throw new Error("nao encontrado"); return r.json(); })
      .then(neg => {
        setDonoId(neg.id);
        setNomeNegocio(neg.nome_negocio);
        setInstagram(neg.instagram || "");
        if (neg.horario_abertura) setHorarioAbertura(neg.horario_abertura);
        if (neg.horario_fechamento) setHorarioFechamento(neg.horario_fechamento);
        if (neg.aceita_agendamentos === false) setNegocioIndisponivel(true);
      })
      .catch(() => setNegocioNaoEncontrado(true))
      .finally(() => setCarregandoNegocio(false));
  }, [slug]);

  useEffect(() => {
    if (!donoId) return;
    fetch(`${API}/servicos?slug=${slug}`)
      .then(r=>r.json())
      .then(data => setServices(data.map(s => ({
        id: s.id,
        name: s.nome,
        duration: s.duracao,
        price: s.preco,
      }))))
      .catch(()=>{});
  }, [donoId]);

  useEffect(() => {
    if (!donoId) return;
    fetch(`${API}/profissionais?slug=${slug}`)
      .then(r=>r.json())
      .then(data => setProfissionais(data.map(p => ({
        id: p.id,
        name: p.nome,
        especialidade: p.especialidade,
      }))))
      .catch(()=>{});
  }, [donoId]);

  useEffect(() => {
    if (!data || !serviceId || !donoId) return;
    const profParam = (profissionalId && profissionalId !== "any") ? `&profissional_id=${profissionalId}` : "";
    fetch(`${API}/horarios-disponiveis?data=${data}&servico_id=${serviceId}&slug=${slug}${profParam}`)
      .then(r => r.json())
      .then(horarios => setHorariosDisponiveis(horarios))
      .catch(() => setHorariosDisponiveis([]));
  }, [data, serviceId, profissionalId, donoId]);

  async function buscarMeusAgendamentos() {
    setErroBusca(""); setBuscandoAgendamentos(true); setAgendamentosEncontrados(null);
    try {
      const res = await fetch(`${API}/meus-agendamentos?telefone=${telefoneBusca}&slug=${slug}`);
      const data = await res.json();
      setAgendamentosEncontrados(Array.isArray(data) ? data : []);
    } catch {
      setErroBusca("Erro ao buscar agendamentos. Tente novamente.");
    }
    setBuscandoAgendamentos(false);
  }

  async function cancelarAgendamento(id) {
    if (!window.confirm("Tem certeza que quer cancelar esse agendamento?")) return;
    setCancelandoId(id);
    try {
      const res = await fetch(`${API}/agendamentos/${id}/cancelar-cliente?telefone=${telefoneBusca}&slug=${slug}`, {
        method: "PUT",
      });
      if (res.ok) {
        setAgendamentosEncontrados(as => as.filter(a => a.id !== id));
      } else {
        const err = await res.json().catch(()=>({}));
        setErroBusca(err.detail || "Erro ao cancelar agendamento.");
      }
    } catch {
      setErroBusca("Erro ao cancelar agendamento.");
    }
    setCancelandoId(null);
  }

  async function handleAgendar() {
    setErro(""); setLoading(true);
    try {
      // Verifica se cliente já existe pelo telefone
      const buscaRes = await fetch(`${API}/clientes/buscar?telefone=${telefone}&slug=${slug}`);
      let cliente = await buscaRes.json();

      // Se não existe, cria novo cliente
      if (!cliente || !cliente.id) {
        const clienteRes = await fetch(`${API}/clientes?slug=${slug}`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ nome, telefone, email, tipo:"cliente" }),
        });
        if (clienteRes.status === 402) {
          setErro("Este negócio não está aceitando novos agendamentos no momento.");
          setLoading(false);
          return;
        }
        cliente = await clienteRes.json();
      } else if (cliente.nome !== nome || (email && cliente.email !== email)) {
        // Cliente já existia (mesmo telefone) mas com nome/e-mail diferentes do que acabou de digitar - atualiza
        const updateRes = await fetch(`${API}/clientes/${cliente.id}?slug=${slug}`, {
          method:"PUT", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ nome, telefone, email: email || cliente.email || "", tipo: cliente.tipo || "cliente" }),
        });
        if (updateRes.ok) {
          cliente = await updateRes.json();
        }
      }

      const service = services.find(s=>s.id===serviceId);
      const agendamentoRes = await fetch(`${API}/agendamentos?slug=${slug}`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          cliente_id: cliente.id,
          profissional_id: (profissionalId && profissionalId !== "any") ? profissionalId : null,
          servico:    service?.name || "",
          data,
          hora,
          status:     "pending",
          obs:        "",
          preco:      service?.price || 0,
        }),
      });
      if (agendamentoRes.status === 402) {
        setErro("Este negócio não está aceitando novos agendamentos no momento.");
        setLoading(false);
        return;
      }
      if (agendamentoRes.status === 409) {
        setErro("Esse horário acabou de ser reservado por outra pessoa. Escolha outro horário.");
        setLoading(false);
        return;
      }
      setStep(5);
    } catch {
      setErro("Erro ao agendar. Tente novamente.");
    }
    setLoading(false);
  }

  const service = services.find(s=>s.id===serviceId);
  const profissional = profissionais.find(p=>p.id===profissionalId);
  const today   = new Date().toISOString().split("T")[0];
  const hasProfissionais = profissionais.length > 0;
  const stepLabels = hasProfissionais
    ? ["Seus dados","Serviço","Profissional","Horário"]
    : ["Seus dados","Serviço","Horário"];
  const displayStep = hasProfissionais ? step : (step===4 ? 3 : step);

  if (carregandoNegocio) {
    return <TelaMensagem emoji="⏳" titulo="Carregando…" texto="Só um instante." />;
  }

  if (!slug) {
    return (
      <TelaMensagem emoji="🔗" titulo="Link incompleto"
        texto="Peça para o profissional te enviar o link de agendamento da barbearia/salão (ele termina com /agendar/nome-do-negocio)." />
    );
  }

  if (negocioNaoEncontrado) {
    return (
      <TelaMensagem emoji="🤷" titulo="Negócio não encontrado"
        texto="Esse link de agendamento não existe ou foi removido. Confira o link com o profissional." />
    );
  }

  if (negocioIndisponivel) {
    return (
      <TelaMensagem emoji="⏸️" titulo="Agendamentos temporariamente indisponíveis"
        texto={`${nomeNegocio || "Este negócio"} não está aceitando novos agendamentos online no momento. Entre em contato diretamente para marcar seu horário.`} />
    );
  }

  if (modo === "gerenciar") {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
        fontFamily:"'Satoshi',sans-serif", padding:"24px 16px" }}>
        <style>{`@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
        <div style={{ maxWidth:480, margin:"0 auto 32px", textAlign:"center" }}>
          <img src="/logo.png" alt="AgendaOS" style={{ width:48, height:48, borderRadius:12, margin:"0 auto 12px", display:"block" }} />
          <div style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.02em" }}>
            Agenda<span style={{color:C.accent}}>OS</span>
          </div>
          <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
            {nomeNegocio ? `Seus agendamentos com ${nomeNegocio}` : "Gerencie seu agendamento"}
          </div>
        </div>
        <div style={{ maxWidth:480, margin:"0 auto", background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Já tenho um agendamento</div>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>SEU WHATSAPP</div>
              <Input value={telefoneBusca}
                onChange={e=>setTelefoneBusca(e.target.value.replace(/\D/g,"").slice(0,11))}
                placeholder="(11) 99999-9999" />
            </div>
            <Btn onClick={buscarMeusAgendamentos} disabled={telefoneBusca.length<10 || buscandoAgendamentos}>
              {buscandoAgendamentos ? "Buscando…" : "Buscar meus agendamentos"}
            </Btn>

            {erroBusca && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>⚠️ {erroBusca}</div>
            )}

            {agendamentosEncontrados !== null && agendamentosEncontrados.length === 0 && (
              <div style={{ fontSize:13, color:C.dim, textAlign:"center", padding:"16px 0" }}>
                Nenhum agendamento futuro encontrado com esse número.
              </div>
            )}

            {agendamentosEncontrados && agendamentosEncontrados.map(ag => (
              <div key={ag.id} style={{
                background:"rgba(255,255,255,0.04)", border:`1px solid ${C.border}`,
                borderRadius:10, padding:"14px 16px", fontSize:13, color:C.muted,
              }}>
                <div style={{ color:C.text, fontWeight:700, marginBottom:4 }}>{ag.servico}</div>
                <div>📅 {ag.data.split("-").reverse().join("/")} às {String(ag.hora).padStart(2,"0")}h</div>
                <button onClick={()=>cancelarAgendamento(ag.id)} disabled={cancelandoId===ag.id} style={{
                  marginTop:10, width:"100%", padding:"9px", borderRadius:10,
                  background:"rgba(239,68,68,0.12)", border:"1px solid rgba(239,68,68,0.35)",
                  color:C.red, fontFamily:"inherit", fontWeight:700, fontSize:12,
                  cursor: cancelandoId===ag.id ? "not-allowed" : "pointer", opacity: cancelandoId===ag.id ? 0.6 : 1,
                }}>
                  {cancelandoId===ag.id ? "Cancelando…" : "Cancelar agendamento"}
                </button>
              </div>
            ))}

            <div style={{ fontSize:12, color:C.dim, textAlign:"center", marginTop:4 }}>
              Quer marcar em outro horário? Cancele o atual e agende de novo.
            </div>

            <button onClick={()=>{setModo("agendar"); setAgendamentosEncontrados(null); setErroBusca("");}} style={{
              background:"none", border:"none", color:C.accent, fontSize:12, cursor:"pointer",
              textDecoration:"underline", fontFamily:"inherit", alignSelf:"center", marginTop:8,
            }}>← Voltar e fazer um novo agendamento</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'Satoshi',sans-serif", padding:"24px 16px" }}>
      <style>{`@import url('https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ maxWidth:480, margin:"0 auto 32px", textAlign:"center" }}>
        <img src="/logo.png" alt="AgendaOS" style={{ width:48, height:48, borderRadius:12, margin:"0 auto 12px", display:"block" }} />
        <div style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.02em" }}>
          Agenda<span style={{color:C.accent}}>OS</span>
        </div>
        <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
          {nomeNegocio ? `Agende seu horário com ${nomeNegocio}` : "Agende seu horário de forma rápida e fácil"}
        </div>
        {instagram && (
          <a href={`https://instagram.com/${instagram}`} target="_blank" rel="noopener noreferrer"
            style={{
              display:"inline-flex", alignItems:"center", gap:6, marginTop:10,
              padding:"6px 14px", borderRadius:20, textDecoration:"none",
              background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
              color:C.text, fontSize:12, fontWeight:700,
            }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="2" width="20" height="20" rx="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
            @{instagram}
          </a>
        )}
      </div>

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* Steps indicator */}
        {step < 5 && (
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            {stepLabels.map((s,i)=>(
              <div key={s} style={{ flex:1, textAlign:"center" }}>
                <div style={{
                  height:4, borderRadius:2, marginBottom:6,
                  background: i+1<=displayStep ? C.accent : "rgba(255,255,255,0.1)",
                }}/>
                <div style={{ fontSize:10, color: i+1<=displayStep ? C.accent : C.dim }}>{s}</div>
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Dados do cliente */}
        {step===1 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Seus dados</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>SEU NOME</div>
                <Input value={nome} onChange={e=>setNome(e.target.value)} placeholder="Como devemos te chamar?" />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>WHATSAPP</div>
                <Input value={telefone}
                  onChange={e=>setTelefone(e.target.value.replace(/\D/g,"").slice(0,11))}
                  placeholder="(11) 99999-9999" />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>E-MAIL (OPCIONAL)</div>
                <Input value={email} onChange={e=>setEmail(e.target.value)}
                  placeholder="Para receber a confirmação por e-mail" type="email" />
              </div>
              <label style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:12, color:C.muted, cursor:"pointer" }}>
                <input type="checkbox" checked={aceitouPrivacidade}
                  onChange={e=>setAceitouPrivacidade(e.target.checked)}
                  style={{ marginTop:2, cursor:"pointer" }} />
                <span>
                  Li e concordo com a{" "}
                  <a href="/privacidade" target="_blank" rel="noreferrer" style={{ color:C.accent }}>
                    política de privacidade
                  </a>
                </span>
              </label>
              <Btn onClick={()=>setStep(2)} disabled={!nome||telefone.length<10||!aceitouPrivacidade}>
                Próximo →
              </Btn>
              <button onClick={()=>setModo("gerenciar")} style={{
                background:"none", border:"none", color:C.accent, fontSize:12, cursor:"pointer",
                textDecoration:"underline", fontFamily:"inherit", alignSelf:"center",
              }}>Já tem um agendamento? Gerencie aqui</button>
            </div>
          </div>
        )}

        {/* Step 2 — Escolher serviço */}
        {step===2 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Escolha o serviço</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {services.map(s=>(
                <div key={s.id} onClick={()=>setServiceId(s.id)} style={{
                  padding:"14px 16px", borderRadius:12, cursor:"pointer",
                  background: serviceId===s.id ? `${C.accent}18` : "rgba(255,255,255,0.04)",
                  border:`1px solid ${serviceId===s.id ? C.accent+"55" : C.border}`,
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  transition:"all 0.15s",
                }}>
                  <div>
                    <div style={{ fontWeight:700, fontSize:14 }}>{s.name}</div>
                    <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>⏱ {s.duration} min</div>
                  </div>
                  <div style={{ fontWeight:800, fontSize:16, color:C.green }}>
                    R$ {Number(s.price).toFixed(2).replace(".",",")}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={()=>setStep(1)} style={{
                flex:1, padding:"10px", borderRadius:10, cursor:"pointer",
                background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
                color:C.muted, fontFamily:"inherit", fontWeight:700, fontSize:13,
              }}>← Voltar</button>
              <button onClick={()=>setStep(hasProfissionais ? 3 : 4)} disabled={!serviceId} style={{
                flex:2, padding:"10px", borderRadius:10, cursor:serviceId?"pointer":"not-allowed",
                background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                border:"none", color:"#111111", fontFamily:"inherit", fontWeight:700, fontSize:13,
                opacity:serviceId?1:0.5,
              }}>Próximo →</button>
            </div>
          </div>
        )}

        {/* Step 3 — Escolher profissional */}
        {step===3 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Escolha o profissional</div>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              <div onClick={()=>setProfissionalId("any")} style={{
                padding:"14px 16px", borderRadius:12, cursor:"pointer",
                background: profissionalId==="any" ? `${C.accent}18` : "rgba(255,255,255,0.04)",
                border:`1px solid ${profissionalId==="any" ? C.accent+"55" : C.border}`,
                transition:"all 0.15s",
              }}>
                <div style={{ fontWeight:700, fontSize:14 }}>🎲 Sem preferência</div>
                <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>Qualquer profissional disponível</div>
              </div>
              {profissionais.map(p=>(
                <div key={p.id} onClick={()=>setProfissionalId(p.id)} style={{
                  padding:"14px 16px", borderRadius:12, cursor:"pointer",
                  background: profissionalId===p.id ? `${C.accent}18` : "rgba(255,255,255,0.04)",
                  border:`1px solid ${profissionalId===p.id ? C.accent+"55" : C.border}`,
                  transition:"all 0.15s",
                }}>
                  <div style={{ fontWeight:700, fontSize:14 }}>💈 {p.name}</div>
                  {p.especialidade && <div style={{ fontSize:11, color:C.dim, marginTop:2 }}>{p.especialidade}</div>}
                </div>
              ))}
            </div>
            <div style={{ display:"flex", gap:10, marginTop:16 }}>
              <button onClick={()=>setStep(2)} style={{
                flex:1, padding:"10px", borderRadius:10, cursor:"pointer",
                background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
                color:C.muted, fontFamily:"inherit", fontWeight:700, fontSize:13,
              }}>← Voltar</button>
              <button onClick={()=>setStep(4)} disabled={profissionalId===undefined} style={{
                flex:2, padding:"10px", borderRadius:10, cursor:profissionalId!==undefined?"pointer":"not-allowed",
                background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                border:"none", color:"#111111", fontFamily:"inherit", fontWeight:700, fontSize:13,
                opacity:profissionalId!==undefined?1:0.5,
              }}>Próximo →</button>
            </div>
          </div>
        )}

        {/* Step 4 — Escolher data e hora */}
        {step===4 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16, padding:24 }}>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:20 }}>Escolha o horário</div>
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>DATA</div>
                <input type="date" value={data} min={today}
                  onChange={e=>setData(e.target.value)} style={{
                  width:"100%", padding:"10px 14px", background:"rgba(255,255,255,0.05)",
                  border:`1px solid ${C.border}`, borderRadius:10, color:C.text,
                  fontSize:13, fontFamily:"inherit", outline:"none",
                }} />
              </div>
              <div>
                <div style={{ fontSize:10, color:C.muted, marginBottom:10 }}>HORÁRIO</div>
                {data && horariosDisponiveis.length===0 ? (
                  <div style={{ fontSize:12, color:C.dim, textAlign:"center", padding:"16px 0" }}>
                    Nenhum horário disponível nessa data (fechado ou lotado). Tente outro dia.
                  </div>
                ) : (
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                  {HOURS.map(h=>{
  const slot = `${String(h).padStart(2,"0")}:00`;
  const ocupado = data ? !horariosDisponiveis.includes(slot) : false;
  return (
    <button key={h} onClick={()=>!ocupado && setHora(h)} style={{
      padding:"10px", borderRadius:10, cursor: ocupado ? "not-allowed" : "pointer",
      background: ocupado ? "rgba(255,255,255,0.02)" : hora===h ? `${C.accent}22` : "rgba(255,255,255,0.04)",
      border:`1px solid ${ocupado ? C.border : hora===h ? C.accent+"55" : C.border}`,
      color: ocupado ? C.dim : hora===h ? C.accent : C.muted,
      fontFamily:"inherit", fontWeight:700, fontSize:13,
      opacity: ocupado ? 0.4 : 1,
      textDecoration: ocupado ? "line-through" : "none",
    }}>
      {String(h).padStart(2,"0")}h
      {ocupado && <div style={{ fontSize:8, color:C.dim }}>ocupado</div>}
    </button>
  );
})}
                </div>
                )}
              </div>

              {/* Resumo */}
              {data && (
                <div style={{ background:`${C.accent}0D`, border:`1px solid ${C.accent}22`,
                  borderRadius:10, padding:"12px 14px", fontSize:12, color:C.muted }}>
                  📋 <strong style={{color:C.text}}>{service?.name}</strong> · {service?.duration}min ·{" "}
                  <strong style={{color:C.green}}>R$ {Number(service?.price||0).toFixed(2).replace(".",",")}</strong><br/>
                  {hasProfissionais && <>💈 {profissionalId==="any" ? "Sem preferência" : (profissional?.name || "—")}<br/></>}
                  📅 {data.split("-").reverse().join("/")} às {String(hora).padStart(2,"0")}h<br/>
                  👤 {nome} · 📱 {telefone}
                </div>
              )}

              {erro && (
                <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                  borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>⚠️ {erro}</div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setStep(hasProfissionais ? 3 : 2)} style={{
                  flex:1, padding:"10px", borderRadius:10, cursor:"pointer",
                  background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
                  color:C.muted, fontFamily:"inherit", fontWeight:700, fontSize:13,
                }}>← Voltar</button>
                <button onClick={handleAgendar} disabled={!data||loading} style={{
                  flex:2, padding:"10px", borderRadius:10,
                  cursor:(!data||loading)?"not-allowed":"pointer",
                  background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                  border:"none", color:"#111111", fontFamily:"inherit", fontWeight:700, fontSize:13,
                  opacity:(!data||loading)?0.5:1,
                }}>{loading?"Agendando…":"✅ Confirmar agendamento"}</button>
              </div>
            </div>
          </div>
        )}

        {/* Step 5 — Confirmado */}
        {step===5 && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:16,
            padding:40, textAlign:"center" }}>
            <div style={{ fontSize:56, marginBottom:16 }}>🎉</div>
            <div style={{ fontWeight:900, fontSize:22, marginBottom:8 }}>Agendado com sucesso!</div>
            <div style={{ fontSize:14, color:C.muted, lineHeight:1.7, marginBottom:24 }}>
              Olá <strong style={{color:C.text}}>{nome}</strong>!<br/>
              Seu agendamento foi confirmado.<br/>
              Em breve você receberá uma confirmação.
            </div>
            <div style={{ background:`${C.accent}0D`, border:`1px solid ${C.accent}22`,
              borderRadius:10, padding:"14px", fontSize:13, color:C.muted, marginBottom:20 }}>
              📋 <strong style={{color:C.text}}>{service?.name}</strong><br/>
              {hasProfissionais && <>💈 {profissionalId==="any" ? "Sem preferência" : (profissional?.name || "—")}<br/></>}
              📅 {data.split("-").reverse().join("/")} às {String(hora).padStart(2,"0")}h
            </div>
            <button onClick={()=>{setStep(1);setNome("");setTelefone("");setEmail("");setServiceId(null);setProfissionalId(undefined);setData("");}} style={{
              padding:"10px 24px", borderRadius:10, cursor:"pointer",
              background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
              color:C.muted, fontFamily:"inherit", fontWeight:700, fontSize:13,
            }}>Fazer outro agendamento</button>
          </div>
        )}
      </div>
    </div>
  );
}
