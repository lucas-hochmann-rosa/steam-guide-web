import { assetPath } from '../utils/assetPath';

export const rooms = [
  {
    id: "f-08",
    room: "Sala F-08",
    title: "Galeria de arte",
    area: "Linguagens",
    responsible: "Professora Carla Capeletti",
    teachers: ["Carla Capeletti"],
    description:
      "Uma galeria criada pelos estudantes para apresentar produções visuais, processos criativos e diferentes maneiras de interpretar o mundo por meio da arte.",
    accent: "#EEB330",
    soft: "#FFF4D7",
    icon: assetPath("/assets/icon-linguagens.svg"),
    images: [assetPath("/assets/salas/f08-galeria-de-arte.png")],
  },
  {
    id: "f-13",
    room: "Sala F-13",
    title: "Globalização em Arte: Arte, Geografia e Inglês",
    area: "Linguagens e Ciências Humanas",
    responsible: "Professores Carla Capeletti, Bruno Casaca e Rhaabe Pinheiro",
    teachers: ["Carla Capeletti", "Bruno Casaca", "Rhaabe Pinheiro"],
    description:
      "Uma experiência interdisciplinar que investiga como a globalização aproxima culturas, transforma territórios e influencia linguagens artísticas e formas de comunicação em inglês.",
    accent: "#298B97",
    soft: "#E1F2F4",
    icon: assetPath("/assets/icon-humanas.svg"),
    images: [assetPath("/assets/salas/f13-globalizacao-em-arte.png")],
  },
  {
    id: "f-01-f-02",
    room: "Salas F-01, F-02 e F-03",
    title: "Jogos, desafios, charadas e enigmas matemáticos",
    area: "Matemática",
    responsible: "Professoras Tatiana Dervanoski e Daniela Camatti Sordi e professor César Gattermann",
    teachers: [
      "Tatiana Gabriel Dervanoski",
      "Daniela Cristina Camatti Sordi",
      "César Gattermann",
    ],
    description:
      "Um circuito de jogos e enigmas que convida o visitante a testar estratégias, reconhecer padrões e resolver problemas usando lógica, criatividade e conhecimentos matemáticos.",
    accent: "#CD4035",
    soft: "#F8E7E4",
    icon: assetPath("/assets/icon-matematica.svg"),
    images: [assetPath("/assets/salas/f01-f02-f03-jogos-matematicos.png")],
  },
  {
    id: "f-05",
    room: "Sala F-05",
    title: "Engenheiro por um dia",
    area: "Maker & Robótica",
    responsible: "Professora Juliane Meireles",
    teachers: ["Juliane Meireles"],
    description:
      "Uma oficina prática em que os visitantes assumem o papel de engenheiros: planejam, constroem, testam e aprimoram soluções para desafios de tecnologia e criação.",
    accent: "#227C47",
    soft: "#E7F2DA",
    icon: assetPath("/assets/icon-robotica.svg"),
    images: [assetPath("/assets/salas/f05-engenheiro-por-um-dia.png")],
  },
  {
    id: "f-20",
    room: "Sala F-20",
    title: "O Caminho dos Direitos",
    area: "Linguagens e Ciências Humanas",
    responsible: "Professor Cristiano Gaio",
    teachers: ["Cristiano Gaio"],
    description:
      "Um percurso de reflexão sobre cidadania e direitos, construído com narrativas, textos e situações que convidam o público a reconhecer conquistas e desafios da vida em sociedade.",
    accent: "#298B97",
    soft: "#E1F2F4",
    icon: assetPath("/assets/icon-humanas.svg"),
    images: [assetPath("/assets/salas/f20-caminho-dos-direitos.png")],
  },
  {
    id: "b-03-b-04",
    room: "Laboratórios B-03 e B-04",
    title: "Experimentos no laboratório",
    area: "Ciências da Natureza",
    responsible:
      "Professoras Bruna de Morais, Valéria Chimello e Daniele Simoneti",
    teachers: ["Bruna de Morais", "Valéria Chimello", "Daniele Simoneti"],
    description:
      "Uma sequência de investigações de Química, Biologia e Física em que pistas, observações e experimentos ajudam o visitante a compreender fenômenos científicos de forma prática.",
    accent: "#10768B",
    soft: "#DDF3F3",
    icon: assetPath("/assets/icon-natureza.svg"),
    images: [assetPath("/assets/salas/b03-b04-experimentos.png")],
  },
  {
    id: "corredor-f",
    room: "Corredor do Bloco F",
    title: "Oficina de fotografia e audiovisual",
    area: "Linguagens",
    responsible: "Professor Sávio Rezende",
    teachers: ["Sávio Rezende"],
    description:
      "Um espaço para explorar enquadramento, fotografia, captação de áudio e produção de podcast, transformando ideias em narrativas visuais e sonoras.",
    accent: "#EEB330",
    soft: "#FFF4D7",
    icon: assetPath("/assets/icon-linguagens.svg"),
    images: [assetPath("/assets/salas/corredor-f-fotografia-audiovisual.png")],
  },
  {
    id: "f-09",
    room: "Sala F-09",
    title: "West Sharks FTC: robô da temporada BIOBUZZ",
    area: "Maker & Robótica",
    responsible: "Equipe West Sharks FTC #24823",
    teachers: [],
    teamLogo: assetPath("/assets/westsharks/logo-westsharks.png"),
    description:
      "Uma exposição da equipe West Sharks FTC para apresentar a FIRST Tech Challenge e o protótipo desenvolvido no desafio Robot in 30 Hours (RI30H). Em uma arena demonstrativa, os visitantes poderão observar o robô em funcionamento e conhecer as decisões de projeto, mecânica, programação e estratégia adotadas para a temporada 2026-2027 BIOBUZZ, inspirada na biodiversidade.",
    accent: "#00A6C7",
    soft: "#E6F7FB",
    icon: assetPath("/assets/westsharks/logo-westsharks.png"),
    images: [assetPath("/assets/salas/f09-westsharks.png")],
  },
  {
    id: "quadra",
    room: "Quadra",
    title: "Prática de movimento e integração",
    area: "Linguagens · Educação Física",
    responsible: "Professor Eduardo Maldaner",
    teachers: ["Eduardo Maldaner"],
    description:
      "Uma vivência prática e participativa na quadra, planejada para estimular movimento, colaboração e interação entre os visitantes durante o circuito da Mostra.",
    accent: "#30AF4A",
    soft: "#E7F2DA",
    icon: assetPath("/assets/icon-robotica.svg"),
    images: [assetPath("/assets/salas/quadra-atividade-pratica.png")],
  },
];

export const roomLocation = (room) => {
  const block = room.id.startsWith("a-")
    ? "A"
    : room.id.startsWith("b-")
      ? "B"
      : "F";
  const directions = {
    A: "O Bloco A fica junto à entrada principal da escola. Ao entrar, siga a sinalização interna até a sala indicada.",
    B: "A partir da entrada, avance pelo corredor central até o Bloco B e procure a identificação dos laboratórios.",
    F: "A partir da entrada, siga pelo corredor central em direção à parte superior do mapa até chegar ao Bloco F. Depois, acompanhe a numeração das salas.",
  };
  const floors = {
    "f-01-f-02": "Térreo",
    "f-05": "Térreo",
    "f-08": "1º andar",
    "f-09": "1º andar",
    "f-13": "1º andar",
    "f-20": "2º andar",
  };
  const floor = floors[room.id];
  const floorDirection = floor
    ? ` A atividade fica no ${floor.toLowerCase()}.`
    : "";
  return { block, floor, directions: `${directions[block]}${floorDirection}` };
};

export const schoolBlocks = [
  { id: "A", name: "Bloco A", description: "Secretaria" },
  { id: "B", name: "Bloco B", description: "Laboratórios e Sanitários" },
  { id: "C", name: "Bloco C", description: "Estacionamento inferior" },
  { id: "D", name: "Bloco D", description: "Cantina e Sanitários" },
  { id: "E", name: "Bloco E", description: "Apoio pedagógico e coordenação" },
  {
    id: "F",
    name: "Bloco F",
    description:
      "Bebedouro, Salas de Aula, Laboratórios didáticos e Sanitários",
  },
  {
    id: "G",
    name: "Bloco G",
    description:
      "Bebedouro e Espaço em obras - Instituto SENAI de Tecnologia em Alimentos e Bebidas",
  },
  {
    id: "H",
    name: "Bloco H",
    description: "Biblioteca, Bebedouro, Sanitários e Estacionamento superior",
  },
];

export const blockHotspots = {
  A: { left: "31%", top: "74.4%" },
  B: { left: "54.3%", top: "71.3%" },
  C: { left: "38.3%", top: "95.5%" },
  D: { left: "54.2%", top: "41%" },
  E: { left: "53.2%", top: "23.3%" },
  F: { left: "42.3%", top: "3.1%" },
  G: { left: "35.5%", top: "41%" },
  H: { left: "84.8%", top: "71%" },
};

export const guideTeam = [
  {
    name: "Andrei Demartini",
    image: assetPath("/assets/equipe-guia/andrei-de-martini.png"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/andreidemartini302/in%C3%ADcio?pli=1&authuser=0",
  },
  {
    name: "Arthur Rosito Miglioranza Strassburger",
    image: assetPath("/assets/equipe-guia/arthur-rosito.webp"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/arthurstrassburger?usp=sharing",
  },
  {
    name: "Lara Cecilia Pereira Moecke",
    image: assetPath("/assets/equipe-guia/lara-cecilia.webp"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/lara-moecke-302/in%C3%ADcio",
  },
  {
    name: "Letícia Batisti",
    image: assetPath("/assets/equipe-guia/leticia-batisti.webp"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/letciabatisti302?usp=sharing",
  },
  {
    name: "Lucas Hochmann Rosa",
    image: assetPath("/assets/equipe-guia/lucas-hochmann-rosa.webp"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/lucas-hochmann-rosa-302?usp=sharing",
  },
  {
    name: "Maria Paula Rossetti Siqueira",
    image: assetPath("/assets/equipe-guia/maria-paula-rossetti-siqueira.png"),
    portfolio:
      "https://sites.google.com/estudante.sesisenai.org.br/maria-paula-rossetti-302/in%C3%ADcio",
  },
];
