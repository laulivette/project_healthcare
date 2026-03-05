import { useState, useEffect } from "react";

const API_URL = "http://localhost:8000";

const roles = {
  admin: {
    label: "Admin", icon: "⬡", color: "#e63946", bg: "#1a0a0b", accent: "#ff4d5a",
    fields: ["Name","Age","Gender","Blood Type","Medical Condition","Date of Admission","Doctor","Hospital","Insurance Provider","Billing Amount","Room Number","Admission Type","Discharge Date","Medication","Test Results"],
    description: "Accès total — toutes les données",
  },
  doctor: {
    label: "Médecin", icon: "✦", color: "#2ec4b6", bg: "#071a19", accent: "#3dfff0",
    fields: ["Name","Age","Gender","Blood Type","Medical Condition","Date of Admission","Doctor","Hospital","Admission Type","Discharge Date","Medication","Test Results"],
    description: "Accès médical — données financières masquées",
  },
  patient: {
    label: "Patient", icon: "◈", color: "#f4a261", bg: "#1a1005", accent: "#ffc87a",
    fields: ["Name","Age","Gender","Medical Condition","Date of Admission","Discharge Date","Medication"],
    description: "Accès restreint — données personnelles uniquement",
  },
};

const tagColors = {
  "Medical Condition": "#e63946", "Blood Type": "#9b5de5",
  "Admission Type": "#f4a261", "Test Results": "#2ec4b6", "Billing Amount": "#ffd166",
};

export default function App() {
  const [activeRole, setActiveRole] = useState("admin");
  const [activePatient, setActivePatient] = useState(0);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/patients`)
      .then(res => {
        if (!res.ok) throw new Error("Erreur API");
        return res.json();
      })
      .then(data => {
        setPatients(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const role = roles[activeRole];
  const patient = patients[activePatient] || {};

  const logs = patients.length > 0 ? [
    { time: "10:42:01", role: "admin",   msg: `[ACCÈS COMPLET] ${patient.Name} — 15 champs consultés` },
    { time: "10:43:17", role: "doctor",  msg: `[DOSSIER MÉDICAL] ${patient.Name} — 12 champs consultés` },
    { time: "10:44:55", role: "patient", msg: `[MON DOSSIER] ${patient.Name} — 7 champs consultés` },
    { time: "10:45:30", role: "patient", msg: `[ACCÈS REFUSÉ] ${patients[(activePatient + 1) % patients.length]?.Name} a tenté de consulter ${patient.Name}` },
  ] : [];

  // ── États de chargement / erreur ───────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", color: "#444", letterSpacing: "0.2em" }}>
      CHARGEMENT DEPUIS MONGODB...
    </div>
  );

  if (error) return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Courier New', monospace", color: "#e63946", letterSpacing: "0.2em" }}>
      ERREUR : {error}
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#0d0d0d", fontFamily: "'Courier New', monospace", color: "#e0e0e0", padding: "2rem" }}>

      <div style={{ marginBottom: "2rem" }}>
        <div style={{ fontSize: "0.7rem", letterSpacing: "0.3em", color: "#555", textTransform: "uppercase", marginBottom: "0.3rem" }}>Healthcare / Access Control</div>
        <h1 style={{ fontSize: "2rem", fontWeight: "900", letterSpacing: "-0.02em", color: "#fff", margin: 0, lineHeight: 1 }}>PATIENT RECORD VIEWER</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginTop: "0.6rem" }}>
          <div style={{ width: "3rem", height: "2px", background: role.color, transition: "background 0.3s" }} />
          <span style={{ fontSize: "0.6rem", color: "#333", letterSpacing: "0.15em" }}>{patients.length} PATIENTS CHARGÉS DEPUIS MONGODB</span>
        </div>
      </div>

      {/* Role selector */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {Object.entries(roles).map(([key, r]) => (
          <button key={key} onClick={() => setActiveRole(key)} style={{
            padding: "0.5rem 1.2rem", border: `1px solid ${activeRole === key ? r.color : "#2a2a2a"}`,
            background: activeRole === key ? r.color + "18" : "transparent",
            color: activeRole === key ? r.color : "#555",
            cursor: "pointer", fontSize: "0.75rem", letterSpacing: "0.15em",
            textTransform: "uppercase", transition: "all 0.2s", fontFamily: "inherit",
          }}>
            {r.icon} {r.label}
          </button>
        ))}
      </div>

      {/* Patient selector */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.75rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#444", textTransform: "uppercase", marginRight: "0.25rem" }}>Patient :</span>
        {patients.slice(0, 10).map((p, i) => (
          <button key={i} onClick={() => setActivePatient(i)} style={{
            padding: "0.35rem 0.9rem",
            border: `1px solid ${activePatient === i ? role.color : "#222"}`,
            background: activePatient === i ? role.color + "15" : "transparent",
            color: activePatient === i ? role.accent : "#444",
            cursor: "pointer", fontSize: "0.7rem", transition: "all 0.2s", fontFamily: "inherit",
          }}>
            {p.Name}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "1.5rem" }}>
        <div style={{ border: `1px solid ${role.color}30`, background: role.bg, padding: "1.5rem", transition: "all 0.3s" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `1px solid ${role.color}25` }}>
            <div>
              <div style={{ fontSize: "1.4rem", fontWeight: "700", color: "#fff" }}>{patient.Name}</div>
              <div style={{ fontSize: "0.7rem", color: "#555", marginTop: "0.2rem", letterSpacing: "0.1em" }}>
                ID#{String(activePatient + 1).padStart(5, "0")} · {patient["Date of Admission"]}
              </div>
            </div>
            <div style={{ padding: "0.3rem 0.8rem", border: `1px solid ${role.color}`, color: role.color, fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
              {role.icon} {role.label}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            {Object.entries(patient).map(([key, value]) => {
              const visible = role.fields.includes(key);
              const tagColor = tagColors[key];
              return (
                <div key={key} style={{ padding: "0.75rem", background: visible ? "#ffffff08" : "#00000030", border: `1px solid ${visible ? (tagColor || role.color + "30") : "#1a1a1a"}`, transition: "all 0.3s" }}>
                  <div style={{ fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: visible ? (tagColor || role.accent) : "#2a2a2a", marginBottom: "0.3rem" }}>{key}</div>
                  {visible
                    ? <div style={{ fontSize: "0.85rem", color: "#e0e0e0", fontWeight: "600" }}>{String(value)}</div>
                    : <div style={{ fontSize: "0.85rem", color: "#2a2a2a", letterSpacing: "0.3em" }}>████████</div>
                  }
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: `1px solid ${role.color}20`, fontSize: "0.65rem", color: "#444", letterSpacing: "0.1em" }}>
            {role.fields.length}/{Object.keys(patient).length} CHAMPS VISIBLES · {role.description}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ border: "1px solid #1e1e1e", padding: "1rem", background: "#0a0a0a" }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#444", marginBottom: "0.8rem", textTransform: "uppercase" }}>Accès · Résumé</div>
            {Object.entries(roles).map(([key, r]) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.6rem" }}>
                <div style={{ width: "6px", height: "6px", background: r.color, flexShrink: 0 }} />
                <div style={{ fontSize: "0.7rem", color: "#555", flex: 1, textTransform: "uppercase", letterSpacing: "0.1em" }}>{r.label}</div>
                <div style={{ fontSize: "0.75rem", color: r.color, fontWeight: "700" }}>{r.fields.length} champs</div>
              </div>
            ))}
          </div>

          <div style={{ border: "1px solid #1e1e1e", padding: "1rem", background: "#070707", flex: 1 }}>
            <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: "#444", marginBottom: "0.8rem", textTransform: "uppercase" }}>● Journal d'accès</div>
            {logs.map((log, i) => {
              const r = roles[log.role];
              const isRefus = log.msg.includes("REFUSÉ");
              return (
                <div key={i} style={{ marginBottom: "0.75rem", paddingBottom: "0.75rem", borderBottom: i < logs.length - 1 ? "1px solid #111" : "none" }}>
                  <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.2rem", alignItems: "center" }}>
                    <span style={{ fontSize: "0.6rem", color: "#333" }}>{log.time}</span>
                    <span style={{ fontSize: "0.55rem", padding: "0.1rem 0.4rem", border: `1px solid ${isRefus ? "#e63946" : r.color}50`, color: isRefus ? "#e63946" : r.color, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                      {isRefus ? "⚠ refus" : r.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.65rem", color: isRefus ? "#e63946aa" : "#444", lineHeight: 1.5 }}>{log.msg}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}