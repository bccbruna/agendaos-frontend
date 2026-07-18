import { useState, useEffect } from "react";

const API = "https://agendaos-backend-production.up.railway.app";

const C = {
  bg:      "#08090F",
  surface: "#0E1018",
  card:    "#131620",
  border:  "rgba(255,255,255,0.07)",
  accent:  "#A855F7",
  accent2: "#7C3AED",
  green:   "#10B981",
  yellow:  "#F59E0B",
  red:     "#EF4444",
  text:    "#F0F0F8",
  muted:   "rgba(240,240,248,0.44)",
  dim:     "rgba(240,240,248,0.18)",
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
      border:"none", borderRadius:10, color:"#fff",
      fontSize:13, fontWeight:700, padding:"12px 24px",
      cursor:disabled?"not-allowed":"pointer", opacity:disabled?0.5:1,
      fontFamily:"inherit", width:"100%", marginTop:8,
    }}>{children}</button>
  );
}

export default function Agendar() {
  const [services,  setServices]  = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [step,      setStep]      = useState(1); // 1=dados, 2=serviço, 3=profissional, 4=horário, 5=confirmado
  const [nome,      setNome]      = useState("");
  const [telefone,  setTelefone]  = useState("");
  const [serviceId, setServiceId] = useState(null);
  const [profissionalId, setProfissionalId] = useState(undefined); // undefined=nao escolheu, "any"=sem preferencia, ou id
  const [data,      setData]      = useState("");
  const [hora,      setHora]      = useState(9);
  const [loading,   setLoading]   = useState(false);
  const [erro,      setErro]      = useState("");
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);

  const HOURS = Array.from({length:11},(_,i)=>i+8);

  useEffect(() => {
  fetch(`${API}/servicos`)
    .then(r=>r.json())
    .then(data => setServices(data.map(s => ({
      id: s.id,
      name: s.nome,
      duration: s.duracao,
      price: s.preco,
    }))))
    .catch(()=>{});
}, []);

useEffect(() => {
  fetch(`${API}/profissionais`)
    .then(r=>r.json())
    .then(data => setProfissionais(data.map(p => ({
      id: p.id,
      name: p.nome,
      especialidade: p.especialidade,
    }))))
    .catch(()=>{});
}, []);

useEffect(() => {
  if (!data || !serviceId) return;
  const profParam = (profissionalId && profissionalId !== "any") ? `&profissional_id=${profissionalId}` : "";
  fetch(`${API}/horarios-disponiveis?data=${data}&servico_id=${serviceId}${profParam}`)
    .then(r => r.json())
    .then(horarios => setHorariosDisponiveis(horarios))
    .catch(() => setHorariosDisponiveis([]));
}, [data, serviceId, profissionalId]);

async function handleAgendar() {
    setErro(""); setLoading(true);
    try {
      // Verifica se cliente já existe pelo telefone
      const buscaRes = await fetch(`${API}/clientes/buscar?telefone=${telefone}`);
      let cliente = await buscaRes.json();

      // Se não existe, cria novo cliente
      if (!cliente || !cliente.id) {
        const clienteRes = await fetch(`${API}/clientes`, {
          method:"POST", headers:{"Content-Type":"application/json"},
          body: JSON.stringify({ nome, telefone, email:"", tipo:"cliente" }),
        });
        cliente = await clienteRes.json();
      }

      const service = services.find(s=>s.id===serviceId);
      await fetch(`${API}/agendamentos`, {
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
      setStep(5);
    } catch {
      setErro("Erro ao agendar. Tente novamente.");
    }
    setLoading(false);
  }

  const service = services.find(s=>s.id===serviceId);
  const profissional = profissionais.find(p=>p.id===profissionalId);
  const today   = new Date().toISOString().split("T")[0];

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text,
      fontFamily:"'DM Sans',sans-serif", padding:"24px 16px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>

      {/* Header */}
      <div style={{ maxWidth:480, margin:"0 auto 32px", textAlign:"center" }}>
        <div style={{ fontWeight:900, fontSize:26, letterSpacing:"-0.02em" }}>
          Agenda<span style={{color:C.accent}}>OS</span>
        </div>
        <div style={{ fontSize:13, color:C.muted, marginTop:4 }}>
          Agende seu horário de forma rápida e fácil
        </div>
      </div>

      <div style={{ maxWidth:480, margin:"0 auto" }}>

        {/* Steps indicator */}
        {step < 5 && (
          <div style={{ display:"flex", gap:8, marginBottom:24 }}>
            {["Seus dados","Serviço","Profissional","Horário"].map((s,i)=>(
              <div key={s} style={{ flex:1, textAlign:"center" }}>
                <div style={{
                  height:4, borderRadius:2, marginBottom:6,
                  background: i+1<=step ? C.accent : "rgba(255,255,255,0.1)",
                }}/>
                <div style={{ fontSize:10, color: i+1<=step ? C.accent : C.dim }}>{s}</div>
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
              <Btn onClick={()=>setStep(2)} disabled={!nome||telefone.length<10}>
                Próximo →
              </Btn>
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
              <button onClick={()=>setStep(3)} disabled={!serviceId} style={{
                flex:2, padding:"10px", borderRadius:10, cursor:serviceId?"pointer":"not-allowed",
                background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                border:"none", color:"#fff", fontFamily:"inherit", fontWeight:700, fontSize:13,
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
                border:"none", color:"#fff", fontFamily:"inherit", fontWeight:700, fontSize:13,
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
              </div>

              {/* Resumo */}
              {data && (
                <div style={{ background:`${C.accent}0D`, border:`1px solid ${C.accent}22`,
                  borderRadius:10, padding:"12px 14px", fontSize:12, color:C.muted }}>
                  📋 <strong style={{color:C.text}}>{service?.name}</strong> · {service?.duration}min ·{" "}
                  <strong style={{color:C.green}}>R$ {Number(service?.price||0).toFixed(2).replace(".",",")}</strong><br/>
                  💈 {profissionalId==="any" ? "Sem preferência" : (profissional?.name || "—")}<br/>
                  📅 {data.split("-").reverse().join("/")} às {String(hora).padStart(2,"0")}h<br/>
                  👤 {nome} · 📱 {telefone}
                </div>
              )}

              {erro && (
                <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                  borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>⚠️ {erro}</div>
              )}

              <div style={{ display:"flex", gap:10 }}>
                <button onClick={()=>setStep(3)} style={{
                  flex:1, padding:"10px", borderRadius:10, cursor:"pointer",
                  background:"rgba(255,255,255,0.06)", border:`1px solid ${C.border}`,
                  color:C.muted, fontFamily:"inherit", fontWeight:700, fontSize:13,
                }}>← Voltar</button>
                <button onClick={handleAgendar} disabled={!data||loading} style={{
                  flex:2, padding:"10px", borderRadius:10,
                  cursor:(!data||loading)?"not-allowed":"pointer",
                  background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
                  border:"none", color:"#fff", fontFamily:"inherit", fontWeight:700, fontSize:13,
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
              💈 {profissionalId==="any" ? "Sem preferência" : (profissional?.name || "—")}<br/>
              📅 {data.split("-").reverse().join("/")} às {String(hora).padStart(2,"0")}h
            </div>
            <button onClick={()=>{setStep(1);setNome("");setTelefone("");setServiceId(null);setProfissionalId(undefined);setData("");}} style={{
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
