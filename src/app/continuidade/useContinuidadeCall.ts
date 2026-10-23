"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Role = "operator" | "client";

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

type Signal = {
  i: number;
  from: Role;
  type: SignalType;
  data?: RTCSessionDescriptionInit | RTCIceCandidateInit | null;
};

const ICE_SERVERS: RTCIceServer[] = [
  { urls: "stun:stun.l.google.com:19302" },
  { urls: "stun:stun1.l.google.com:19302" },
];

function headers(role: Role, operatorSecret?: string, clientId?: string) {
  return {
    "Content-Type": "application/json",
    "x-continuidade-role": role,
    ...(operatorSecret ? { "x-continuidade-secret": operatorSecret } : {}),
    ...(clientId ? { "x-continuidade-client": clientId } : {}),
  };
}

export function useContinuidadeCall(options: {
  token: string;
  role: Role;
  operatorSecret?: string;
  clientId?: string;
  enabled: boolean;
}) {
  const { token, role, operatorSecret, clientId, enabled } = options;
  const polite = role === "client";
  const [status, setStatus] = useState<ContinuidadeStatus | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [localCamera, setLocalCamera] = useState<MediaStream | null>(null);
  const [localScreen, setLocalScreen] = useState<MediaStream | null>(null);
  const [linkState, setLinkState] = useState("Preparando");
  const [mediaError, setMediaError] = useState("");
  const [closed, setClosed] = useState<"ended" | "expired" | "missing" | "busy" | null>(null);

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const makingOffer = useRef(false);
  const cursor = useRef(0);
  const pendingIce = useRef<RTCIceCandidateInit[]>([]);
  const cameraSender = useRef<RTCRtpSender | null>(null);
  const screenSender = useRef<RTCRtpSender | null>(null);
  const cameraStream = useRef<MediaStream | null>(null);
  const screenStream = useRef<MediaStream | null>(null);
  const context = useRef({ token, role, operatorSecret, clientId });
  context.current = { token, role, operatorSecret, clientId };

  const stopLocal = useCallback(() => {
    cameraStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current?.getTracks().forEach((track) => track.stop());
    cameraStream.current = null;
    screenStream.current = null;
    cameraSender.current = null;
    screenSender.current = null;
    setLocalCamera(null);
    setLocalScreen(null);
  }, []);

  const closePeer = useCallback(() => {
    pcRef.current?.getSenders().forEach((sender) => {
      try {
        sender.track?.stop();
      } catch {
        /* already stopped */
      }
    });
    pcRef.current?.close();
    pcRef.current = null;
    setRemoteStream(null);
  }, []);

  const postSignal = useCallback(async (type: SignalType, data?: unknown) => {
    const current = context.current;
    const response = await fetch(`/api/continuidade/${current.token}/signal`, {
      method: "POST",
      headers: headers(current.role, current.operatorSecret, current.clientId),
      body: JSON.stringify({ type, data }),
    });
    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      if (body?.error === "ended" || body?.error === "expired" || body?.error === "missing") {
        setClosed(body.error);
      }
    }
  }, []);

  const flushIce = useCallback(async (pc: RTCPeerConnection) => {
    const queued = pendingIce.current;
    pendingIce.current = [];
    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(candidate);
      } catch {
        /* candidate for a previous description */
      }
    }
  }, []);

  const ensurePc = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    pcRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) void postSignal("ice", event.candidate.toJSON());
    };

    pc.ontrack = (event) => {
      const stream = event.streams[0] ?? new MediaStream([event.track]);
      setRemoteStream(stream);
      event.track.onended = () => {
        setRemoteStream((current) => {
          if (!current) return null;
          const live = current.getTracks().some((track) => track.readyState === "live");
          return live ? current : null;
        });
      };
    };

    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      const labels: Record<string, string> = {
        new: "Preparando",
        checking: "Conectando",
        connected: "Ao vivo",
        completed: "Ao vivo",
        disconnected: "Reconectando",
        failed: "Sem caminho direto",
        closed: "Encerrada",
      };
      setLinkState(labels[state] ?? "Conectando");
      if (state === "failed") {
        try {
          pc.restartIce();
        } catch {
          /* restart not available */
        }
      }
    };

    pc.onnegotiationneeded = async () => {
      try {
        makingOffer.current = true;
        const offer = await pc.createOffer();
        if (pc.signalingState !== "stable") return;
        await pc.setLocalDescription(offer);
        await postSignal("offer", { type: pc.localDescription?.type, sdp: pc.localDescription?.sdp });
      } catch {
        /* the other side will retry on the next poll */
      } finally {
        makingOffer.current = false;
      }
    };

    return pc;
  }, [postSignal]);

  const handleSignal = useCallback(
    async (signal: Signal) => {
      if (signal.type === "end-session") {
        setClosed("ended");
        return;
      }
      const pc = ensurePc();
      if ((signal.type === "offer" || signal.type === "answer") && signal.data && "type" in signal.data) {
        const description = signal.data;
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
          await postSignal("answer", { type: pc.localDescription?.type, sdp: pc.localDescription?.sdp });
        }
        return;
      }
      if (signal.type === "ice" && signal.data) {
        if (!pc.remoteDescription) {
          pendingIce.current.push(signal.data as RTCIceCandidateInit);
          return;
        }
        try {
          await pc.addIceCandidate(signal.data as RTCIceCandidateInit);
        } catch {
          /* ignore stale candidate */
        }
      }
    },
    [ensurePc, flushIce, polite, postSignal],
  );

  useEffect(() => {
    if (!enabled || !token) return;
    let stopped = false;

    async function poll() {
      const current = context.current;
      const response = await fetch(`/api/continuidade/${current.token}/signal?after=${cursor.current}`, {
        headers: headers(current.role, current.operatorSecret, current.clientId),
        cache: "no-store",
      });
      const body = (await response.json().catch(() => null)) as {
        error?: "ended" | "expired" | "missing" | "busy";
        cursor?: number;
        signals?: Signal[];
        status?: ContinuidadeStatus;
      } | null;
      if (stopped || !body) return;
      if (!response.ok) {
        if (body.error === "expired" && current.role === "operator") {
          setStatus((previous) => (previous ? { ...previous, expired: true } : previous));
          return;
        }
        if (body.error === "ended" || body.error === "expired" || body.error === "missing" || body.error === "busy") {
          setClosed(body.error);
        }
        return;
      }
      if (body.status) setStatus(body.status);
      for (const signal of body.signals ?? []) {
        try {
          await handleSignal(signal);
          cursor.current = signal.i;
        } catch {
          break;
        }
      }
    }

    const timer = window.setInterval(() => {
      void poll().catch(() => undefined);
    }, 700);
    void poll().catch(() => undefined);

    return () => {
      stopped = true;
      window.clearInterval(timer);
    };
  }, [enabled, handleSignal, token]);

  useEffect(() => {
    if (!closed) return;
    stopLocal();
    closePeer();
  }, [closePeer, closed, stopLocal]);

  useEffect(() => {
    return () => {
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      screenStream.current?.getTracks().forEach((track) => track.stop());
      pcRef.current?.close();
    };
  }, []);

  const startCamera = useCallback(async () => {
    setMediaError("");
    if (!navigator.mediaDevices?.getUserMedia) {
      setMediaError("Este navegador não abriu a câmera. Use Safari no iPhone ou Chrome no Android, pelo link da sessão.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: "user" }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      cameraStream.current?.getTracks().forEach((track) => track.stop());
      cameraStream.current = stream;
      setLocalCamera(stream);
      const pc = ensurePc();
      const track = stream.getVideoTracks()[0];
      if (cameraSender.current) {
        await cameraSender.current.replaceTrack(track);
      } else {
        cameraSender.current = pc.addTrack(track, stream);
      }
      track.onended = () => {
        setLocalCamera(null);
        void postSignal("camera-stopped");
      };
      await postSignal("camera-started");
    } catch (error) {
      const denied = error instanceof DOMException && (error.name === "NotAllowedError" || error.name === "SecurityError");
      setMediaError(
        denied
          ? "A câmera precisa da sua permissão. Toque em permitir e tente de novo."
          : "Não foi possível abrir a câmera frontal deste celular.",
      );
    }
  }, [ensurePc, postSignal]);

  const startScreen = useCallback(async () => {
    setMediaError("");
    if (!navigator.mediaDevices?.getDisplayMedia) {
      setMediaError("Este navegador não compartilha a tela. Abra a sessão no Chrome ou no Edge do computador.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStream.current?.getTracks().forEach((track) => track.stop());
      screenStream.current = stream;
      setLocalScreen(stream);
      const pc = ensurePc();
      const track = stream.getVideoTracks()[0];
      if (screenSender.current) {
        await screenSender.current.replaceTrack(track);
      } else {
        screenSender.current = pc.addTrack(track, stream);
      }
      track.onended = () => {
        screenStream.current = null;
        setLocalScreen(null);
        if (screenSender.current && pcRef.current) {
          pcRef.current.removeTrack(screenSender.current);
          screenSender.current = null;
        }
        void postSignal("screen-stopped");
      };
      await postSignal("screen-started");
    } catch (error) {
      const denied = error instanceof DOMException && error.name === "NotAllowedError";
      setMediaError(denied ? "O compartilhamento foi cancelado. Escolha a aba ou a janela da emissão." : "Não foi possível compartilhar a tela.");
    }
  }, [ensurePc, postSignal]);

  const stopScreen = useCallback(async () => {
    screenStream.current?.getTracks().forEach((track) => track.stop());
    screenStream.current = null;
    setLocalScreen(null);
    if (screenSender.current && pcRef.current) {
      pcRef.current.removeTrack(screenSender.current);
      screenSender.current = null;
    }
    await postSignal("screen-stopped");
  }, [postSignal]);

  const finish = useCallback(async () => {
    const current = context.current;
    await fetch(`/api/continuidade/${current.token}`, {
      method: "POST",
      headers: headers(current.role, current.operatorSecret, current.clientId),
      body: JSON.stringify({ action: "end" }),
    }).catch(() => undefined);
    setClosed("ended");
  }, []);

  const renew = useCallback(async () => {
    const current = context.current;
    const response = await fetch(`/api/continuidade/${current.token}`, {
      method: "POST",
      headers: headers(current.role, current.operatorSecret, current.clientId),
      body: JSON.stringify({ action: "renew" }),
    });
    const body = (await response.json().catch(() => null)) as (ContinuidadeStatus & { ok?: boolean }) | null;
    if (response.ok && body) setStatus((currentStatus) => ({ ...(currentStatus ?? body), ...body }));
  }, []);

  return {
    status,
    remoteStream,
    localCamera,
    localScreen,
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
