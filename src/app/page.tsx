"use client";

import { useMemo, useState } from "react";

const WHATSAPP_NUMBER = "5553999760707"; // 55 + 53 + 999760707
const CNPJ = "63.817.773/0001-85";

type TripType = "ida" | "ida_volta";

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function isAfterOrEqual(a?: string, b?: string) {
  if (!a || !b) return true;
  return a >= b; // YYYY-MM-DD
}

export default function Page() {
  const minToday = useMemo(() => todayISO(), []);

  const [tripType, setTripType] = useState<TripType>("ida_volta");
  const [origem, setOrigem] = useState("");
  const [destino, setDestino] = useState("");

  const [dataIda, setDataIda] = useState("");
  const [dataVolta, setDataVolta] = useState("");

  const [turnoIda, setTurnoIda] = useState("Indiferente");
  const [turnoVolta, setTurnoVolta] = useState("Indiferente");

  const [flexivel, setFlexivel] = useState(false);
  const [bagagem, setBagagem] = useState("Sem bagagem");
  const [obs, setObs] = useState("");

  const [adultos, setAdultos] = useState(1);
  const [criancas, setCriancas] = useState(0);
  const [bebes, setBebes] = useState(0);

  const [ddi, setDdi] = useState("+55");
  const [ddd, setDdd] = useState("");
  const [numero, setNumero] = useState("");

  const totalPax = useMemo(() => adultos + criancas + bebes, [adultos, criancas, bebes]);

  const dateError = useMemo(() => {
    if (tripType === "ida_volta" && dataIda && dataVolta && !isAfterOrEqual(dataVolta, dataIda)) {
      return "A data de volta não pode ser anterior à data de ida.";
    }
    return "";
  }, [tripType, dataIda, dataVolta]);

  const canSubmit = useMemo(() => {
    if (!origem.trim() || !destino.trim()) return false;
    if (!dataIda) return false;
    if (tripType === "ida_volta" && !dataVolta) return false;
    if (dateError) return false;

    if (!ddd.trim() || ddd.replace(/\D/g, "").length < 2) return false;
    if (!numero.trim() || numero.replace(/\D/g, "").length < 8) return false;

    if (totalPax <= 0) return false;
    return true;
  }, [origem, destino, dataIda, dataVolta, tripType, ddd, numero, totalPax, dateError]);

  function buildMessage() {
    const cleanDDI = (ddi || "+55").replace(/\s/g, "");
    const phone = `${cleanDDI} (${ddd}) ${numero}`;

    const linhas = [
      "✈️ *Solicitação de cotação — Vias Aéreas*",
      "⏱️ *Prazo:* retornamos com a cotação em até 2 horas.",
      "",
      `🧭 *Trecho:* ${origem.trim()} → ${destino.trim()}`,
      `🧾 *Tipo:* ${tripType === "ida_volta" ? "Ida e volta" : "Só ida"}`,
      `📅 *Ida:* ${dataIda} (${turnoIda})`,
      tripType === "ida_volta" ? `📅 *Volta:* ${dataVolta} (${turnoVolta})` : null,
      `🔁 *Datas flexíveis:* ${flexivel ? "Sim" : "Não"}`,
      `🧳 *Bagagem:* ${bagagem}`,
      "",
      `👤 *Passageiros:* ${adultos} adulto(s), ${criancas} criança(s), ${bebes} bebê(s) — *Total:* ${totalPax}`,
      "",
      `📞 *Contato:* ${phone}`,
      obs.trim() ? "" : null,
      obs.trim() ? `📝 *Observações:* ${obs.trim()}` : null,
    ].filter(Boolean);

    return linhas.join("\n");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    const msg = buildMessage();
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
  }

  return (
    <main className="va-bg">
      <div className="va-shell">
        <header className="va-header">
          <div className="va-brand">
            <img
              src="/logo-vias-aereas.png"
              alt="Vias Aéreas"
              className="va-logo"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />

            <div>
              <div className="va-pill">
                <span className="va-dot" /> Cotação rápida via WhatsApp
              </div>

              <h1 className="va-title">Solicitar cotação de passagem</h1>

              <p className="va-subtitle">
                Preencha os dados e clique em <b>Enviar no WhatsApp</b>. A mensagem vai prontinha.
                <br />
                <b>Retornamos com a cotação em até 2 horas.</b>
              </p>
            </div>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="va-card">
          {/* Tipo */}
          <section className="va-section">
            <div className="va-label">Tipo de viagem</div>
            <div className="va-row">
              <button
                type="button"
                onClick={() => setTripType("ida_volta")}
                className={`va-chip ${tripType === "ida_volta" ? "va-chip--on" : ""}`}
              >
                Ida e volta
              </button>

              <button
                type="button"
                onClick={() => {
                  setTripType("ida");
                  setDataVolta("");
                }}
                className={`va-chip ${tripType === "ida" ? "va-chip--on" : ""}`}
              >
                Só ida
              </button>
            </div>
          </section>

          {/* Trecho */}
          <section className="va-section">
            <div className="va-label">Trecho</div>
            <div className="va-grid2">
              <input className="va-input" value={origem} onChange={(e) => setOrigem(e.target.value)} placeholder="Origem (ex: Curitiba)" />
              <input className="va-input" value={destino} onChange={(e) => setDestino(e.target.value)} placeholder="Destino (ex: São Paulo)" />
            </div>
          </section>

          {/* Datas */}
          <section className="va-section">
            <div className="va-label">Datas e turnos</div>

            <div className="va-grid2">
              <div className="va-box">
                <div className="va-boxTitle">Ida</div>
                <div className="va-stack">
                  <input
                    className="va-input"
                    type="date"
                    min={minToday}
                    value={dataIda}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDataIda(v);
                      if (dataVolta && v && !isAfterOrEqual(dataVolta, v)) setDataVolta("");
                    }}
                  />
                  <select className="va-input" value={turnoIda} onChange={(e) => setTurnoIda(e.target.value)}>
                    <option>Indiferente</option>
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Madrugada</option>
                  </select>
                </div>
              </div>

              <div className={`va-box ${tripType === "ida" ? "va-disabled" : ""}`}>
                <div className="va-boxTitle">Volta</div>
                <div className="va-stack">
                  <input
                    className="va-input"
                    type="date"
                    min={dataIda ? dataIda : minToday}
                    value={dataVolta}
                    onChange={(e) => setDataVolta(e.target.value)}
                    disabled={tripType === "ida"}
                  />
                  <select
                    className="va-input"
                    value={turnoVolta}
                    onChange={(e) => setTurnoVolta(e.target.value)}
                    disabled={tripType === "ida"}
                  >
                    <option>Indiferente</option>
                    <option>Manhã</option>
                    <option>Tarde</option>
                    <option>Noite</option>
                    <option>Madrugada</option>
                  </select>
                </div>
              </div>
            </div>

            <label className="va-check">
              <input type="checkbox" checked={flexivel} onChange={(e) => setFlexivel(e.target.checked)} />
              Minhas datas são flexíveis (pode sugerir alternativas)
            </label>

            {dateError ? <div style={{ fontSize: 12, color: "rgba(249,115,22,.95)" }}>{dateError}</div> : null}
          </section>

          {/* Passageiros */}
          <section className="va-section">
            <div className="va-label">Passageiros</div>
            <div className="va-grid3">
              <Counter label="Adultos" value={adultos} setValue={setAdultos} min={1} />
              <Counter label="Crianças" value={criancas} setValue={setCriancas} min={0} />
              <Counter label="Bebês" value={bebes} setValue={setBebes} min={0} />
            </div>
          </section>

          {/* Bagagem */}
          <section className="va-section">
            <div className="va-label">Bagagem</div>
            <select className="va-input" value={bagagem} onChange={(e) => setBagagem(e.target.value)}>
              <option>Sem bagagem</option>
              <option>Bagagem de mão</option>
              <option>Despachada 23kg</option>
              <option>Despachada 2 malas</option>
              <option>Indiferente (cotem todas)</option>
            </select>
          </section>

          {/* Telefone */}
          <section className="va-section">
            <div className="va-label">Telefone para contato</div>
            <div className="va-grid3x">
              <input className="va-input" value={ddi} onChange={(e) => setDdi(e.target.value)} placeholder="+55" />
              <input
                className="va-input"
                value={ddd}
                onChange={(e) => setDdd(e.target.value.replace(/\D/g, "").slice(0, 2))}
                placeholder="DDD"
              />
              <input
                className="va-input"
                value={numero}
                onChange={(e) => setNumero(e.target.value.replace(/\D/g, "").slice(0, 9))}
                placeholder="Número"
              />
            </div>
          </section>

          {/* Observações */}
          <section className="va-section">
            <div className="va-label">Observações (opcional)</div>
            <textarea
              className="va-input"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: voos diretos, horários preferidos, mala extra, etc."
              rows={4}
            />
          </section>

          <div className="va-footer">
            <div className="va-note">
              Ao enviar, abrirá o WhatsApp com a mensagem pronta. <b>Cotação em até 2h.</b>
            </div>

            <button type="submit" disabled={!canSubmit} className={`va-cta ${canSubmit ? "" : "va-cta--off"}`}>
              Enviar cotação no WhatsApp
            </button>
          </div>
        </form>

        <footer className="va-copy">
          © {new Date().getFullYear()} Vias Aéreas • CNPJ {CNPJ}
        </footer>
      </div>
    </main>
  );
}

function Counter({
  label,
  value,
  setValue,
  min,
}: {
  label: string;
  value: number;
  setValue: (n: number) => void;
  min: number;
}) {
  return (
    <div className="va-counter">
      <div className="va-counterLabel">{label}</div>
      <div className="va-counterRow">
        <button type="button" className="va-counterBtn" onClick={() => setValue(Math.max(min, value - 1))}>
          −
        </button>
        <div className="va-counterVal">{value}</div>
        <button type="button" className="va-counterBtn" onClick={() => setValue(value + 1)}>
          +
        </button>
      </div>
    </div>
  );
}
