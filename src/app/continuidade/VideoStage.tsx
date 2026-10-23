"use client";

import { useEffect, useRef } from "react";

export default function VideoStage({
  stream,
  empty,
  mirror = false,
}: {
  stream: MediaStream | null;
  empty: string;
  mirror?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    node.srcObject = stream;
    if (stream) void node.play().catch(() => undefined);
  }, [stream]);

  return (
    <div className="ct-stage">
      <video ref={ref} autoPlay playsInline muted className={mirror ? "is-mirror" : undefined} />
      {!stream && <p>{empty}</p>}
    </div>
  );
}
