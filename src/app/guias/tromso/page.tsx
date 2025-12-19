import React from "react";

export const metadata = {
  title: "Tromsø • Noruega | Vias Aéreas",
  description:
    "Minha experiência em Tromsø: neve pela primeira vez, cultura nórdica, custos, perrengues, aurora boreal e como o ChatGPT ajudou na viagem.",
};

function Photo({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption?: string;
}) {
  return (
    <figure style={{ marginTop: 16, marginBottom: 16 }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          borderRadius: 16,
          display: "block",
          boxShadow: "0 10px 30px rgba(0,0,0,.12)",
        }}
      />
      {caption ? (
        <figcaption
          style={{
            marginTop: 8,
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

function P(
  props: React.HTMLAttributes<HTMLParagraphElement> & {
    children: React.ReactNode;
  }
) {
  const { children, style, ...rest } = props;
  return (
    <p
      {...rest}
      style={{
        marginTop: 12,
        lineHeight: 1.75,
        fontSize: 16,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ marginTop: 24, fontSize: 22, fontWeight: 900 }}>
      {children}
    </h2>
  );
}

export default function TromsoPage() {
  return (
    <main className="va-bg">
      <div className="va-shell">
        <div className="va-card">
          <a
            href="/guias"
            style={{ textDecoration: "none", color: "var(--muted)" }}
          >
            ← Voltar
          </a>

          <h1 className="va-title" style={{ marginTop: 10 }}>
            Tromsø • Noruega
          </h1>

          <p className="va-subtitle">
            Um encontro real com o Ártico: neve pela primeira vez, cultura nórdica,
            perrengues honestos, custos e a aurora boreal.
          </p>

          <Photo
            src="/guias/tromso/centro.jpeg"
            alt="Centro de Tromsø com neve e montanhas ao fundo"
            caption="Chegar em Tromsø em novembro e ver a cidade já branca foi uma sensação que eu não consigo explicar direito — é o tipo de coisa que você precisa viver."
          />

          <H2>🌍 A escolha da cidade</H2>
          <P>
            Escolher Tromsø não foi por acaso. Eu e meu pai decidimos ficar{" "}
            <strong>5 dias</strong> porque a ideia era bem clara:{" "}
            <strong>conhecer a cultura nórdica</strong>,{" "}
            <strong>ver neve pela primeira vez</strong> (a gente nunca tinha visto),
            e tentar realizar um sonho antigo:{" "}
            <strong>ver a aurora boreal</strong>.
          </P>
          <P>
            Por isso, partimos de Londres e fomos direto para Tromsø em novembro.
            Tromsø fica acima do Círculo Polar Ártico — e isso muda tudo: o clima,
            a luz do dia, a vibe da cidade, as pessoas e até a forma como você
            caminha na rua.
          </P>

          <H2>🛫 Chegada ao Ártico</H2>
          <P>
            Pegamos um voo direto da <strong>Norwegian</strong>, com{" "}
            <strong>1 bagagem despachada</strong>. Pagamos algo em torno de{" "}
            <strong>100 euros por pessoa</strong>. Foi muito tranquilo e,
            honestamente, achei um ótimo custo para um destino tão “lá em cima” no
            mapa.
          </P>
          <P>
            O aeroporto é pequeno, bem organizado. Mas o impacto vem quando você
            sai: dá para sentir de verdade o <strong>frio do Ártico</strong>, e a
            neve já aparece mesmo sendo outono.
          </P>

          <Photo
            src="/guias/tromso/passeio.jpeg"
            alt="Passeio na neve em Tromsø"
            caption="Neve, frio e aquela sensação de estar em outro planeta. Para quem nunca viu neve, é difícil explicar o que acontece na cabeça na primeira vez."
          />

          <H2>🚌 O primeiro perrengue (e o começo da história)</H2>
          <P>
            Como o aeroporto é pequeno, tivemos que andar uns{" "}
            <strong>400 metros até a parada de ônibus</strong>. Ali dá para comprar
            o ticket na própria parada ou pelo aplicativo.
          </P>
          <P>
            E aqui entra um detalhe importante:{" "}
            <strong>o ChatGPT foi um grande aliado</strong>. Eu usei para entender
            como funcionava o ticket, qual aplicativo usar, qual ônibus pegar, e
            até o que era mais seguro fazer naquele tipo de clima.
          </P>
          <P>
            Só que… aí veio nosso primeiro perrengue: andar até a parada com mala,
            na neve com chuva, chão molhado, água, gelo e lama tudo misturado. O
            clima parecia não decidir se queria neve, água ou as duas coisas ao
            mesmo tempo.
          </P>
          <P>
            Depois, pegar ônibus e ainda caminhar à noite puxando mala em rua
            escorregadia é uma experiência e tanto — difícil, engraçada depois,
            mas na hora dá vontade de rir e reclamar ao mesmo tempo. Mesmo assim,
            ver neve pela primeira vez é algo surpreendente.
          </P>

          <Photo
            src="/guias/tromso/ponte.jpeg"
            alt="Ponte em Tromsø com neve"
            caption="A travessia da ponte na neve foi uma das cenas mais bonitas da viagem. A cidade parece um cartão-postal andando."
          />

          <H2>🏠 Airbnb e a melhor hospedagem que já tive na Europa</H2>
          <P>
            Pagamos em média <strong>R$ 3.000</strong> para 5 dias (eu e meu pai).
            Era uma casa incrível — dois quartos, sala enorme, e um quarto muito
            confortável. Dividimos a casa com mais um hóspede, mas isso não
            atrapalhou.
          </P>
          <P>
            Foi, até agora, a <strong>melhor hospedagem</strong> que já fiquei na
            Europa nessa faixa de preço (mais ou menos <strong>R$ 750/dia</strong>).
            Tudo muito organizado e funcional.
          </P>
          <P>
            Tromsø é uma cidade pequena, mas o centrinho é lindo. Tem cafés,
            restaurantes, supermercados, fast food… e uma sensação de segurança
            que impressiona. Você sente a vibe da cidade e se sente completo,
            tranquilo, como se o lugar “funcionasse”.
          </P>

          <Photo
            src="/guias/tromso/centrinho.jpeg"
            alt="Centrinho de Tromsø"
            caption="O centrinho de Tromsø é lindinho: cafés, ruas organizadas e uma sensação constante de segurança."
          />

          <H2>💰 Custos, planejamento e a real sobre “Noruega é cara”</H2>
          <P>
            A Noruega é cara, sim. Mas eu sou totalmente contra esse discurso de
            desestimular viagem dizendo “ah, país X é caro”. Viajar para a Europa é
            caro de forma geral — e exige planejamento. Eu passei{" "}
            <strong>1 ano planejando</strong> essa viagem.
          </P>
          <P>
            Em Tromsø, eu devo ter gastado por volta de <strong>R$ 4.000</strong>,
            considerando o tour para a aurora boreal, comer em alguns restaurantes,
            experimentar o king crab e fazer comprinhas.
          </P>
          <div className="va-box" style={{ marginTop: 12 }}>
            <div>✅ Tour da aurora boreal: ~R$ 1.500</div>
            <div>✅ King Crab: ~R$ 600</div>
            <div>✅ Restaurantes e cafés</div>
            <div>✅ Lembrancinhas e extras</div>
          </div>
          <P>
            E um ponto curioso: em outros lugares da Europa, quando você caça
            demais “economia”, às vezes cai em comida suspeita. Na Noruega, mesmo
            gastando menos em alguns lugares, a qualidade costuma ser boa.
          </P>

          <H2>🚶‍♂️ Caminhadas, aquário e o bondinho</H2>
          <P>
            Nos dias seguintes, visitei o aquário e caminhei bastante. Tromsø é
            pequena, e as distâncias geralmente ficam abaixo de 5 km — dá para
            fazer quase tudo a pé.
          </P>
          <P>
            Subi no bondinho (teleférico) e a vista lá de cima é algo que não dá
            para esquecer. No dia que fui, estava por volta de{" "}
            <strong>-7°C</strong>. Era muito mais frio lá em cima — mas foi
            incrível. Até meu pai, que não é fã de frio, amou.
          </P>

          <Photo
            src="/guias/tromso/monte.jpeg"
            alt="Vista do alto em Tromsø"
            caption="A vista lá de cima é uma daquelas coisas que você guarda para sempre. E sim: tem brasileiro até no alto do Ártico."
          />

          <Photo
            src="/guias/tromso/alto_monte.jpeg"
            alt="Panorama do alto do monte em Tromsø"
            caption="Lá do alto, Tromsø parece uma miniatura perfeita: neve, mar, pontes e montanhas. Eu fiquei em silêncio alguns minutos só olhando."
          />

          <H2>🍽️ Culinária: King Crab, cafés e a realidade do McDonald’s</H2>
          <P>
            A culinária foi uma das partes mais legais. Eu evitava fast food, mas
            em um dia de pressa acabei indo ao McDonald’s. Um combo que no Brasil
            pode custar uns 60 reais, em Tromsø me custou uns{" "}
            <strong>150 reais</strong>.
          </P>
          <P>
            A experiência do <strong>King Crab</strong> foi surreal. Lembra comer
            lagosta pela primeira vez: vale muito a pena viver isso, mas não é
            algo para repetir todo dia (e dá um trabalho absurdo para comer).
          </P>
          <P>
            Os cafés são excelentes. Até eu, que não sou muito fã de café, fui
            algumas vezes tomar um mocaccino.
          </P>

          <H2>💊 Farmácia na Noruega: meu lado farmacêutico falou alto</H2>
          <P>
            Com tanta massa na Europa, ficamos constipados — e eu fui comprar
            lactulose. A lactulose comprei sem receita, mas a maioria dos
            medicamentos precisa de prescrição.
          </P>
          <P>
            Por exemplo: o fluconazol, que no Brasil é vendido sem receita, na
            Noruega tinha retenção. Foi interessante ver como a lógica de controle
            muda de país para país.
          </P>

          <H2>👥 Pessoas, segurança e uma reflexão que ficou comigo</H2>
          <P>
            As pessoas são incríveis. Quando descobriam que éramos brasileiros,
            algumas até tentavam falar português. Tromsø é muito receptiva ao
            turismo.
          </P>
          <P>
            Um ponto que me surpreendeu: não se vê mendigos ou pedintes. O nível
            da cidade é altíssimo e a qualidade de vida é surreal. Isso faz a gente
            refletir se, no Brasil, a gente vive ou só sobrevive — mesmo quando
            acha que tem um salário bom.
          </P>
          <P>
            Em um dia, vimos um homem caído no chão. Não sei se era bêbado, doente
            ou outra coisa. Mas várias pessoas pararam para ajudar e chamaram a
            ambulância. No Brasil, em muitos lugares, a tendência seria ignorar por
            medo.
          </P>

          <H2>🤖 Como o ChatGPT me ajudou — e como pode ajudar você</H2>
          <P>
            Eu usei o ChatGPT como um parceiro de viagem. Não foi só “perguntar
            uma coisa ou outra”. Eu usei para: entender transporte (ônibus,
            tickets e apps), planejar rotas a pé com neve, organizar a ordem dos
            passeios, estimar custos e até tirar dúvidas culturais.
          </P>
          <div className="va-box" style={{ marginTop: 12 }}>
            <div>✅ Transporte (ônibus, tickets e apps)</div>
            <div>✅ Rotas a pé com gelo e pontos mais seguros</div>
            <div>✅ Sugestão de passeios e ordem ideal dos dias</div>
            <div>✅ Dicas do que fazer no frio e o que evitar</div>
            <div>✅ Estimativa de custos (comida, passeios, ingressos)</div>
            <div>✅ Curiosidades locais e contexto cultural</div>
          </div>
          <P>
            E dá para usar ainda melhor: você pode pedir roteiro em sequência
            (dia 1, dia 2, dia 3…), roteiro econômico, roteiro confortável, ou um
            roteiro focado em um objetivo (“quero ver aurora, mas tenho só 3 dias e
            orçamento limitado”). Isso economiza tempo e evita perrengue — e, se
            der perrengue, pelo menos você sabe o que fazer.
          </P>

          <H2>🌌 A aurora boreal: linda, mas cansativa (e realista)</H2>
          <P>
            Talvez o ponto “baixo” foi a aurora boreal. No dia do tour, a atividade
            estava fraca. A olho nu, vimos algo mais cinza, como uma nuvem, e por
            poucos segundos. No celular, aí sim aparecia verde.
          </P>
          <P>
            E é verdade: a caçada à aurora é extremamente cansativa. Depois de um
            dia, eu senti que estava ótimo — eu não aguentaria outro.
          </P>

          <Photo
            src="/guias/tromso/aurora.jpeg"
            alt="Aurora boreal registrada em Tromsø"
            caption="No celular a aurora aparece verde e mais forte. A olho nu, muitas vezes ela é bem mais sutil — e mesmo assim é emocionante."
          />

          <H2>🛫 Volta: Tromsø → Berlim (escala em Oslo)</H2>
          <P>
            Na volta, pegamos um voo para <strong>Berlim</strong> com escala em{" "}
            <strong>Oslo</strong>. Foi super tranquilo — e praticamente o mesmo
            custo da ida, também com bagagem incluída.
          </P>

          <Photo
            src="/guias/tromso/barcos.jpeg"
            alt="Barcos e marina em Tromsø com neve"
            caption="A cidade tem esse contraste lindo entre mar, neve e barcos. Mesmo cinza, Tromsø é fotogênica demais."
          />

          <H2>✨ Despedida: por que Tromsø foi o melhor lugar que já conheci</H2>
          <P>
            No dia de ir embora, eu senti algo muito forte: ainda bem que eu estive
            vivo para viver aquilo. Por mais que eu escreva, conte ou faça vídeo, a
            sensação real de sentir o vento do Ártico e ver a neve é indescritível.
          </P>
          <P>
            Eu quero voltar. Quero levar minha esposa, <strong>Eduarda Santos</strong>.
            Nossa lua de mel praticamente não existiu porque eu tinha essa viagem
            com meu pai. E Tromsø virou um lugar que eu quero reviver — com mais
            tempo, mais passeios e, quem sabe, uma aurora mais forte.
          </P>

          <P style={{ marginTop: 18, color: "var(--muted)" }}>
            2025 — Jephesson Santos
          </P>

          <div className="va-box" style={{ marginTop: 18 }}>
            <strong>Quer fazer Tromsø do seu jeito?</strong>
            <div style={{ marginTop: 8 }}>
              Eu posso montar um roteiro em sequência (dia 1 a dia 5), estimar
              custos e comparar opções de passagem com dinheiro ou milhas.{" "}
              <a href="/" style={{ fontWeight: 800 }}>
                Clique aqui para solicitar uma cotação.
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
