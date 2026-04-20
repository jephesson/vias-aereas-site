export const INDICACOES: Record<string, string> = {
  "isadora-zelaquett": "Isadora Zelaquett - Clínica odontológica",
};

export function resolveIndicacaoFromSearch(search: string) {
  const params = new URLSearchParams(search);
  const ref = params.get("ref")?.trim();
  const indicado = params.get("indicado")?.trim();

  if (ref && INDICACOES[ref]) return INDICACOES[ref];
  if (indicado) return indicado;
  return "";
}
