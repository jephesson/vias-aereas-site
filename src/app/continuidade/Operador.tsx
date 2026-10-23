"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoStage from "./VideoStage";
import { useContinuidadeCall } from "./useContinuidadeCall";

type Room = { token: string; clientName: string };

function makeToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function formatToken(token: string) {
  return token.replace(/(.{4})/g, "$1 ").trim();
}

function formatClock(expiresAt: number, now: number) {
  const left = Math.max(0, expiresAt - now);
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function Operador() {
  const params = useSearchParams();
  const existing = params.get("sessao")?.trim().toUpperCase() ?? "";
  const [draft, setDraft] = useState<Room | null>(null);
  const [stored, setStored] = useState<Room | null>(null);
  const [name, setName] = useState("");
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!/^[A-Z0-9]{12}$/.test(existing)) return;
    setStored({
      token: existing,
      clientName: sessionStorage.getItem(`continuidade-name:${existing}`) ?? "Cliente",
    });
  }, [existing]);

  const room = draft ?? stored;
  const call = useContinuidadeCall({
    token: room?.token ?? "",
    role: "operator",
    clientName: room?.clientName,
    enabled: Boolean(room),
  });

  const link = room ? `/continuidade/${room.token}` : "";
  const absoluteLink = typeof window === "undefined" || !link ? link : `${window.location.origin}${link}`;

  useEffect(() => {
    if (!room) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [room]);

  function createSession(event: FormEvent) {
    event.preventDefault();
    const token = makeToken();
    const clientName = name.trim() || "Cliente";
    sessionStorage.setItem(`continuidade-name:${token}`, clientName);
    sessionStorage.setItem(`continuidade-exp:${token}`, String(Date.now() + 15 * 60 * 1000));
    const next = new URL(window.location.href);
    next.searchParams.set("sessao", token);
    window.history.replaceState(null, "", next);
    setDraft({ token, clientName });
  }

  async function copyLink() {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(absoluteLink);
    } catch {
      const input = document.createElement("input");
      input.value = absoluteLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    setCopied(true);
  }

  const clientName = call.status?.clientName || room?.clientName || "Cliente";
  const expiresAt = call.status?.expiresAt ?? 0;

  if (room && call.closed) {
    const message =
      call.closed === "busy"
        ? "Esta sessão já está aberta em outro celular."
        : call.closed === "expired"
          ? "O tempo desta sessão acabou. Crie outra para continuar."
          : "Sessão encerrada. A câmera e a tela foram desligadas.";
    return (
      <main className="ct-page">
        <section className="ct-card">
          <h1>Continuidade</h1>
          <p>{message}</p>
          <a className="ct-button" href="/continuidade">
            Nova sessão
          </a>
        </section>
      </main>
    );
  }

  if (!room) {
    return (
      <main className="ct-page">
        <section className="ct-card">
          <p className="ct-kicker">Operador</p>
          <h1>Continuidade</h1>
          <p>
            Abra a emissão em outra aba, compartilhe essa aba e envie o link para o titular. Ele vê a tela no celular e faz a
            validação na câmera do próprio aparelho. Você vê a câmera dele ao vivo. Nada fica gravado.
          </p>
          <form onSubmit={createSession} className="ct-form">
            <label>
              Nome do titular
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Nome de quem vai validar" maxLength={80} />
            </label>
            <button className="ct-button" type="submit">
              Criar sessão
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="ct-page">
      <section className="ct-card">
        <p className="ct-kicker">Operador · {clientName}</p>
        <h1>Continuidade</h1>
        <div className="ct-pills">
          <span className={call.status?.clientConnected ? "is-on" : ""}>Titular {call.status?.clientConnected ? "conectado" : "aguardando"}</span>
          <span className={call.status?.cameraConnected || call.localCamera ? "is-on" : ""}>
            Câmera {call.status?.cameraConnected ? "ligada" : "aguardando"}
          </span>
          <span className={call.localScreen ? "is-on" : ""}>Tela {call.localScreen ? "compartilhada" : "parada"}</span>
          <span className={call.linkState === "Ao vivo" ? "is-on" : ""}>{call.linkState}</span>
          {expiresAt > 0 && <span>{call.status?.expired ? "Tempo esgotado" : `Expira em ${formatClock(expiresAt, now)}`}</span>}
        </div>

        <div className="ct-room">
          <VideoStage stream={call.remoteStream} empty="A câmera do titular aparece aqui quando ele permitir." />
          <div className="ct-side">
            <p className="ct-code">{formatToken(room.token)}</p>
            <p className="ct-link">{absoluteLink}</p>
            <button className="ct-button" type="button" onClick={() => void copyLink()}>
              {copied ? "Link copiado" : "Copiar link"}
            </button>
            {call.localScreen ? (
              <button className="ct-button ct-button-ghost" type="button" onClick={() => void call.stopScreen()}>
                Parar compartilhamento
              </button>
            ) : (
              <button className="ct-button" type="button" onClick={() => void call.startScreen()}>
                Compartilhar aba ou janela
              </button>
            )}
            <button className="ct-button ct-button-ghost" type="button" onClick={() => void call.renew()}>
              Renovar 15 minutos
            </button>
            <button className="ct-button ct-button-danger" type="button" onClick={() => void call.finish()}>
              Encerrar sessão
            </button>
            {call.mediaError && <p className="ct-error">{call.mediaError}</p>}
            <p className="ct-note">
              O navegador abre um quadro para você escolher a aba ou a janela. Cancelar essa escolha não encerra a sessão. A câmera
              do titular não fica gravada.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
