"use client";

import { useEffect, useState } from "react";
import VideoStage from "./VideoStage";
import { useContinuidadeCall } from "./useContinuidadeCall";

function clientKey() {
  return "continuidade-client";
}

export default function Titular({ token }: { token: string }) {
  const [clientId, setClientId] = useState("");

  useEffect(() => {
    let value = sessionStorage.getItem(clientKey());
    if (!value) {
      value = crypto.randomUUID();
      sessionStorage.setItem(clientKey(), value);
    }
    setClientId(value);
  }, []);

  const call = useContinuidadeCall({
    token,
    role: "client",
    clientId,
    enabled: Boolean(clientId),
  });

  if (call.closed) {
    const message =
      call.closed === "busy"
        ? "Esta sessão já está aberta em outro celular."
        : call.closed === "expired"
          ? "O tempo desta sessão acabou. Peça um novo link ao operador."
          : call.closed === "missing"
            ? "Este link não está completo. Peça um novo link ao operador."
            : "Sessão encerrada. Sua câmera foi desligada e nada ficou gravado.";
    return (
      <main className="ct-page">
        <section className="ct-card">
          <h1>Continuidade</h1>
          <p>{message}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="ct-page">
      <section className="ct-card">
        <p className="ct-kicker">Titular{call.status?.clientName ? ` · ${call.status.clientName}` : ""}</p>
        <h1>Sua validação está sendo realizada</h1>
        <p>A imagem abaixo é a tela que o operador compartilhou. Coloque o rosto na câmera frontal do seu celular, na posição pedida.</p>
        <div className="ct-pills">
          <span className={call.status?.operatorConnected ? "is-on" : ""}>
            Operador {call.status?.operatorConnected ? "conectado" : "aguardando"}
          </span>
          <span className={call.localCamera ? "is-on" : ""}>Câmera {call.localCamera ? "ligada" : "desligada"}</span>
          <span className={call.linkState === "Ao vivo" ? "is-on" : ""}>{call.linkState}</span>
        </div>
        <VideoStage stream={call.remoteStream} empty="A tela da emissão aparece aqui quando o operador compartilhar." />
        <div className="ct-preview">
          <VideoStage stream={call.localCamera} empty="Sua câmera aparece aqui." mirror />
        </div>
        <div className="ct-actions">
          <button className={`ct-button${call.facing === "user" ? " is-on" : ""}`} type="button" onClick={() => void call.startCamera("user")}>
            Câmera frontal
          </button>
          <button
            className={`ct-button${call.facing === "environment" ? " is-on" : " ct-button-ghost"}`}
            type="button"
            onClick={() => void call.startCamera("environment")}
          >
            Câmera traseira
          </button>
          <button className="ct-button ct-button-danger" type="button" onClick={() => void call.finish()}>
            Encerrar
          </button>
        </div>
        {call.mediaError && <p className="ct-error">{call.mediaError}</p>}
        <p className="ct-note">
          {call.localCamera
            ? "Sua câmera está ligada e vai ao operador só durante esta sessão. A imagem não fica gravada."
            : "A câmera só liga depois que você permitir. A imagem não fica gravada."}
        </p>
      </section>
    </main>
  );
}
