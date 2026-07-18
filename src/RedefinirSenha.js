import { useState } from "react";
import { useSearchParams } from "react-router-dom";

const API = "https://agendaos-backend-production.up.railway.app";

const C = {
  bg:      "#08090F",
  surface: "#0E1018",
  card:    "#131620",
  border:  "rgba(255,255,255,0.07)",
  accent:  "#A855F7",
  accent2: "#7C3AED",
  red:     "#EF4444",
  text:    "#F0F0F8",
  muted:   "rgba(240,240,248,0.44)",
};

function Input({ value, onChange, placeholder, type="text" }) {
  return (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type}
      style={{ background:"rgba(255,255,255,0.05)", border:`1px solid ${C.border}`,
        borderRadius:10, padding:"10px 14px", color:C.text, fontSize:13,
        outline:"none", fontFamily:"inherit", width:"100%" }} />
  );
}

export default function RedefinirSenha() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [senhaNova,    setSenhaNova]    = useState("");
  const [senhaConfirm, setSenhaConfirm] = useState("");
  const [erro,         setErro]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [sucesso,      setSucesso]      = useState(false);
  const [mostrarNova, setMostrarNova] = useState(false);
  const [mostrarConfirm, setMostrarConfirm] = useState(false);

  async function handleRedefinir() {
    setErro("");
    if (senhaNova.length < 6) { setErro("A senha deve ter pelo menos 6 caracteres."); return; }
    if (senhaNova !== senhaConfirm) { setErro("As senhas não coincidem."); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, senha_nova: senhaNova }),
      });
      const data = await res.json();
      if (data.ok) { setSucesso(true); }
      else { setErro(data.erro || "Erro ao redefinir senha."); }
    } catch {
      setErro("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, display:"flex",
      alignItems:"center", justifyContent:"center", fontFamily:"'DM Sans',sans-serif", padding:24 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap'); *{box-sizing:border-box;margin:0;padding:0}`}</style>
      <div style={{
        background:C.surface, border:`1px solid ${C.border}`,
        borderRadius:20, padding:32, width:"100%", maxWidth:400,
      }}>
        <div style={{ textAlign:"center", marginBottom:24 }}>
          <div style={{ fontSize:36, marginBottom:12 }}>🔐</div>
          <div style={{ fontWeight:800, fontSize:18 }}>Criar nova senha</div>
        </div>

        {!token ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.6 }}>
              Esse link de recuperação está incompleto ou inválido. Volte para a tela de login e solicite um novo.
            </div>
            <a href="/" style={{ display:"inline-block", marginTop:16, color:C.accent, fontSize:13, textDecoration:"underline" }}>
              Ir para o login
            </a>
          </div>
        ) : sucesso ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:13, color:C.muted, lineHeight:1.6, marginBottom:20 }}>
              ✅ Senha redefinida com sucesso! Já pode entrar com a nova senha.
            </div>
            <a href="/" style={{ color:C.accent, fontSize:13, textDecoration:"underline" }}>Ir para o login</a>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>NOVA SENHA</div>
              <div style={{ position:"relative" }}>
                <Input type={mostrarNova ? "text" : "password"} value={senhaNova}
                  onChange={e=>setSenhaNova(e.target.value)} placeholder="Mínimo 6 caracteres" />
                <button onClick={()=>setMostrarNova(m=>!m)} style={{
                  position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:16,
                }}>{mostrarNova ? "🙈" : "👁️"}</button>
              </div>
            </div>
            <div>
              <div style={{ fontSize:10, color:C.muted, marginBottom:6 }}>CONFIRMAR SENHA</div>
              <div style={{ position:"relative" }}>
                <Input type={mostrarConfirm ? "text" : "password"} value={senhaConfirm}
                  onChange={e=>setSenhaConfirm(e.target.value)} placeholder="Repita a nova senha" />
                <button onClick={()=>setMostrarConfirm(m=>!m)} style={{
                  position:"absolute", right:10, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", color:C.muted, fontSize:16,
                }}>{mostrarConfirm ? "🙈" : "👁️"}</button>
              </div>
            </div>
            {erro && (
              <div style={{ background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)",
                borderRadius:10, padding:"10px 14px", fontSize:12, color:C.red }}>⚠️ {erro}</div>
            )}
            <button onClick={handleRedefinir} disabled={loading} style={{
              background:`linear-gradient(135deg,${C.accent},${C.accent2})`,
              border:"none", borderRadius:10, color:"#fff",
              fontSize:13, fontWeight:700, padding:"12px 24px",
              cursor:loading?"not-allowed":"pointer", opacity:loading?0.5:1,
              fontFamily:"inherit", width:"100%",
            }}>{loading ? "Salvando…" : "Salvar nova senha"}</button>
          </div>
        )}
      </div>
    </div>
  );
}
