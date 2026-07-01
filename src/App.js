import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Agendar from "./Agendar";
const API = "https://web-production-ea413c.up.railway.app";

/* ── TOKENS ──────────────────────────────────────────────────────── */
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
  blue:    "#3B82F6",
  pink:    "#EC4899",
  text:    "#F0F0F8",
  muted:   "rgba(240,240,248,0.44)",
  dim:     "rgba(240,240,248,0.18)",
};

/* ── BUSINESS TYPES ─────────────────────────────────────────────── */
const BIZ = [
  { id:"salon",    icon:"✂️",  label:"Salão de Beleza",   color:"#EC4899" },
  { id:"barber",   icon:"💈",  label:"Barbearia",         color:"#3B82F6" },
  { id:"clinic",   icon:"🏥",  label:"Clínica / Consultório", color:"#10B981" },
  { id:"petshop",  icon:"🐾",  label:"Pet Shop / Banho",  color:"#F59E0B" },
  { id:"massage",  icon:"💆",  label:"Estética / Massagem",color:"#A855F7" },
  { id:"nail",     icon:"💅",  label:"Nail Designer",     color:"#EC4899" },
];

/* ── DAYS / HOURS ────────────────────────────────────────────────── */
const DAYS_SHORT = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
const DAYS_FULL  = ["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"];
const HOURS = Array.from({length:11},(_,i)=>i+8); // 8h–18h

/* ── SEED DATA ───────────────────────────────────────────────────── */
const SERVICES_INIT = [
  { id:1,  name:"Corte Feminino",      duration:60,  price:80,  biz:"salon",   color:"#EC4899" },
  { id:2,  name:"Coloração",           duration:120, price:200, biz:"salon",   color:"#EC4899" },
  { id:3,  name:"Escova Progressiva",  duration:180, price:350, biz:"salon",   color:"#EC4899" },
  { id:4,  name:"Corte Masculino",     duration:30,  price:45,  biz:"barber",  color:"#3B82F6" },
  { id:5,  name:"Barba",               duration:30,  price:35,  biz:"barber",  color:"#3B82F6" },
  { id:6,  name:"Corte + Barba",       duration:60,  price:75,  biz:"barber",  color:"#3B82F6" },
  { id:7,  name:"Consulta Geral",      duration:30,  price:150, biz:"clinic",  color:"#10B981" },
  { id:8,  name:"Retorno",             duration:20,  price:80,  biz:"clinic",  color:"#10B981" },
  { id:9,  name:"Banho Pequeno Porte", duration:60,  price:60,  biz:"petshop", color:"#F59E0B" },
  { id:10, name:"Tosa + Banho",        duration:90,  price:120, biz:"petshop", color:"#F59E0B" },
  { id:11, name:"Massagem Relaxante",  duration:60,  price:180, biz:"massage", color:"#A855F7" },
  { id:12, name:"Manicure",            duration:45,  price:40,  biz:"nail",    color:"#EC4899" },
];

const CLIENTS_INIT = [
  { id:1,  name:"Ana Silva",       phone:"(11) 98765-4321", email:"ana@email.com",     biz:"salon",   since:"2023-01", visits:12, lastVisit:"2024-07-28" },
  { id:2,  name:"João Pereira",    phone:"(11) 91234-5678", email:"joao@email.com",    biz:"barber",  since:"2023-06", visits:24, lastVisit:"2024-08-01" },
  { id:3,  name:"Maria Santos",    phone:"(11) 99887-6655", email:"maria@email.com",   biz:"clinic",  since:"2024-01", visits:3,  lastVisit:"2024-07-15" },
  { id:4,  name:"Carlos Oliveira", phone:"(11) 97654-3210", email:"carlos@email.com",  biz:"barber",  since:"2022-11", visits:36, lastVisit:"2024-08-01" },
  { id:5,  name:"Beatriz Lima",    phone:"(11) 95555-1234", email:"bia@email.com",     biz:"nail",    since:"2024-03", visits:8,  lastVisit:"2024-07-30" },
  { id:6,  name:"Pedro Costa",     phone:"(11) 93333-9876", email:"pedro@email.com",   biz:"petshop", since:"2023-09", visits:15, lastVisit:"2024-07-25" },
];

// Gera agendamentos para a semana atual
function getWeekDates() {
  const today = new Date();
  const day = today.getDay();
  return Array.from({length:7},(_,i)=>{
    const d = new Date(today);
    d.setDate(today.getDate()-day+i);
    return d;
  });
}

const WEEK = getWeekDates();
const fmt = d => `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}`;
const fmtISO = d => d.toISOString().split("T")[0];

const APTS_INIT = [
  { id:1,  clientId:1, serviceId:1, date:fmtISO(WEEK[1]), hour:9,  status:"confirmed", obs:""          },
  { id:2,  clientId:2, serviceId:6, date:fmtISO(WEEK[1]), hour:10, status:"confirmed", obs:""          },
  { id:3,  clientId:4, serviceId:4, date:fmtISO(WEEK[2]), hour:14, status:"confirmed", obs:""          },
  { id:4,  clientId:3, serviceId:7, date:fmtISO(WEEK[3]), hour:9,  status:"pending",   obs:"Novo paciente" },
  { id:5,  clientId:5, serviceId:12,date:fmtISO(WEEK[3]), hour:11, status:"confirmed", obs:""          },
  { id:6,  clientId:6, serviceId:10,date:fmtISO(WEEK[4]), hour:10, status:"confirmed", obs:"Cachorro grande" },
  { id:7,  clientId:1, serviceId:2, date:fmtISO(WEEK[5]), hour:13, status:"pending",   obs:""          },
  { id:8,  clientId:2, serviceId:5, date:fmtISO(WEEK[0]), hour:11, status:"done",      obs:""          },
];

/* ── HELPERS ─────────────────────────────────────────────────────── */
const fmtBRL = v => `R$ ${Number(v).toFixed(2).replace(".",",")}`;
// eslint-disable-next-line
const fmtPhone = v => v.replace(/\D/g,"").replace(/(\d{2})(\d{5})(\d{4})/,"($1) $2-$3");
const STATUS_META = {
  confirmed: { label:"Confirmado", color:C.green  },
  pending:   { label:"Pendente",   color:C.yellow },
  done:      { label:"Concluído",  color:C.blue   },
  cancelled: { label:"Cancelado",  color:C.red    },
};

/* ── UI ATOMS ────────────────────────────────────────────────────── */
function Badge({ status }) {
  const m = STATUS_META[status] || { label:status, color:C.muted };
  return (
    <span style={{
      fontSize:10, fontWeight:700, letterSpacing:"0.07em",
      padding:"3px 8px", borderRadius:20,
      background:`${m.color}18`, color:m.color,
      border:`1px solid ${m.color}30`,
    }}>{m.label}</span>
  );
}

function Card({ children, style, glow }) {
  return (
    <div style={{
      background:C.card, border:`1px solid ${glow?glow+"33":C.border}`,
      borderRadius:14, padding:20,
      boxShadow:glow?`0 0 20px ${glow}0E`:"none", ...style,
    }}>{children}</div>
  );
}

function Stat({ icon, label, value, sub, color=C.accent }) {
  return (
    <Card style={{ position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute",top:0,right:0,width:70,height:70,
        background:`radial-gradient(circle at top right,${color}18,transparent 70%)` }}/>
      <div style={{ fontSize:22, marginBottom:10 }}>{icon}</div>
      <div style={{ fontSize:10,color:C.muted,letterSpacing:"0.12em",marginBottom:6 }}>{label.toUpperCase()}</div>
      <div style={{ fontSize:26,fontWeight:900,color,letterSpacing:"-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize:11,color:C.dim,marginTop:4 }}>{sub}</div>}
    </Card>
  );
}

function Btn({ children, onClick, variant="primary", size="md", disabled, style }) {
  const bgs = {
    primary: `linear-gradient(135deg,${C.accent},${C.accent2})`,
    ghost:   "rgba(255,255,255,0.06)",
    danger:  "rgba(239,68,68,0.14)",
    success: "rgba(16,185,129,0.14)",
    outline: "transparent",
  };
  const colors = { primary:"#fff", ghost:C.muted, danger:C.red, success:C.green, outline:C.accent };
  const borders = { primary:"none", ghost:`1px solid ${C.border}`, danger:`1px solid rgba(239,68,68,0.3)`, success:`1px solid rgba(16,185,129,0.3)`, outline:`1px solid ${C.accent}55` };
  const pads = { sm:"6px 12px", md:"9px 18px", lg:"13px 26px" };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      background:bgs[variant], border:borders[variant], borderRadius:10,
      color:colors[variant], fontSize:size==="sm"?11:13, fontWeight:700,
      padding:pads[size]||pads.md, cursor:disabled?"not-allowed":"pointer",
      opacity:disabled?0.5:1, fontFamily:"inherit", transition:"all 0.18s",
      display:"inline-flex", alignItems:"center", gap:6, ...style,
    }}>{children}</button>
  );
}

function Input({ value, onChange, placeholder, type="text", style }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
        borderRadius:10, padding:"9px 14px", color:C.text, fontSize:13,
        outline:"none", fontFamily:"inherit", width:"100%", ...style }} />
  );
}

function Modal({ open, onClose, title, width=480, children }) {
  if (!open) return null;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:100,background:"rgba(0,0,0,0.75)",
      backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20 }}
      onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{
        background:C.surface, border:`1px solid rgba(255,255,255,0.13)`,
        borderRadius:20, padding:28, width:"100%", maxWidth:width,
        maxHeight:"88vh", overflowY:"auto",
      }}>
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22 }}>
          <div style={{ fontWeight:800,fontSize:17 }}>{title}</div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:C.muted,fontSize:22,cursor:"pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── APPOINTMENT FORM ────────────────────────────────────────────── */
function AptForm({ initial, clients, services, onSave, onCancel, onCancelWithWhatsApp, onConfirmWithWhatsApp }) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState(initial || {
    clientId:"", serviceId:"", date:today, hour:9, status:"confirmed", obs:"",
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const service = services.find(s=>s.id===parseInt(form.serviceId));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>CLIENTE</div>
        <select value={form.clientId} onChange={e=>set("clientId",e.target.value)} style={{
          width:"100%",padding:"9px 14px",background:"rgba(255,255,255,0.05)",
          border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",
        }}>
          <option value="">Selecione o cliente</option>
          {clients.map(c=><option key={c.id} value={c.id}>{c.name} · {c.phone}</option>)}
        </select>
      </div>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>SERVIÇO</div>
        <select value={form.serviceId} onChange={e=>set("serviceId",e.target.value)} style={{
          width:"100%",padding:"9px 14px",background:"rgba(255,255,255,0.05)",
          border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",
        }}>
          <option value="">Selecione o serviço</option>
          {services.map(s=><option key={s.id} value={s.id}>{s.name} · {s.duration}min · {fmtBRL(s.price)}</option>)}
        </select>
      </div>
      {service && (
        <div style={{ background:`${service.color}10`,border:`1px solid ${service.color}25`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.muted,display:"flex",gap:20 }}>
          <span>⏱ <strong style={{color:C.text}}>{service.duration} min</strong></span>
          <span>💰 <strong style={{color:C.green}}>{fmtBRL(service.price)}</strong></span>
        </div>
      )}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
        <div>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>DATA</div>
          <Input type="date" value={form.date} onChange={e=>set("date",e.target.value)} />
        </div>
        <div>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>HORÁRIO</div>
          <select value={form.hour} onChange={e=>set("hour",parseInt(e.target.value))} style={{
            width:"100%",padding:"9px 14px",background:"rgba(255,255,255,0.05)",
            border:`1px solid ${C.border}`,borderRadius:10,color:C.text,fontSize:13,fontFamily:"inherit",outline:"none",
          }}>
            {HOURS.map(h=><option key={h} value={h}>{String(h).padStart(2,"0")}:00</option>)}
          </select>
        </div>
      </div>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:8 }}>STATUS</div>
        <div style={{ display:"flex",gap:8 }}>
          {Object.entries(STATUS_META).map(([k,m])=>(
            <button key={k} onClick={()=>set("status",k)} style={{
              flex:1,padding:"8px",borderRadius:10,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,
              background:form.status===k?`${m.color}18`:"rgba(255,255,255,0.04)",
              border:`1px solid ${form.status===k?m.color+"44":C.border}`,
              color:form.status===k?m.color:C.muted,
            }}>{m.label}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>OBSERVAÇÕES</div>
        <Input value={form.obs} onChange={e=>set("obs",e.target.value)} placeholder="Informações adicionais…" />
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:4,flexWrap:"wrap" }}>
        {initial && initial.id && initial.status !== "cancelled" && onCancelWithWhatsApp && (
          <Btn variant="danger" size="sm" onClick={()=>onCancelWithWhatsApp(initial)}>
            🚫 Cancelar com WhatsApp
          </Btn>
          
        )}
        {initial && initial.id && initial.status === "pending" && onConfirmWithWhatsApp && (
  <Btn variant="success" size="sm" onClick={()=>onConfirmWithWhatsApp(initial)}>
    ✅ Confirmar com WhatsApp
  </Btn>
)}
        <Btn variant="ghost" onClick={onCancel}>Fechar</Btn>
        <Btn variant="primary" onClick={()=>onSave(form)} disabled={!form.clientId||!form.serviceId}>
          {initial?.id?"Salvar alterações":"Agendar"}
        </Btn>
      </div>
    </div>
  );
}
/* ── LOGIN FORM ─────────────────────────────────────────────────── */
function LoginForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro,  setErro]  = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setErro(""); setLoading(true);
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });
      const data = await res.json();
      if (data.ok) {
        onLogin(email, data.primeiro_acesso);
      } else {
        setErro(data.erro || "Email ou senha incorretos");
      }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>EMAIL</div>
        <Input value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" />
      </div>
      <div>
        <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>SENHA</div>
        <Input type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="••••••••"
          onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
      </div>
      {erro && (
        <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>
          ⚠️ {erro}
        </div>
      )}
      <Btn variant="primary" size="lg" onClick={handleLogin} disabled={loading} style={{ width:"100%", justifyContent:"center" }}>
        {loading ? "Entrando…" : "Entrar"}
      </Btn>
    </div>
  );
}

/* ── TROCAR SENHA FORM ───────────────────────────────────────────── */
function TrocarSenhaForm({ email, onSucesso }) {
  const [senhaNova,    setSenhaNova]    = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro,         setErro]         = useState("");
  const [loading,      setLoading]      = useState(false);

  async function handleTrocar() {
    setErro("");
    if (senhaNova.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (senhaNova !== senhaConfirm) { setErro("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/trocar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha_atual:"trocar123", senha_nova:senhaNova }),
      });
      const data = await res.json();
      if (data.ok) { onSucesso(); }
      else { setErro(data.erro || "Erro ao trocar senha."); }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>NOVA SENHA</div>
        <Input type="password" value={senhaNova} onChange={e=>setSenhaNova(e.target.value)} placeholder="Mínimo 6 caracteres" />
      </div>
      <div>
        <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>CONFIRMAR SENHA</div>
        <Input type="password" value={senhaConfirm} onChange={e=>setSenhaConfirm(e.target.value)} placeholder="Repita a nova senha" />
      </div>
      {erro && (
        <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
          borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>
          ⚠️ {erro}
        </div>
      )}
      <Btn variant="primary" size="lg" onClick={handleTrocar} disabled={loading} style={{ width:"100%", justifyContent:"center" }}>
        {loading ? "Salvando…" : "Criar nova senha e entrar"}
      </Btn>
    </div>
  );
}
/* ── CLIENT FORM ─────────────────────────────────────────────────── */
function ClientForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name:"",phone:"",email:"",biz:"salon",since:"",obs:"" });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>TIPO DE ATENDIMENTO</div>
        <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
          {BIZ.map(b=>(
            <button key={b.id} onClick={()=>set("biz",b.id)} style={{
              padding:"5px 10px",borderRadius:20,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",
              background:form.biz===b.id?`${b.color}20`:"rgba(255,255,255,0.04)",
              border:`1px solid ${form.biz===b.id?b.color+"55":C.border}`,
              color:form.biz===b.id?b.color:C.muted,
            }}>{b.icon} {b.label}</button>
          ))}
        </div>
      </div>
      {[{k:"name",l:"Nome completo"},{k:"phone",l:"WhatsApp / Telefone"},{k:"email",l:"E-mail (opcional)"}].map(f=>(
        <div key={f.k}>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>{f.l.toUpperCase()}</div>
          <Input
  value={form[f.k]}
  onChange={e => {
    const val = f.k === "phone"
      ? e.target.value.replace(/\D/g, "").slice(0, 11)
      : e.target.value;
    set(f.k, val);
  }}
  placeholder={f.l}
/>
        </div>
      ))}
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end",marginTop:6 }}>
        <Btn variant="ghost" onClick={onCancel}>Cancelar</Btn>
        <Btn variant="primary" onClick={()=>onSave(form)} disabled={!form.name}>{initial?"Salvar":"Cadastrar cliente"}</Btn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   VIEWS
═══════════════════════════════════════════════════════════════════ */

/* ── DASHBOARD ───────────────────────────────────────────────────── */
function Dashboard({ apts, clients, services }) {
  const today     = new Date().toISOString().split("T")[0];
  const todayApts = apts.filter(a=>a.date===today);
  const weekRev   = apts.filter(a=>a.status!=="cancelled")
    .reduce((s,a)=>s+(services.find(sv=>sv.id===a.serviceId)?.price||0),0);
  const pending   = apts.filter(a=>a.status==="pending").length;
  const nextApts  = apts
    .filter(a=>a.date>=today&&a.status!=="cancelled"&&a.status!=="done")
    .sort((a,b)=>a.date+a.hour>b.date+b.hour?1:-1)
    .slice(0,5);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14 }}>
        <Stat icon="📅" label="Hoje"            value={todayApts.length}    color={C.accent} sub="agendamentos" />
        <Stat icon="⏳" label="Pendentes"        value={pending}             color={C.yellow} sub="aguardando confirmação" />
        <Stat icon="👥" label="Clientes"         value={clients.length}      color={C.blue}   sub="cadastrados" />
        <Stat icon="💰" label="Receita da semana" value={fmtBRL(weekRev)}   color={C.green}  sub="agendamentos ativos" />
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:16 }}>
        {/* Próximos */}
        <Card>
          <div style={{ fontSize:11,color:C.accent,letterSpacing:"0.12em",fontWeight:700,marginBottom:16 }}>
            📅 PRÓXIMOS AGENDAMENTOS
          </div>
          {nextApts.length===0
            ? <div style={{ fontSize:13,color:C.dim,textAlign:"center",padding:"24px 0" }}>Nenhum agendamento futuro.</div>
            : nextApts.map(a=>{
              const client  = clients.find(c=>c.id===a.clientId);
              const service = services.find(s=>s.id===a.serviceId);
              const dayIdx  = WEEK.findIndex(d=>fmtISO(d)===a.date);
              return (
                <div key={a.id} style={{ display:"flex",alignItems:"center",gap:12,padding:"11px 0",borderBottom:`1px solid ${C.border}` }}>
                  <div style={{
                    width:44,height:44,borderRadius:10,flexShrink:0,
                    background:`${service?.color||C.accent}18`,
                    display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                  }}>
                    <div style={{ fontSize:11,fontWeight:900,color:service?.color||C.accent }}>{String(a.hour).padStart(2,"0")}h</div>
                    <div style={{ fontSize:9,color:C.dim }}>{dayIdx>=0?DAYS_SHORT[dayIdx]:a.date.slice(5)}</div>
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {client?.name||"—"}
                    </div>
                    <div style={{ fontSize:11,color:C.dim }}>{service?.name} · {service?.duration}min</div>
                  </div>
                  <div style={{ flexShrink:0,textAlign:"right" }}>
                    <div style={{ fontSize:13,fontWeight:800,color:C.green }}>{fmtBRL(service?.price||0)}</div>
                    <Badge status={a.status} />
                  </div>
                </div>
              );
            })
          }
        </Card>

        {/* Hoje */}
        <Card>
          <div style={{ fontSize:11,color:C.green,letterSpacing:"0.12em",fontWeight:700,marginBottom:16 }}>
            🌅 AGENDA DE HOJE
          </div>
          {todayApts.length===0
            ? <div style={{ fontSize:13,color:C.dim,textAlign:"center",padding:"24px 0" }}>Dia livre hoje! 🎉</div>
            : todayApts.sort((a,b)=>a.hour-b.hour).map(a=>{
              const client  = clients.find(c=>c.id===a.clientId);
              const service = services.find(s=>s.id===a.serviceId);
              return (
                <div key={a.id} style={{
                  display:"flex",alignItems:"center",gap:12,
                  padding:"10px 12px",borderRadius:10,marginBottom:8,
                  background:`${service?.color||C.accent}0D`,
                  border:`1px solid ${service?.color||C.accent}22`,
                }}>
                  <div style={{ fontWeight:900,fontSize:16,color:service?.color||C.accent,width:36,textAlign:"center",flexShrink:0 }}>
                    {String(a.hour).padStart(2,"0")}h
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700,fontSize:13 }}>{client?.name}</div>
                    <div style={{ fontSize:11,color:C.dim }}>{service?.name}</div>
                  </div>
                  <Badge status={a.status} />
                </div>
              );
            })
          }
        </Card>
      </div>

      {/* Serviços mais agendados */}
      <Card>
        <div style={{ fontSize:11,color:C.purple,letterSpacing:"0.12em",fontWeight:700,marginBottom:16 }}>
          📊 SERVIÇOS MAIS AGENDADOS
        </div>
        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
          {services.slice(0,8).map(s=>{
            const count = apts.filter(a=>a.serviceId===s.id).length;
            return (
              <div key={s.id} style={{
                padding:"10px 16px",borderRadius:12,
                background:`${s.color}10`,border:`1px solid ${s.color}28`,
              }}>
                <div style={{ fontSize:13,fontWeight:700,color:s.color,marginBottom:2 }}>{s.name}</div>
                <div style={{ fontSize:11,color:C.dim }}>{count} agendamentos · {fmtBRL(s.price)}</div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

/* ── CALENDAR (WEEK VIEW) ────────────────────────────────────────── */
function Calendar({ apts, clients, services, onEdit, onNew }) {
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());

  const dayApts = (dayIdx) =>
    apts.filter(a=>a.date===fmtISO(WEEK[dayIdx])).sort((a,b)=>a.hour-b.hour);

  const today = new Date().getDay();

  return (
    <div>
      {/* Day tabs */}
      <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:6,marginBottom:20 }}>
        {WEEK.map((d,i)=>{
          const count = dayApts(i).length;
          const isToday = i===today;
          const isSel   = i===selectedDay;
          return (
            <button key={i} onClick={()=>setSelectedDay(i)} style={{
              padding:"10px 6px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
              background:isSel?`${C.accent}18`:isToday?"rgba(255,255,255,0.05)":"transparent",
              border:`1px solid ${isSel?C.accent+"55":isToday?C.border:C.border}`,
              color:isSel?C.accent:isToday?C.text:C.muted,
              transition:"all 0.15s",
            }}>
              <div style={{ fontSize:10,letterSpacing:"0.1em",marginBottom:4 }}>{DAYS_SHORT[i]}</div>
              <div style={{ fontSize:16,fontWeight:900 }}>{d.getDate()}</div>
              {count>0 && (
                <div style={{
                  marginTop:4,minWidth:18,height:18,borderRadius:20,
                  background:isSel?C.accent:"rgba(168,85,247,0.3)",
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:10,fontWeight:900,color:"#fff",margin:"4px auto 0",
                  padding:"0 5px",
                }}>{count}</div>
              )}
            </button>
          );
        })}
      </div>

      {/* Day header */}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
        <div>
          <div style={{ fontWeight:900,fontSize:18 }}>{DAYS_FULL[selectedDay]}, {fmt(WEEK[selectedDay])}</div>
          <div style={{ fontSize:12,color:C.dim }}>{dayApts(selectedDay).length} agendamento{dayApts(selectedDay).length!==1?"s":""}</div>
        </div>
        <Btn variant="primary" onClick={()=>onNew(fmtISO(WEEK[selectedDay]))}>+ Novo agendamento</Btn>
      </div>

      {/* Hour grid */}
      <Card style={{ padding:0,overflow:"hidden" }}>
        {HOURS.map(h=>{
          const slotApts = dayApts(selectedDay).filter(a=>a.hour===h);
          const isNow = selectedDay===today && new Date().getHours()===h;
          return (
            <div key={h} style={{
              display:"flex",borderBottom:`1px solid ${C.border}`,
              background:isNow?`${C.accent}06`:"transparent",
              minHeight:64,
            }}>
              {/* Hour label */}
              <div style={{
                width:64,flexShrink:0,padding:"8px 12px",
                fontSize:12,fontWeight:700,color:isNow?C.accent:C.dim,
                borderRight:`1px solid ${C.border}`,
                display:"flex",alignItems:"flex-start",paddingTop:10,
              }}>
                {String(h).padStart(2,"0")}:00
                {isNow && <div style={{ width:6,height:6,borderRadius:"50%",background:C.accent,marginLeft:6,marginTop:3,animation:"pulse 1.5s infinite" }}/>}
              </div>

              {/* Slot */}
              <div style={{ flex:1,padding:"6px 10px",display:"flex",gap:8,flexWrap:"wrap",alignItems:"flex-start" }}>
                {slotApts.map(a=>{
                  const client  = clients.find(c=>c.id===a.clientId);
                  const service = services.find(s=>s.id===a.serviceId);
                  const sc      = STATUS_META[a.status];
                  return (
                    <div key={a.id} onClick={()=>onEdit(a)} style={{
                      padding:"8px 14px",borderRadius:10,cursor:"pointer",
                      background:`${service?.color||C.accent}14`,
                      border:`1px solid ${service?.color||C.accent}33`,
                      borderLeft:`3px solid ${service?.color||C.accent}`,
                      minWidth:180,flex:1,transition:"all 0.15s",
                    }}
                    onMouseEnter={e=>e.currentTarget.style.transform="scale(1.01)"}
                    onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                    >
                      <div style={{ fontWeight:800,fontSize:13,marginBottom:2 }}>{client?.name}</div>
                      <div style={{ fontSize:11,color:C.dim }}>{service?.name} · {service?.duration}min</div>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:6 }}>
                        <span style={{ fontSize:11,fontWeight:700,color:C.green }}>{fmtBRL(service?.price||0)}</span>
                        <span style={{ fontSize:9,fontWeight:700,color:sc.color,background:`${sc.color}18`,padding:"2px 6px",borderRadius:10 }}>
                          {sc.label}
                        </span>
                      </div>
                      {a.obs && <div style={{ fontSize:10,color:C.dim,marginTop:4,fontStyle:"italic" }}>📝 {a.obs}</div>}
                    </div>
                  );
                })}
                {slotApts.length===0 && (
                  <div onClick={()=>onNew(fmtISO(WEEK[selectedDay]),h)} style={{
                    flex:1,height:48,borderRadius:8,cursor:"pointer",
                    border:`1px dashed ${C.border}`,
                    display:"flex",alignItems:"center",justifyContent:"center",
                    fontSize:11,color:C.dim,transition:"all 0.15s",
                  }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=C.accent+"55"; e.currentTarget.style.color=C.accent; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.dim; }}
                  >+ agendar</div>
                )}
              </div>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

/* ── CLIENTS ─────────────────────────────────────────────────────── */
function Clients({ clients, apts, services, onAdd, onEdit, onDelete }) {
  const [search, setSearch] = useState("");
  const list = clients.filter(c=>c.name.toLowerCase().includes(search.toLowerCase())||c.phone.includes(search));

  return (
    <div>
      <div style={{ display:"flex",gap:10,marginBottom:16 }}>
        <Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍  Buscar cliente…" style={{ flex:1 }} />
        <Btn variant="primary" onClick={onAdd}>+ Novo cliente</Btn>
      </div>
      <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
        {list.map(c=>{
          const biz     = BIZ.find(b=>b.id===c.biz);
          const cApts   = apts.filter(a=>a.clientId===c.id);
          const revenue = cApts.reduce((s,a)=>s+(services.find(sv=>sv.id===a.serviceId)?.price||0),0);
          const next    = cApts.filter(a=>a.date>=new Date().toISOString().split("T")[0]&&a.status!=="cancelled").sort((a,b)=>a.date>b.date?1:-1)[0];
          return (
            <Card key={c.id} glow={biz?.color}>
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12 }}>
                <div style={{
                  width:44,height:44,borderRadius:12,
                  background:`${biz?.color||C.accent}18`,
                  display:"flex",alignItems:"center",justifyContent:"center",
                  fontSize:20,flexShrink:0,
                }}>{biz?.icon}</div>
                <div style={{ display:"flex", gap:6 }}>
  <Btn variant="ghost" size="sm" onClick={()=>onEdit(c)}>✏️ Editar</Btn>
  <Btn variant="danger" size="sm" onClick={()=>onDelete(c.id)}>🗑️</Btn>
</div>
              </div>
              <div style={{ fontWeight:800,fontSize:15,marginBottom:2 }}>{c.name}</div>
              <div style={{ fontSize:12,color:C.dim,marginBottom:12 }}>
                📱 {c.phone}
                {c.email && <span> · 📧 {c.email}</span>}
              </div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12 }}>
                {[
                  {l:"Visitas",v:cApts.length,c:C.accent},
                  {l:"Faturamento",v:fmtBRL(revenue),c:C.green},
                ].map(({l,v,c:col})=>(
                  <div key={l} style={{ background:"rgba(255,255,255,0.04)",borderRadius:10,padding:"8px 10px" }}>
                    <div style={{ fontSize:10,color:C.dim,marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:14,fontWeight:800,color:col }}>{v}</div>
                  </div>
                ))}
              </div>
              {next && (
                <div style={{ background:`${biz?.color||C.accent}10`,border:`1px solid ${biz?.color||C.accent}25`,borderRadius:8,padding:"7px 10px",fontSize:11,color:C.muted }}>
                  📅 Próximo: <strong style={{color:C.text}}>{next.date.split("-").reverse().join("/")} às {next.hour}h</strong>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* ── SERVICES ────────────────────────────────────────────────────── */
function Services({ services, onEdit, onDelete, onAdd }) {
  const byBiz = {};
  BIZ.forEach(b=>{ byBiz[b.id]=services.filter(s=>s.biz===b.id); });

  return (
   <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
  <div style={{ display:"flex",justifyContent:"flex-end" }}>
    <Btn variant="primary" onClick={onAdd}>+ Novo serviço</Btn>
  </div>
      {BIZ.map(b=>{
        const ss = byBiz[b.id];
        if (!ss.length) return null;
        return (
          <div key={b.id}>
            <div style={{ fontSize:11,color:b.color,letterSpacing:"0.12em",fontWeight:700,marginBottom:12 }}>
              {b.icon} {b.label.toUpperCase()}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10 }}>
              {ss.map(s=>(
                <Card key={s.id} glow={s.color}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
                    <div style={{ fontWeight:800,fontSize:14,color:s.color }}>{s.name}</div>
                    <div style={{ display:"flex", gap:6 }}>
  <Btn variant="ghost" size="sm" onClick={()=>onEdit(s)}>✏️</Btn>
  <Btn variant="danger" size="sm" onClick={()=>onDelete(s.id)}>🗑️</Btn>
</div>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:13 }}>
                    <span style={{ color:C.dim }}>⏱ {s.duration} min</span>
                    <span style={{ fontWeight:800,color:C.green }}>{fmtBRL(s.price)}</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   APP ROOT
═══════════════════════════════════════════════════════════════════ */
const TABS = [
  { id:"dashboard", icon:"📊", label:"Dashboard" },
  { id:"calendar",  icon:"📅", label:"Agenda"    },
  { id:"clients",   icon:"👥", label:"Clientes"  },
  { id:"services",  icon:"✨", label:"Serviços"  },
];

export default function App() {
const [logado, setLogado] = useState(() => localStorage.getItem("logado") === "true");
const [primeiroAcesso, setPrimeiroAcesso] = useState(false);
const [usuarioEmail, setUsuarioEmail] = useState(() => localStorage.getItem("email") || "");
  const [tab,      setTab]      = useState("dashboard");
  const [apts,     setApts]     = useState(APTS_INIT);
  useEffect(() => {
    fetch(`${API}/clientes`)
      .then(r => r.json())
      .then(data => setClients(data.map(c => ({
        id:        c.id,
        name:      c.nome,
        phone:     c.telefone,
        email:     c.email,
        biz:       c.tipo,
        visits:    0,
        since:     c.criado_em?.slice(0,7) || "",
        lastVisit: "—",
      }))))
      .catch(() => console.log("API offline"));

    fetch(`${API}/agendamentos`)
      .then(r => r.json())
      .then(data => setApts(data.map(a => ({
        id:        a.id,
        clientId:  a.cliente_id,
        serviceId: a.serviceId || 1,
        date:      a.data,
        hour:      a.hora,
        status:    a.status,
        obs:       a.obs || "",
      }))))
      .catch(() => console.log("API offline"));
  }, []);
  useEffect(() => {
    // Carrega clientes do banco
    fetch(`${API}/clientes`)
      .then(r => r.json())
      .then(data => setClients(data.map(c => ({
        id:        c.id,
        name:      c.nome,
        phone:     c.telefone,
        email:     c.email,
        biz:       c.tipo,
        visits:    0,
        since:     c.criado_em?.slice(0,7) || "",
        lastVisit: "—",
      }))))
      .catch(() => console.log("API offline, usando dados locais"));

    // Carrega agendamentos do banco
    fetch(`${API}/agendamentos`)
      .then(r => r.json())
      .then(data => setApts(data.map(a => ({
        id:        a.id,
        clientId:  a.cliente_id,
        serviceId: a.serviceId || 1,
        date:      a.data,
        hour:      a.hora,
        status:    a.status,
        obs:       a.obs || "",
      }))))
      .catch(() => console.log("API offline, usando dados locais"));
  }, []);
  const [clients,  setClients]  = useState(CLIENTS_INIT);
  const [services, setServices] = useState(SERVICES_INIT);

  // Modals
  const [aptModal,    setAptModal]    = useState(false);
  const [editApt,     setEditApt]     = useState(null);
  const [aptDate,     setAptDate]     = useState(null);
  const [aptHour,     setAptHour]     = useState(null);
  const [clientModal, setClientModal] = useState(false);
  const [editClient,  setEditClient]  = useState(null);
  const [editService,  setEditService]  = useState(null);
  const [cancelModal,  setCancelModal]  = useState(false);
const [cancelApt,    setCancelApt]    = useState(null);
const [cancelMsg,    setCancelMsg]    = useState("");
const [serviceModal, setServiceModal] = useState(false);

  const pending = apts.filter(a=>a.status==="pending").length;

  function openNewApt(date, hour) {
    setEditApt(null);
    setAptDate(date);
    setAptHour(hour||9);
    setAptModal(true);
  }

 async function handleSaveApt(form) {
    try {
      if (editApt) {
        setApts(as=>as.map(a=>a.id===editApt.id?{...a,...form,clientId:parseInt(form.clientId),serviceId:parseInt(form.serviceId),hour:parseInt(form.hour)}:a));
      } else {
        const service = services.find(s=>s.id===parseInt(form.serviceId));
        const res = await fetch(`${API}/agendamentos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cliente_id: parseInt(form.clientId),
            servico:    service?.name || "",
            data:       form.date,
            hora:       parseInt(form.hour),
            status:     form.status || "confirmado",
            obs:        form.obs || "",
            preco:      service?.price || 0,
          }),
        });
        const saved = await res.json();
        setApts(as=>[...as,{
          id:        saved.id,
          clientId:  saved.cliente_id,
          serviceId: parseInt(form.serviceId),
          date:      saved.data,
          hour:      saved.hora,
          status:    saved.status,
          obs:       saved.obs,
        }]);
      }
    } catch(e) {
      alert("Erro ao salvar agendamento. API rodando?");
    }
    setAptModal(false);
    setEditApt(null);
  }
  async function handleSaveClient(form) {
    try {
      if (editClient) {
        setClients(cs=>cs.map(c=>c.id===editClient.id?{...c,...form}:c));
      } else {
        const res = await fetch(`${API}/clientes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nome:     form.name,
            telefone: form.phone,
            email:    form.email || "",
            tipo:     form.biz   || "salon",
          }),
        });
        const saved = await res.json();
        setClients(cs=>[...cs, {
          id:        saved.id,
          name:      saved.nome,
          phone:     saved.telefone,
          email:     saved.email,
          biz:       saved.tipo,
          visits:    0,
          since:     new Date().toISOString().slice(0,7),
          lastVisit: "—",
        }]);
      }
    } catch(e) {
      alert("Erro ao salvar. API rodando?");
    }
    setClientModal(false);
    setEditClient(null);
  }
async function handleDeleteClient(id) {
    if (!window.confirm("Deseja excluir este cliente?")) return;
    try {
      await fetch(`${API}/clientes/${id}`, { method: "DELETE" });
      setClients(cs => cs.filter(c => c.id !== id));
    } catch(e) {
      alert("Erro ao excluir cliente.");
    }
  }
   function handleCancelApt() {
    if (!cancelApt) return;
    const client  = clients.find(c => c.id === cancelApt.clientId);
    const service = services.find(s => s.id === cancelApt.serviceId);
    
    // Atualiza status para cancelado
    setApts(as => as.map(a => a.id === cancelApt.id ? {...a, status:"cancelled"} : a));
    
    // Abre WhatsApp com mensagem
    const phone = client?.phone?.replace(/\D/g, "");
    const msg = encodeURIComponent(
      `Olá ${client?.name}! 👋\n\n` +
      `Seu agendamento de *${service?.name}* ` +
      `no dia *${cancelApt.date?.split("-").reverse().join("/")}* ` +
      `às *${cancelApt.hour}h* foi cancelado.\n\n` +
      `${cancelMsg ? `Motivo: ${cancelMsg}\n\n` : ""}` +
      `Pedimos desculpas pelo inconveniente. Entre em contato para reagendar! 😊`
    );
    
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
    
    setCancelModal(false);
    setCancelApt(null);
    setCancelMsg("");
  }

  function handleConfirmApt(apt) {
    const client  = clients.find(c => c.id === apt.clientId);
    const service = services.find(s => s.id === apt.serviceId);

    setApts(as => as.map(a => a.id === apt.id ? {...a, status:"confirmed"} : a));

    const phone   = client?.phone?.replace(/\D/g, "");
    const nome    = client?.name || "";
    const servico = service?.name || "";
    const data    = apt.date?.split("-").reverse().join("/") || "";
    const hora    = apt.hour || "";
    const texto   = "Olá " + nome + "! 👋\n\n✅ Seu agendamento foi CONFIRMADO!\n\n📋 Serviço: " + servico + "\n📅 Data: " + data + "\n🕐 Horário: " + hora + "h\n\nTe esperamos! 😊";
    const msg     = encodeURIComponent(texto);

    window.open("https://wa.me/55" + phone + "?text=" + msg, "_blank");
  }
  // eslint-disable-next-line
  async function handleDeleteApt(id) {
   
    if (!window.confirm("Deseja excluir este agendamento?")) return;
    try {
      await fetch(`${API}/agendamentos/${id}`, { method: "DELETE" });
      setApts(as => as.filter(a => a.id !== id));
    } catch(e) {
      alert("Erro ao excluir agendamento.");
    }
  }
  const content = {
    dashboard: <Dashboard apts={apts} clients={clients} services={services} />,
    calendar:  <Calendar  apts={apts} clients={clients} services={services}
                  onEdit={a=>{setEditApt(a);setAptModal(true)}}
                  onNew={openNewApt} />,
    clients:   <Clients   clients={clients} apts={apts} services={services}
                  onAdd={()=>{setEditClient(null);setClientModal(true)}}
                  onEdit={c=>{setEditClient(c);setClientModal(true)}}
onDelete={handleDeleteClient} />,
   services:  <Services services={services} onEdit={s=>{setEditService(s);setServiceModal(true)}} onDelete={id=>setServices(ss=>ss.filter(s=>s.id!==id))} onAdd={()=>{setEditService({id:Date.now(),name:"",duration:60,price:0,biz:"cabelo",color:"#EC4899"});setServiceModal(true)}} />,
  };
// ── Tela de Login ─────────────────────────────────────────
  if (!logado) {
    return (
      <div style={{
        minHeight:"100vh", background:C.bg, display:"flex",
        alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:20, padding:40, width:"100%", maxWidth:400,
        }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{
              width:56, height:56, borderRadius:14, margin:"0 auto 16px",
              background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:26,
            }}>📅</div>
            <div style={{ fontWeight:900, fontSize:22, letterSpacing:"-0.02em" }}>
              Agenda<span style={{color:C.accent}}>OS</span>
            </div>
            <div style={{ fontSize:12, color:C.muted, marginTop:4 }}>
              Entre com suas credenciais
            </div>
          </div>

          <LoginForm
            onLogin={(email, primeiro) => {
              setLogado(true);
              setUsuarioEmail(email);
              setPrimeiroAcesso(primeiro);
              localStorage.setItem("logado", "true");
              localStorage.setItem("email", email);
            }}
          />
        </div>
      </div>
    );
  }

  // ── Tela de Trocar Senha ───────────────────────────────────
  if (logado && primeiroAcesso) {
    return (
      <div style={{
        minHeight:"100vh", background:C.bg, display:"flex",
        alignItems:"center", justifyContent:"center",
        fontFamily:"'DM Sans',sans-serif",
      }}>
        <div style={{
          background:C.surface, border:`1px solid ${C.border}`,
          borderRadius:20, padding:40, width:"100%", maxWidth:400,
        }}>
          <div style={{ textAlign:"center", marginBottom:24 }}>
            <div style={{ fontSize:36, marginBottom:12 }}>🔐</div>
            <div style={{ fontWeight:800, fontSize:18, marginBottom:6 }}>
              Primeiro acesso detectado!
            </div>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
              Por segurança, crie uma nova senha antes de continuar.
            </div>
          </div>

          <TrocarSenhaForm
            email={usuarioEmail}
            onSucesso={() => setPrimeiroAcesso(false)}
          />
          </div>
      </div>
    );
  }
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/agendar" element={<Agendar />} />
        <Route path="/*" element={
          <div style={{ minHeight:"100vh",background:C.bg,color:C.text,fontFamily:"'DM Sans',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:4px;height:4px}
        ::-webkit-scrollbar-thumb{background:rgba(168,85,247,0.3);border-radius:4px}
        select option{background:#0E1018;color:#F0F0F8}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
      `}</style>

      {/* BG */}
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",
        backgroundImage:"linear-gradient(rgba(168,85,247,0.02) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,0.02) 1px,transparent 1px)",
        backgroundSize:"40px 40px",zIndex:0 }}/>
      <div style={{ position:"fixed",top:"-15%",left:"-10%",width:500,height:500,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(168,85,247,0.07),transparent 70%)",pointerEvents:"none",zIndex:0 }}/>
      <div style={{ position:"fixed",bottom:"-15%",right:"-10%",width:400,height:400,borderRadius:"50%",
        background:"radial-gradient(circle,rgba(236,72,153,0.06),transparent 70%)",pointerEvents:"none",zIndex:0 }}/>

      <div style={{ position:"relative",zIndex:1,display:"flex",minHeight:"100vh" }}>

        {/* SIDEBAR */}
        <aside style={{ width:220,background:C.surface,borderRight:`1px solid ${C.border}`,
          display:"flex",flexDirection:"column",padding:"24px 0",
          position:"sticky",top:0,height:"100vh",flexShrink:0 }}>

          <div style={{ padding:"0 20px 24px",borderBottom:`1px solid ${C.border}`,marginBottom:20 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <div style={{
                width:36,height:36,borderRadius:10,
                background:`linear-gradient(135deg,${C.accent},${C.pink})`,
                display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,
              }}>📅</div>
              <div>
                <div style={{ fontWeight:900,fontSize:16,letterSpacing:"-0.02em" }}>Agenda<span style={{color:C.accent}}>OS</span></div>
                <div style={{ fontSize:9,color:C.dim,letterSpacing:"0.14em" }}>AGENDAMENTOS</div>
              </div>
            </div>
          </div>

          <nav style={{ display:"flex",flexDirection:"column",gap:4,padding:"0 10px",flex:1 }}>
            {TABS.map(t=>{
              const active = tab===t.id;
              return (
                <button key={t.id} onClick={()=>setTab(t.id)} style={{
                  display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:10,
                  fontSize:13,fontWeight:active?700:500,
                  color:active?"#fff":C.muted,
                  background:active?`${C.accent}18`:"transparent",
                  border:`1px solid ${active?C.accent+"44":"transparent"}`,
                  cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",position:"relative",
                }}>
                  <span style={{ fontSize:16 }}>{t.icon}</span>
                  {t.label}
                  {t.id==="dashboard"&&pending>0&&(
                    <span style={{
                      marginLeft:"auto",minWidth:18,height:18,background:C.yellow,
                      borderRadius:20,fontSize:10,fontWeight:900,color:"#000",
                      display:"flex",alignItems:"center",justifyContent:"center",padding:"0 5px",
                    }}>{pending}</span>
                  )}
                  {active&&<div style={{ position:"absolute",right:0,top:"20%",bottom:"20%",width:3,background:C.accent,borderRadius:2 }}/>}
                </button>
              );
            })}
          </nav>

          <div style={{ padding:"14px 20px",borderTop:`1px solid ${C.border}` }}>
            <Btn variant="primary" style={{ width:"100%",justifyContent:"center" }}
              onClick={()=>{ setEditApt(null); setAptModal(true); }}>
              + Novo agendamento
            </Btn>
          </div>
        </aside>

        {/* MAIN */}
        <main style={{ flex:1,padding:"32px 36px",overflowY:"auto" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28 }}>
            <div>
              <div style={{ fontSize:10,letterSpacing:"0.16em",color:C.accent,fontWeight:700,marginBottom:6 }}>
                ▸ {TABS.find(t=>t.id===tab)?.label.toUpperCase()}
              </div>
              <h1 style={{ fontSize:24,fontWeight:900,letterSpacing:"-0.025em" }}>
                {tab==="dashboard" && "Visão Geral"}
                {tab==="calendar"  && `Agenda da Semana`}
                {tab==="clients"   && "Meus Clientes"}
                {tab==="services"  && "Serviços Oferecidos"}
              </h1>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:8,padding:"7px 14px",
              background:C.card,border:`1px solid ${C.border}`,borderRadius:20 }}>
              <div style={{ width:7,height:7,borderRadius:"50%",background:C.green,animation:"pulse 2s infinite" }}/>
              <span style={{ fontSize:10,color:C.dim }}>Sistema ativo</span>
            <button onClick={()=>{setLogado(false);setPrimeiroAcesso(false);setUsuarioEmail("");
localStorage.removeItem("logado");
localStorage.removeItem("email");}} style={{
              marginLeft:8, background:"rgba(239,68,68,0.15)",
              border:"1px solid rgba(239,68,68,0.3)",
              borderRadius:8, padding:"3px 8px",
              fontSize:10, color:C.red, cursor:"pointer",
              fontFamily:"inherit", fontWeight:700,
            }}>Sair</button>
            </div>
          </div>

          {content[tab]}
        </main>
      </div>

      {/* Modal agendamento */}
      <Modal open={aptModal} onClose={()=>{setAptModal(false);setEditApt(null)}}
        title={editApt?"Editar agendamento":"Novo agendamento"}>
        <AptForm
          initial={editApt ? editApt : (aptDate ? { clientId:"",serviceId:"",date:aptDate,hour:aptHour||9,status:"confirmed",obs:"" } : null)}
          clients={clients} services={services}
          onSave={handleSaveApt}
          onCancel={()=>{setAptModal(false);setEditApt(null)}}
          onCancelWithWhatsApp={a=>{setCancelApt(a);setAptModal(false);setCancelModal(true)}}
          onConfirmWithWhatsApp={handleConfirmApt}
        />
      </Modal>

      {/* Modal cliente */}
      <Modal open={clientModal} onClose={()=>{setClientModal(false);setEditClient(null)}}
        title={editClient?"Editar cliente":"Novo cliente"}>
        <ClientForm initial={editClient} onSave={handleSaveClient} onCancel={()=>{setClientModal(false);setEditClient(null)}} />
      </Modal>
      {/* Modal serviço */}
<Modal open={serviceModal} onClose={()=>setServiceModal(false)} title="Editar Serviço">
  {editService && (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>NOME DO SERVIÇO</div>
        <Input
          value={editService.name}
          onChange={e=>setEditService(s=>({...s,name:e.target.value}))}
          placeholder="Nome do serviço"
        />
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>DURAÇÃO (min)</div>
            <Input
  type="number"
  value={editService.duration || ""}
  onFocus={e=>e.target.select()}
  onChange={e=>setEditService(s=>({...s,duration:parseInt(e.target.value)||0}))}
  placeholder="60"
/>
        </div>
        <div>
          <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>PREÇO (R$)</div>
        <Input
  type="number"
  value={editService.price || ""}
  onFocus={e=>e.target.select()}
  onChange={e=>setEditService(s=>({...s,price:parseFloat(e.target.value)||0}))}
  placeholder="0.00"
/>
        </div>
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={()=>setServiceModal(false)}>Cancelar</Btn>
        <Btn variant="primary" onClick={()=>{
          setServices(ss=>ss.map(s=>s.id===editService.id?editService:s));
          setServiceModal(false);
        }}>Salvar alterações</Btn>
      </div>
    </div>
  )}
</Modal>
{/* Modal cancelamento */}
<Modal open={cancelModal} onClose={()=>setCancelModal(false)} title="Cancelar Agendamento">
  {cancelApt && (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{
        background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
        borderRadius:10, padding:"12px 16px", fontSize:13, color:C.muted,
      }}>
        ⚠️ O cliente receberá uma mensagem no WhatsApp avisando do cancelamento.
      </div>
      <div>
        <div style={{ fontSize:10,color:C.muted,marginBottom:6 }}>MOTIVO DO CANCELAMENTO (opcional)</div>
        <Input
          value={cancelMsg}
          onChange={e=>setCancelMsg(e.target.value)}
          placeholder="ex: Profissional indisponível, emergência..."
        />
      </div>
      <div style={{ display:"flex",gap:10,justifyContent:"flex-end" }}>
        <Btn variant="ghost" onClick={()=>setCancelModal(false)}>Voltar</Btn>
        <Btn variant="danger" onClick={handleCancelApt}>
          Cancelar agendamento e avisar cliente
        </Btn>
      </div>
    </div>
  )}
</Modal>

  </div>
        } />
      </Routes>
    </BrowserRouter>
  );
}
