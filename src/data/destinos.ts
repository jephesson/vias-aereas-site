export type Destino = {
  slug: string;
  nome: string;
  imagem: string;
  categoria: "Internacional" | "Capital" | "Turístico";
  localizacao: string;
  destaque?: boolean;
};

const pasta = "/vias_aereas_destinos_HD";

export const destinos: Destino[] = [
  { slug: "paris", nome: "Paris", imagem: `${pasta}/Paris.png`, categoria: "Internacional", localizacao: "França", destaque: true },
  { slug: "londres", nome: "Londres", imagem: `${pasta}/Londres.png`, categoria: "Internacional", localizacao: "Reino Unido", destaque: true },
  { slug: "amsterda", nome: "Amsterdã", imagem: `${pasta}/Amsterda.png`, categoria: "Internacional", localizacao: "Países Baixos" },
  { slug: "zurique", nome: "Zurique", imagem: `${pasta}/Zurique.png`, categoria: "Internacional", localizacao: "Suíça" },
  { slug: "madrid", nome: "Madrid", imagem: `${pasta}/Madrid.png`, categoria: "Internacional", localizacao: "Espanha" },
  { slug: "lisboa", nome: "Lisboa", imagem: `${pasta}/Lisboa.png`, categoria: "Internacional", localizacao: "Portugal", destaque: true },
  { slug: "roma", nome: "Roma", imagem: `${pasta}/Roma.png`, categoria: "Internacional", localizacao: "Itália" },
  { slug: "berlim", nome: "Berlim", imagem: `${pasta}/Berlim.png`, categoria: "Internacional", localizacao: "Alemanha" },
  { slug: "nova-york", nome: "Nova York", imagem: `${pasta}/Nova_York.png`, categoria: "Internacional", localizacao: "Estados Unidos", destaque: true },
  { slug: "santiago", nome: "Santiago", imagem: `${pasta}/Santiago.png`, categoria: "Internacional", localizacao: "Chile", destaque: true },
  { slug: "sao-paulo", nome: "São Paulo", imagem: `${pasta}/Sao_Paulo.png`, categoria: "Capital", localizacao: "São Paulo", destaque: true },
  { slug: "rio-de-janeiro", nome: "Rio de Janeiro", imagem: `${pasta}/Rio_de_Janeiro.png`, categoria: "Capital", localizacao: "Rio de Janeiro", destaque: true },
  { slug: "brasilia", nome: "Brasília", imagem: `${pasta}/Brasilia.png`, categoria: "Capital", localizacao: "Distrito Federal" },
  { slug: "salvador", nome: "Salvador", imagem: `${pasta}/Salvador.png`, categoria: "Capital", localizacao: "Bahia", destaque: true },
  { slug: "fortaleza", nome: "Fortaleza", imagem: `${pasta}/Fortaleza.png`, categoria: "Capital", localizacao: "Ceará" },
  { slug: "recife", nome: "Recife", imagem: `${pasta}/Recife.png`, categoria: "Capital", localizacao: "Pernambuco" },
  { slug: "porto-alegre", nome: "Porto Alegre", imagem: `${pasta}/Porto_Alegre.png`, categoria: "Capital", localizacao: "Rio Grande do Sul" },
  { slug: "curitiba", nome: "Curitiba", imagem: `${pasta}/Curitiba.png`, categoria: "Capital", localizacao: "Paraná" },
  { slug: "florianopolis", nome: "Florianópolis", imagem: `${pasta}/Florianopolis.png`, categoria: "Capital", localizacao: "Santa Catarina" },
  { slug: "belo-horizonte", nome: "Belo Horizonte", imagem: `${pasta}/Belo_Horizonte.png`, categoria: "Capital", localizacao: "Minas Gerais" },
  { slug: "manaus", nome: "Manaus", imagem: `${pasta}/Manaus.png`, categoria: "Capital", localizacao: "Amazonas" },
  { slug: "belem", nome: "Belém", imagem: `${pasta}/Belem.png`, categoria: "Capital", localizacao: "Pará" },
  { slug: "goiania", nome: "Goiânia", imagem: `${pasta}/Goiania.png`, categoria: "Capital", localizacao: "Goiás" },
  { slug: "cuiaba", nome: "Cuiabá", imagem: `${pasta}/Cuiaba.png`, categoria: "Capital", localizacao: "Mato Grosso" },
  { slug: "campo-grande", nome: "Campo Grande", imagem: `${pasta}/Campo_Grande.png`, categoria: "Capital", localizacao: "Mato Grosso do Sul" },
  { slug: "vitoria", nome: "Vitória", imagem: `${pasta}/Vitoria.png`, categoria: "Capital", localizacao: "Espírito Santo" },
  { slug: "sao-luis", nome: "São Luís", imagem: `${pasta}/Sao_Luis.png`, categoria: "Capital", localizacao: "Maranhão" },
  { slug: "teresina", nome: "Teresina", imagem: `${pasta}/Teresina.png`, categoria: "Capital", localizacao: "Piauí" },
  { slug: "natal", nome: "Natal", imagem: `${pasta}/Natal.png`, categoria: "Capital", localizacao: "Rio Grande do Norte" },
  { slug: "joao-pessoa", nome: "João Pessoa", imagem: `${pasta}/Joao_Pessoa.png`, categoria: "Capital", localizacao: "Paraíba" },
  { slug: "maceio", nome: "Maceió", imagem: `${pasta}/Maceio.png`, categoria: "Capital", localizacao: "Alagoas" },
  { slug: "aracaju", nome: "Aracaju", imagem: `${pasta}/Aracaju.png`, categoria: "Capital", localizacao: "Sergipe" },
  { slug: "porto-velho", nome: "Porto Velho", imagem: `${pasta}/Porto_Velho.png`, categoria: "Capital", localizacao: "Rondônia" },
  { slug: "rio-branco", nome: "Rio Branco", imagem: `${pasta}/Rio_Branco.png`, categoria: "Capital", localizacao: "Acre" },
  { slug: "macapa", nome: "Macapá", imagem: `${pasta}/Macapa.png`, categoria: "Capital", localizacao: "Amapá" },
  { slug: "boa-vista", nome: "Boa Vista", imagem: `${pasta}/Boa_Vista.png`, categoria: "Capital", localizacao: "Roraima" },
  { slug: "palmas", nome: "Palmas", imagem: `${pasta}/Palmas.png`, categoria: "Capital", localizacao: "Tocantins" },
  { slug: "fernando-de-noronha", nome: "Fernando de Noronha", imagem: `${pasta}/Fernando_de_Noronha.png`, categoria: "Turístico", localizacao: "Pernambuco", destaque: true },
  { slug: "bonito", nome: "Bonito", imagem: `${pasta}/Bonito.png`, categoria: "Turístico", localizacao: "Mato Grosso do Sul" },
  { slug: "lencois-maranhenses", nome: "Lençóis Maranhenses", imagem: `${pasta}/Lencois_Maranhenses.png`, categoria: "Turístico", localizacao: "Maranhão" },
  { slug: "jericoacoara", nome: "Jericoacoara", imagem: `${pasta}/Jericoacoara.png`, categoria: "Turístico", localizacao: "Ceará" },
  { slug: "chapada-diamantina", nome: "Chapada Diamantina", imagem: `${pasta}/Chapada_Diamantina.png`, categoria: "Turístico", localizacao: "Bahia" },
  { slug: "foz-do-iguacu", nome: "Foz do Iguaçu", imagem: `${pasta}/Foz_do_Iguacu.png`, categoria: "Turístico", localizacao: "Paraná" },
  { slug: "buzios", nome: "Búzios", imagem: `${pasta}/Buzios.png`, categoria: "Turístico", localizacao: "Rio de Janeiro" },
];

export const destinosDestaque = destinos.filter((destino) => destino.destaque);
