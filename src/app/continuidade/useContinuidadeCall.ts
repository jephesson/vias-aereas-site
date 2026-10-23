"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { DataConnection, Peer } from "peerjs";

type Role = "operator" | "client";
type Facing = "user" | "environment";

type SignalType =
  | "offer"
  | "answer"
  | "ice"
  | "screen-started"
  | "screen-stopped"
  | "camera-started"
  | "camera-stopped"
  | "end-session";

export type ContinuidadeStatus = {
  clientName: string;
  expiresAt: number;
  ended: boolean;
  expired: boolean;
  operatorConnected: boolean;
  clientConnected: boolean;
  screenSharing: boolean;
  cameraConnected: boolean;
};

type Wire = {
  type: string;
  data?: unknown;
  clientName?: string;
  expiresAt?: number;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

const SESSION_MS = 15 * 60 * 1000;

function peerSuffix(value: string) {
  const clean = value.replace(/[^a-zA-Z0-9]/g, "");
  return (clean || "cliente").slice(0, 24);
}

export function useContinuidadeCall(options: {
  token: string;
  role: Role;
  clientId?: string;
  clientName?: string;
  enabled: boolean;
}) {
  const { token, role, clientId, clientName, enabled } = options;
  const polite = role === "client";
  const [status, setStatus] = useState<ContinuidadeStatus | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localCamera, setLocalCamera] = useState<MediaStream | null>(null);
  const [localScreen, setLocalScreen] = useState<MediaStream | null>(null);
  const [facing, setFacing] = useState<Facing | null>(null);
  const [linkState, setLinkState] = useState("Preparando");
  const [mediaError, setMediaError] = useState("");
  const [closed, setClosed] = useState<"ended" | "expired" | "missing" | "busy" | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const makingOffer = useRef(false);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const cameraSender = useRef<RTCRtpSender | null>(null);
  const screenSender = useRef<RTCRtpSender | null>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const channelRef = useRef<DataConnection | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const outbox = useRef<Wire[]>([]);
  const expiresRef = useRef(0);
  const endedRef = useRef(false);
  const context = useRef({ token, role, clientId, clientName: clientName || "Cliente" });
  context.current = { token, role, clientId, clientName: clientName || "Cliente" };

  const stopLocal = useCallback(() => {
    cameraStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = null;
    screenStream.current = null;
    cameraSender.current = null;
    screenSender.current = null;
    setLocalCamera(null);
    setLocalScreen(null);
    setFacing(null);
  }, []);

  const closePeer = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
  }, []);

  const postSignal = useCallback((type: SignalType, data?: unknown) => {
    const payload: Wire = { type, data };
    const channel = channelRef.current;
    if (channel?.open) channel.send(payload);
    else outbox.current.push(payload);
  }, []);

  const flushIce = useCallback(async (pc: RTCPeerConnection) => {
    const queued = pendingIce.current;
    pendingIce.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* candidate de uma descrição anterior */
      }
    }
  }, []);

  const ensurePc = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) postSignal("ice", event.candidate.toJSON());
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      setRemoteStream(stream);
      event.track.onended = () => {
        setRemoteStream((current) => {
          if (!current) return null;
          return current.getTracks().some((track) => track.readyState === "live") ? current : null;
        });
      };
    };

    pc.oniceconnectionstatechange = () => {
      const labels: Record<string, string> = {
        new: "Conectando",
        checking: "Conectando",
        connected: "Ao vivo",
        completed: "Ao vivo",
        disconnected: "Reconectando",
        failed: "Sem caminho direto",
        closed: "Encerrada",
      };
      setLinkState(labels[pc.iceConnectionState] ?? "Conectando");
      if (pc.iceConnectionState === "failed") {
        try {
          pc.restartIce();
        } catch {
          /* este navegador não reinicia o gelo */
        }
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        const offer = await pc.createOffer();
        if (pc.signalingState !== "stable") return;
        await pc.setLocalDescription(offer);
        postSignal("offer", { type: pc.localDescription?.type, sdp: pc.localDescription?.sdp });
      } catch {
        /* o outro lado tenta de novo */
      } finally {
        makingOffer.current = false;
      }
    };

    return pc;
  }, [postSignal]);

  const handleSignalRef = useRef<(signal: { type: string; data?: unknown }) => Promise<void>>(async () => undefined);

  handleSignalRef.current = async (signal) => {
    if (signal.type === "end-session") {
      setClosed("ended");
      return;
    }
    const pc = ensurePc();
    if ((signal.type === "offer" || signal.type === "answer") && signal.data && typeof signal.data === "object" && "type" in signal.data) {
      const description = signal.data as RTCSessionDescriptionInit;
      const collision = description.type === "offer" && (makingOffer.current || pc.signalingState !== "stable");
      if (collision && !polite) return;
      if (description.type === "answer" && pc.signalingState !== "have-local-offer") return;
      if (collision) {
        await Promise.all([pc.setLocalDescription({ type: "rollback" }), pc.setRemoteDescription(description)]);
      } else {
        await pc.setRemoteDescription(description);
      }
      await flushIce(pc);
      if (description.type === "offer") {
        await pc.setLocalDescription(await pc.createAnswer());
        postSignal("answer", { type: pc.localDescription?.type, sdp: pc.localDescription?.sdp });
      }
      return;
    }
    if (signal.type === "ice" && signal.data) {
      const candidate = signal.data as RTCIceCandidateInit;
      if (!pc.remoteDescription) {
        pendingIce.current.push(candidate);
        return;
      }
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* candidato atrasado */
      }
    }
  };

  const onDataRef = useRef<(raw: unknown) => Promise<void>>(async () => undefined);
  onDataRef.current = async (raw) => {
    if (!raw || typeof raw !== "object") return;
    const msg = raw as Wire;
    if (msg.type === "busy") {
      setClosed("busy");
      return;
    }
    if ((msg.type === "hello" || msg.type === "renew") && typeof msg.expiresAt === "number") {
      expiresRef.current = msg.expiresAt;
      setStatus((prev) => ({
        clientName: msg.clientName || prev?.clientName || "",
        expiresAt: msg.expiresAt as number,
        ended: false,
        expired: false,
        operatorConnected: true,
        clientConnected: true,
        screenSharing: prev?.screenSharing ?? false,
        cameraConnected: prev?.cameraConnected ?? false,
      }));
      return;
    }
    if (msg.type === "camera-started" || msg.type === "camera-stopped") {
      setStatus((prev) => (prev ? { ...prev, cameraConnected: msg.type === "camera-started" } : prev));
    }
    if (msg.type === "screen-started" || msg.type === "screen-stopped") {
      setStatus((prev) => (prev ? { ...prev, screenSharing: msg.type === "screen-started" } : prev));
    }
    if (msg.type === "end-session") {
      setClosed("ended");
      return;
    }
    if (msg.type === "offer" || msg.type === "answer" || msg.type === "ice") {
      await handleSignalRef.current(msg);
    }
  };

  useEffect(() => {
    if (!enabled || !/^[A-Z0-9]{12}$/.test(token)) {
      if (enabled && token) setClosed("missing");
      return;
    }

    let stopped = false;
    let timer = 0;
    let attempt = 0;

    if (role === "operator") {
      const key = `continuidade-exp:${token}`;
      const saved = Number(sessionStorage.getItem(key));
      const expiresAt = saved > Date.now() ? saved : Date.now() + SESSION_MS;
      sessionStorage.setItem(key, String(expiresAt));
      expiresRef.current = expiresAt;
      setStatus({
        clientName: context.current.clientName,
        expiresAt,
        ended: false,
        expired: false,
        operatorConnected: true,
        clientConnected: false,
        screenSharing: false,
        cameraConnected: false,
      });
    }

    const schedule = (fn: () => void, ms: number) => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        if (!stopped && !endedRef.current) fn();
      }, ms);
    };

    const watch = (conn: DataConnection) => {
      channelRef.current = conn;
      conn.on("data", (raw) => {
        void onDataRef.current(raw);
      });
      conn.on("open", () => {
        setStatus((prev) => ({
          clientName: context.current.clientName || prev?.clientName || "Cliente",
          expiresAt: role === "operator" ? expiresRef.current : (prev?.expiresAt ?? 0),
          ended: false,
          expired: false,
          operatorConnected: true,
          clientConnected: true,
          screenSharing: Boolean(screenStream.current) || Boolean(prev?.screenSharing),
          cameraConnected: Boolean(cameraStream.current) || Boolean(prev?.cameraConnected),
        }));
        setLinkState((current) => (current === "Ao vivo" ? current : "Conectando"));
        if (role === "operator") {
          conn.send({ type: "hello", clientName: context.current.clientName, expiresAt: expiresRef.current });
        }
        const queued = outbox.current;
        outbox.current = [];
        for (const item of queued) conn.send(item);
      });
      conn.on("close", () => {
        if (channelRef.current !== conn || stopped || endedRef.current) return;
        channelRef.current = null;
        setStatus((prev) => (prev ? { ...prev, clientConnected: false, operatorConnected: role === "operator" } : prev));
        if (role === "client") {
          setLinkState("Reconectando");
          schedule(() => {
            const live = peerRef.current;
            if (!live || live.destroyed || !live.open) {
              void boot();
              return;
            }
            watch(live.connect(`vaop${token}`, { reliable: true, serialization: "json" }));
          }, 1200);
        } else {
          setLinkState((current) => (current === "Ao vivo" ? "Reconectando" : "Aguardando o titular"));
        }
      });
    };

    const boot = async () => {
      if (stopped || endedRef.current) return;
      const { Peer } = await import("peerjs");
      if (stopped || endedRef.current) return;
      const peerId = role === "operator" ? `vaop${token}` : `vacl${peerSuffix(clientId || "cliente")}`;
      const peer = new Peer(peerId, {
        host: "0.peerjs.com",
        port: 443,
        path: "/",
        secure: true,
        config: { iceServers: ICE_SERVERS },
      });
      peerRef.current = peer;

      peer.on("open", () => {
        attempt = 0;
        if (role === "operator") {
          setLinkState((current) => (current === "Ao vivo" ? current : "Aguardando o titular"));
          return;
        }
        setLinkState((current) => (current === "Ao vivo" ? current : "Conectando"));
        watch(peer.connect(`vaop${token}`, { reliable: true, serialization: "json" }));
      });

      peer.on("connection", (incoming) => {
        if (role !== "operator") return;
        const current = channelRef.current;
        if (current?.open && current !== incoming) {
          incoming.on("open", () => {
            incoming.send({ type: "busy" });
            incoming.close();
          });
          return;
        }
        watch(incoming);
      });

      peer.on("disconnected", () => {
        if (stopped || endedRef.current || peer.destroyed) return;
        setLinkState("Reconectando");
        peer.reconnect();
      });

      peer.on("error", (error) => {
        if (stopped || endedRef.current) return;
        const kind = error.type;
        if (!peer.destroyed) peer.destroy();
        if (kind === "peer-unavailable") {
          setLinkState("Aguardando o operador");
          schedule(() => void boot(), 1500);
          return;
        }
        attempt += 1;
        if (attempt > 8) {
          setMediaError("Não consegui manter a sessão aberta. Recarregue a página.");
          return;
        }
        setLinkState("Reconectando");
        schedule(() => void boot(), Math.min(1200 * attempt, 5000));
      });
    };

    const onLeave = () => peerRef.current?.destroy();
    window.addEventListener("beforeunload", onLeave);
    void boot();

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      window.removeEventListener("beforeunload", onLeave);
      peerRef.current?.destroy();
      peerRef.current = null;
      channelRef.current = null;
    };
  }, [clientId, enabled, role, token]);

  useEffect(() => {
    if (!enabled) return;
    const timer = window.setInterval(() => {
      if (expiresRef.current && Date.now() > expiresRef.current) setClosed("expired");
    }, 1000);
    return () => window.clearInterval(timer);
  }, [enabled]);

  useEffect(() => {
    if (!closed) return;
    if (!endedRef.current && (closed === "ended" || closed === "expired")) {
      endedRef.current = true;
      const channel = channelRef.current;
      if (channel?.open) channel.send({ type: "end-session" });
    } else {
      endedRef.current = true;
    }
    stopLocal();
    closePeer();
    peerRef.current?.destroy();
  }, [closePeer, closed, stopLocal]);

  const startCamera = useCallback(async (nextFacing: Facing = "user") => {
    setMediaError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Este navegador não abriu a câmera. Use Safari no iPhone ou Chrome no Android, pelo link da sessão.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { exact: nextFacing }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      if (denied) {
        setMediaError("A câmera precisa da sua permissão. Toque em permitir e escolha de novo.");
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: nextFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (second) {
        const deniedAgain = second instanceof DOMException && (second.name === "NotAllowedError" || second.name === "SecurityError");
        setMediaError(
          deniedAgain
            ? "A câmera precisa da sua permissão. Toque em permitir e escolha de novo."
            : nextFacing === "environment"
              ? "Não encontrei a câmera traseira. Use a frontal."
              : "Não foi possível abrir a câmera frontal deste celular.",
        );
        return;
      }
    }

    cameraStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = stream;
    setLocalCamera(stream);
    setFacing(nextFacing);
    const pc = ensurePc();
    const track = stream.getVideoTracks()[0];
    if (cameraSender.current) await cameraSender.current.replaceTrack(track);
    else cameraSender.current = pc.addTrack(track, stream);
    track.onended = () => {
      setLocalCamera(null);
      setFacing(null);
      postSignal("camera-stopped");
    };
    postSignal("camera-started");
  }, [ensurePc, postSignal]);

  const startScreen = useCallback(async () => {
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Este navegador não compartilha a tela. Abra a sessão no Chrome ou no Edge do computador.");
      return;
    }
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "AbortError");
      setMediaError(denied ? "O compartilhamento foi cancelado. Escolha a aba ou a janela da emissão." : "Não foi possível compartilhar a tela.");
      return;
    }

    setMediaError("");
    screenStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current = stream;
    setLocalScreen(stream);
    const pc = ensurePc();
    const track = stream.getVideoTracks()[0];
    if (screenSender.current) await screenSender.current.replaceTrack(track);
    else screenSender.current = pc.addTrack(track, stream);
    track.onended = () => {
      screenStream.current = null;
      setLocalScreen(null);
      if (screenSender.current && pcRef.current) {
        pcRef.current.removeTrack(screenSender.current);
        screenSender.current = null;
      }
      postSignal("screen-stopped");
    };
    postSignal("screen-started");
  }, [ensurePc, postSignal]);

  const stopScreen = useCallback(() => {
    screenStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current = null;
    setLocalScreen(null);
    if (screenSender.current && pcRef.current) {
      pcRef.current.removeTrack(screenSender.current);
      screenSender.current = null;
    }
    postSignal("screen-stopped");
  }, [postSignal]);

  const finish = useCallback(() => {
    setClosed("ended");
  }, []);

  const renew = useCallback(() => {
    const expiresAt = Date.now() + SESSION_MS;
    expiresRef.current = expiresAt;
    sessionStorage.setItem(`continuidade-exp:${context.current.token}`, String(expiresAt));
    setStatus((prev) => (prev ? { ...prev, expiresAt, expired: false } : prev));
    const channel = channelRef.current;
    if (channel?.open) channel.send({ type: "renew", expiresAt });
  }, []);

  return {
    status,
    remoteStream,
    localCamera,
    localScreen,
    facing,
    linkState,
    mediaError,
    closed,
    startCamera,
    startScreen,
    stopScreen,
    finish,
    renew,
  };
}
