const niveis = [
    {
        nome: "Base ativa",
        descricao:
            "Questões tranquilas, mas que exigem atenção e interpretação."
    },
    {
        nome: "Consolidação",
        descricao:
            "Problemas com mais etapas e relações entre conceitos."
    },
    {
        nome: "Ritmo ENEM",
        descricao:
            "Questões contextualizadas no estilo da prova."
    },
    {
        nome: "Alta performance",
        descricao:
            "Textos maiores e alternativas mais próximas."
    },
    {
        nome: "Desafio máximo",
        descricao:
            "Problemas avançados que misturam diferentes conceitos."
    }
];

let nivelSelecionado = 1;
let questaoAtual = 0;
let questoes = [];
let respostas = {};
let alternativaSelecionada = null;
let materiaSelecionada = "Matemática";

const materias = [
    "Matemática",
    "Português",
    "Natureza",
    "Humanas",
    "Inglês",
    "Espanhol"
];

const seletorNiveis =
    document.getElementById("seletorNiveis");

const seletorMaterias =
    document.getElementById("seletorMaterias");

const explicacaoNivel =
    document.getElementById("explicacaoNivel");

const botaoComecar =
    document.getElementById("botaoComecar");

const quiz =
    document.getElementById("quiz");

const resultado =
    document.getElementById("resultado");

/* DATA LOCAL */

function pegarDataLocal() {
    const data = new Date();

    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

document.getElementById("dataAtual").textContent =
    "Treino do dia — " +
    new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long"
    });

/* CRIAÇÃO DOS NÍVEIS */

function criarMaterias() {
    seletorMaterias.innerHTML = "";

    materias.forEach((materia) => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.className =
            materia === materiaSelecionada
                ? "materia-botao ativo"
                : "materia-botao";
        botao.textContent = materia;

        botao.addEventListener("click", () => {
            materiaSelecionada = materia;
            nivelSelecionado = 1;
            questaoAtual = 0;
            respostas = {};
            alternativaSelecionada = null;
            criarMaterias();
            criarNiveis();
            atualizarBotaoInicial();
        });

        seletorMaterias.appendChild(botao);
    });
}

function criarNiveis() {
    seletorNiveis.innerHTML = "";

    niveis.forEach((nivel, indice) => {
        const numero = indice + 1;
        const botao = document.createElement("button");

        botao.type = "button";

        botao.className =
            numero === nivelSelecionado
                ? "nivel ativo"
                : "nivel";

        botao.innerHTML = `
            <span class="numero-nivel">
                0${numero}
            </span>

            <span>
                <strong>${nivel.nome}</strong>
                <small>Nível ${numero} de dificuldade</small>
            </span>
        `;

        botao.addEventListener("click", () => {
            nivelSelecionado = numero;

            criarNiveis();
            atualizarBotaoInicial();
        });

        seletorNiveis.appendChild(botao);
    });

    explicacaoNivel.textContent =
        `${materiaSelecionada}: ${niveis[nivelSelecionado - 1].descricao}`;
}

function atualizarBotaoInicial() {
    const progresso = carregarProgresso();

    const respondidas =
        Object.keys(progresso.respostas || {}).length;

    if (respondidas > 0) {
        botaoComecar.textContent =
            `Continuar ${materiaSelecionada} — nível ${nivelSelecionado} — ${respondidas}/50`;
    } else {
        botaoComecar.textContent =
            `Começar ${materiaSelecionada} — nível ${nivelSelecionado}`;
    }
}

/* GERADOR DIÁRIO */

function criarSemente(texto) {
    let numero = 2166136261;

    for (let i = 0; i < texto.length; i++) {
        numero ^= texto.charCodeAt(i);
        numero = Math.imul(numero, 16777619);
    }

    return numero >>> 0;
}

function criarRandom(semente) {
    let valor = semente;

    return function () {
        valor += 0x6D2B79F5;

        let resultado = valor;

        resultado = Math.imul(
            resultado ^ (resultado >>> 15),
            resultado | 1
        );

        resultado ^= resultado + Math.imul(
            resultado ^ (resultado >>> 7),
            resultado | 61
        );

        return (
            (resultado ^ (resultado >>> 14)) >>> 0
        ) / 4294967296;
    };
}

function numeroAleatorio(random, minimo, maximo) {
    return Math.floor(
        random() * (maximo - minimo + 1)
    ) + minimo;
}

function embaralhar(lista, random) {
    const copia = [...lista];

    for (let i = copia.length - 1; i > 0; i--) {
        const posicao =
            Math.floor(random() * (i + 1));

        [copia[i], copia[posicao]] =
            [copia[posicao], copia[i]];
    }

    return copia;
}

function formatarDinheiro(valor) {
    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function criarQuestao(
    materia,
    pergunta,
    respostaCorreta,
    respostasErradas,
    explicacao,
    random,
    tipo = "Texto"
) {
    let opcoes = [
        respostaCorreta,
        ...respostasErradas
    ];

    // Retira alternativas repetidas
    opcoes = [...new Set(opcoes)];

    while (opcoes.length < 4) {
        opcoes.push(
            `Outra possibilidade ${opcoes.length}`
        );
    }

    opcoes = embaralhar(
        opcoes.slice(0, 4),
        random
    );

    return {
        materia,
        tipo,
        pergunta,
        alternativas: opcoes,
        correta: opcoes.indexOf(respostaCorreta),
        explicacao
    };
}

/* QUESTÕES DE MATEMÁTICA */

function gerarMatematica(random, indice) {
    const tipo = indice % 5;

    if (tipo === 0) {
        const preco =
            numeroAleatorio(random, 8, 30) * 20;

        const desconto =
            numeroAleatorio(random, 2, 6) * 5;

        const valorDescontado =
            preco * (1 - desconto / 100);

        if (nivelSelecionado >= 4) {
            const aumento =
                numeroAleatorio(random, 1, 3) * 5;

            const valorFinal =
                valorDescontado * (1 + aumento / 100);

            return criarQuestao(
                "Matemática",

                `Um curso custa ${formatarDinheiro(preco)}. Primeiro recebeu desconto de ${desconto}% e depois aumento de ${aumento}% sobre o valor descontado. Qual é o preço final?`,

                formatarDinheiro(valorFinal),

                [
                    formatarDinheiro(valorDescontado),
                    formatarDinheiro(
                        preco * (1 - (desconto + aumento) / 100)
                    ),
                    formatarDinheiro(preco)
                ],

                "Porcentagens sucessivas devem ser aplicadas uma depois da outra.",

                random
            );
        }

        return criarQuestao(
            "Matemática",

            `Um curso custa ${formatarDinheiro(preco)} e recebeu desconto de ${desconto}%. Qual é o preço final?`,

            formatarDinheiro(valorDescontado),

            [
                formatarDinheiro(preco - desconto),
                formatarDinheiro(preco + desconto),
                formatarDinheiro(
                    preco * desconto / 100
                )
            ],

            `O preço final é ${formatarDinheiro(valorDescontado)}.`,

            random
        );
    }

    if (tipo === 1) {
        const parcelas =
            numeroAleatorio(random, 3, 8) +
            nivelSelecionado;

        const valor =
            numeroAleatorio(random, 10, 30);

        const taxa =
            numeroAleatorio(random, 5, 20);

        const total =
            parcelas * valor + taxa;

        return criarQuestao(
            "Matemática",

            `Uma compra possui taxa de ${formatarDinheiro(taxa)} mais ${parcelas} parcelas iguais. O total foi ${formatarDinheiro(total)}. Qual é o valor de cada parcela?`,

            formatarDinheiro(valor),

            [
                formatarDinheiro(valor + taxa),
                formatarDinheiro(total / parcelas),
                formatarDinheiro(valor - 2)
            ],

            `${parcelas}x + ${taxa} = ${total}. Portanto, cada parcela vale ${formatarDinheiro(valor)}.`,

            random
        );
    }

    if (tipo === 2) {
        const media =
            numeroAleatorio(random, 10, 25);

        const valores = [
            media - 3,
            media - 1,
            media + 1,
            media + 3
        ];

        return criarQuestao(
            "Matemática",

            `As notas de um estudante foram ${valores.join(", ")}. Qual é a média aritmética?`,

            String(media),

            [
                String(media - 1),
                String(media + 2),
                String(media * 4)
            ],

            `Somamos as quatro notas e dividimos por 4. A média é ${media}.`,

            random
        );
    }

    if (tipo === 3) {
        const vermelhas =
            numeroAleatorio(random, 3, 8);

        const azuis =
            numeroAleatorio(random, 4, 9);

        const total =
            vermelhas + azuis;

        if (nivelSelecionado >= 4) {
            const chance =
                (
                    (vermelhas / total) *
                    ((vermelhas - 1) / (total - 1)) *
                    100
                ).toFixed(1) + "%";

            return criarQuestao(
                "Matemática",

                `Uma caixa possui ${vermelhas} fichas vermelhas e ${azuis} azuis. Duas fichas são retiradas sem reposição. Qual é a probabilidade de as duas serem vermelhas?`,

                chance,

                [
                    "25%",
                    "50%",
                    (
                        (vermelhas / total) * 100
                    ).toFixed(1) + "%"
                ],

                "Sem reposição, a quantidade total e a quantidade de fichas vermelhas diminuem na segunda retirada.",

                random
            );
        }

        const chance =
            (
                (vermelhas / total) * 100
            ).toFixed(1) + "%";

        return criarQuestao(
            "Matemática",

            `Uma caixa possui ${vermelhas} fichas vermelhas e ${azuis} azuis. Qual é a probabilidade de retirar uma ficha vermelha?`,

            chance,

            [
                (
                    (azuis / total) * 100
                ).toFixed(1) + "%",

                (
                    (1 / total) * 100
                ).toFixed(1) + "%",

                "50%"
            ],

            `Existem ${vermelhas} resultados favoráveis entre ${total} fichas.`,

            random
        );
    }

    const primeiro =
        numeroAleatorio(random, 2, 10);

    const razao =
        numeroAleatorio(random, 2, 5) +
        nivelSelecionado;

    const posicao =
        numeroAleatorio(random, 8, 14);

    const resposta =
        primeiro + (posicao - 1) * razao;

    return criarQuestao(
        "Matemática",

        `Uma sequência começa em ${primeiro} e aumenta ${razao} unidades a cada termo. Qual é o ${posicao}º termo?`,

        String(resposta),

        [
            String(resposta - razao),
            String(resposta + razao),
            String(primeiro * posicao)
        ],

        `Usamos primeiro termo + (posição − 1) × razão. O resultado é ${resposta}.`,

        random
    );
}

/* BANCO DAS OUTRAS MATÉRIAS */

const bancoQuestoes = {
    Português: [
        [
            "Na frase “A cidade acordou tossindo fumaça”, qual figura de linguagem aparece?",
            "Personificação",
            ["Comparação", "Ironia", "Eufemismo"],
            "A cidade recebe ações humanas: acordar e tossir."
        ],
        [
            "A palavra “entretanto” normalmente apresenta qual ideia?",
            "Contraste",
            ["Causa", "Conclusão", "Explicação"],
            "Entretanto é uma conjunção adversativa."
        ],
        [
            "A expressão “a gente” representa:",
            "Uma variedade comum da linguagem informal",
            [
                "Um erro que impede a compreensão",
                "Uma linguagem exclusivamente científica",
                "Uma expressão estrangeira"
            ],
            "A expressão é comum na oralidade brasileira."
        ],
        [
            "Um texto que apresenta argumentos para defender uma opinião é:",
            "Argumentativo",
            ["Narrativo", "Descritivo", "Instrucional"],
            "O texto argumentativo procura defender uma tese."
        ],
        [
            "Em “Desligue a tela e ligue-se em quem está perto”, existe:",
            "Duplo sentido",
            ["Linguagem científica", "Ausência de verbos", "Erro gramatical"],
            "Os verbos ligar e desligar possuem diferentes sentidos."
        ],
        [
            "Uma reportagem usa dados e o depoimento de uma pessoa. Isso ajuda a:",
            "Unir informação numérica e experiência humana",
            [
                "Eliminar a necessidade de provas",
                "Criar uma ficção",
                "Esconder o assunto"
            ],
            "Dados e relatos apresentam perspectivas complementares."
        ],
        [
            "A expressão “embora estivesse cansado” apresenta ideia de:",
            "Concessão",
            ["Finalidade", "Adição", "Causa"],
            "Embora introduz uma concessão."
        ],
        [
            "Uma pergunta no título de um artigo pode ser usada para:",
            "Criar expectativa no leitor",
            [
                "Proibir a leitura",
                "Eliminar argumentos",
                "Impedir uma conclusão"
            ],
            "A pergunta orienta a leitura para uma possível resposta."
        ]
    ],

    Natureza: [
        [
            "Qual organela está ligada à produção de energia na respiração celular?",
            "Mitocôndria",
            ["Ribossomo", "Lisossomo", "Complexo golgiense"],
            "A mitocôndria participa da produção de ATP."
        ],
        [
            "As vacinas ajudam o organismo porque:",
            "Estimulam a memória imunológica",
            [
                "Eliminam todas as bactérias",
                "Substituem o sangue",
                "Impedem qualquer mutação"
            ],
            "Elas preparam o sistema imunológico."
        ],
        [
            "Uma lâmpada de 10 W ligada por 5 horas consome:",
            "50 Wh",
            ["2 Wh", "15 Wh", "500 Wh"],
            "Energia é potência multiplicada pelo tempo."
        ],
        [
            "Uma solução de pH 3, comparada a uma de pH 5, possui concentração de H⁺:",
            "100 vezes maior",
            ["2 vezes maior", "10 vezes menor", "100 vezes menor"],
            "Cada unidade de pH representa uma diferença de 10 vezes."
        ],
        [
            "No cruzamento Aa × Aa, a chance de nascer um indivíduo aa é:",
            "25%",
            ["0%", "50%", "75%"],
            "O cruzamento produz AA, Aa, Aa e aa."
        ],
        [
            "O aumento do efeito estufa acontece principalmente pela:",
            "Retenção de radiação infravermelha",
            [
                "Eliminação do oxigênio",
                "Produção de luz visível",
                "Redução da gravidade"
            ],
            "Gases do efeito estufa retêm parte da energia térmica."
        ],
        [
            "Em uma cadeia alimentar, os produtores são importantes porque:",
            "Transformam energia luminosa em energia química",
            [
                "Alimentam-se de todos os animais",
                "Não precisam de energia",
                "Produzem minerais"
            ],
            "Plantas e algas realizam fotossíntese."
        ],
        [
            "No ponto mais alto de um lançamento vertical, o objeto possui:",
            "Velocidade zero e aceleração para baixo",
            [
                "Velocidade e aceleração zero",
                "Aceleração para cima",
                "Velocidade máxima"
            ],
            "A velocidade zera momentaneamente, mas a gravidade continua agindo."
        ],
        [
            "O sabão facilita a remoção de gordura porque:",
            "Interage tanto com a água quanto com a gordura",
            [
                "Transforma gordura em oxigênio",
                "Elimina a água",
                "Funciona apenas pelo calor"
            ],
            "As moléculas do sabão possuem uma parte polar e outra apolar."
        ]
    ],

    Humanas: [
        [
            "A participação em audiências públicas representa:",
            "Exercício da cidadania",
            [
                "Fim das eleições",
                "Suspensão dos direitos",
                "Privatização obrigatória"
            ],
            "A população pode participar de decisões coletivas."
        ],
        [
            "O crescimento de bairros sem infraestrutura demonstra:",
            "Desigualdade socioespacial",
            [
                "Igualdade urbana",
                "Fim da periferia",
                "Distribuição perfeita de serviços"
            ],
            "Os serviços urbanos não são distribuídos igualmente."
        ],
        [
            "O movimento diário entre casa e trabalho é chamado de migração:",
            "Pendular",
            ["Sazonal", "Transcontinental", "Definitiva"],
            "A migração pendular envolve idas e voltas frequentes."
        ],
        [
            "A separação dos três poderes procura:",
            "Evitar a concentração de poder",
            [
                "Eliminar as leis",
                "Criar um único governante",
                "Proibir fiscalizações"
            ],
            "Os poderes possuem funções diferentes."
        ],
        [
            "A Revolução Industrial aumentou a produtividade por meio da:",
            "Divisão do trabalho e uso de máquinas",
            [
                "Eliminação das fábricas",
                "Volta ao feudalismo",
                "Proibição das máquinas"
            ],
            "A produção passou a ser organizada em etapas."
        ],
        [
            "A globalização é favorecida pelos transportes porque:",
            "Acelera os fluxos entre territórios",
            [
                "Elimina todas as fronteiras",
                "Acaba com as desigualdades",
                "Isola os países"
            ],
            "Mercadorias e informações circulam mais rapidamente."
        ],
        [
            "O Iluminismo defendia principalmente:",
            "Razão, direitos e limitação do poder",
            [
                "Absolutismo sem limites",
                "Servidão medieval",
                "Proibição da ciência"
            ],
            "Os iluministas criticavam o absolutismo."
        ],
        [
            "Quando a produção acontece em vários países, temos:",
            "Uma cadeia global de produção",
            [
                "Isolamento econômico",
                "Fim do comércio",
                "Produção exclusivamente artesanal"
            ],
            "As etapas produtivas são distribuídas por vários países."
        ],
        [
            "A redução da natalidade e o aumento da expectativa de vida podem provocar:",
            "Envelhecimento da população",
            [
                "Fim das cidades",
                "Aumento da mortalidade infantil",
                "Fim da migração"
            ],
            "A participação de pessoas mais velhas aumenta."
        ]
    ],

    Inglês: [
        [
            "“Small steps still move you forward.” The sentence encourages:",
            "Gradual progress",
            ["Giving up", "Avoiding goals", "Waiting for perfection"],
            "Small steps are presented as real progress."
        ],
        [
            "The word “but” normally expresses:",
            "Contrast",
            ["Cause", "Time", "Quantity"],
            "But introduces an opposite idea."
        ],
        [
            "“Think before you share.” The message recommends:",
            "Checking information before sharing",
            [
                "Sharing everything",
                "Ignoring information",
                "Deleting the internet"
            ],
            "The sentence warns against sharing without thinking."
        ],
        [
            "“The park is closed until further notice.” This means:",
            "There is no confirmed reopening date",
            [
                "It opens tomorrow",
                "It is always open",
                "Only children can enter"
            ],
            "Further notice means another announcement is necessary."
        ],
        [
            "“Rewarding” is closest in meaning to:",
            "Satisfying",
            ["Impossible", "Useless", "Repetitive"],
            "A rewarding experience creates satisfaction."
        ],
        [
            "“Remote work saves commuting time.” What benefit is mentioned?",
            "Less time traveling to work",
            [
                "Free transportation",
                "No need to work",
                "More traffic"
            ],
            "Commuting means traveling between home and work."
        ],
        [
            "“Data needs context.” The sentence suggests that:",
            "Information needs interpretation",
            [
                "All data is false",
                "Context is useless",
                "Numbers explain everything alone"
            ],
            "Context helps people understand information."
        ]
    ],

    Espanhol: [
        [
            "“Aprender despacio también es avanzar.” La frase valora:",
            "El progreso gradual",
            [
                "El abandono",
                "La falta de objetivos",
                "La velocidad extrema"
            ],
            "Avanzar despacio sigue siendo avanzar."
        ],
        [
            "La palabra “pero” normalmente indica:",
            "Contraste",
            ["Causa", "Tiempo", "Cantidad"],
            "Pero introduce una oposición."
        ],
        [
            "“Comprueba antes de compartir.” El mensaje recomienda:",
            "Verificar la información",
            [
                "Publicar rápidamente",
                "Ignorar el texto",
                "Compartir todo"
            ],
            "Comprobar significa verificar."
        ],
        [
            "“El museo está cerrado hasta nuevo aviso.” Esto significa:",
            "No hay una fecha confirmada de reapertura",
            [
                "Abrirá mañana",
                "Nunca cerró",
                "La entrada es gratuita"
            ],
            "Será necesario esperar un nuevo comunicado."
        ],
        [
            "La palabra “inesperado” significa:",
            "Que no se esperaba",
            [
                "Que fue planeado",
                "Que ocurrió siempre",
                "Que era obligatorio"
            ],
            "El prefijo in- expresa negación."
        ],
        [
            "“Lucía usa bicicleta porque vive cerca.” ¿Cuál es la causa?",
            "Vive cerca",
            [
                "No tiene bicicleta",
                "Vive muy lejos",
                "No trabaja"
            ],
            "Porque introduce la causa."
        ],
        [
            "“Los datos necesitan contexto.” La idea principal es:",
            "La información necesita interpretación",
            [
                "Todos los datos son falsos",
                "El contexto no importa",
                "Los números explican todo"
            ],
            "El contexto ayuda a comprender la información."
        ]
    ]
};

/* CRIA AS 50 QUESTÕES */

function gerarQuestoes() {
    const random = criarRandom(
        criarSemente(
            pegarDataLocal() +
            "-materia-" +
            materiaSelecionada +
            "-nivel-" +
            nivelSelecionado
        )
    );

    const tiposPorMateria = {
        Português: ["Charge", "Texto", "Trecho", "Anúncio", "Opinião"],
        Natureza: ["Experimento", "Dados", "Gráfico", "Ciclo", "Comparação"],
        Humanas: ["Mapa", "Texto", "Estatística", "Contexto", "Análise"],
        Inglês: ["Reading", "Dialogue", "Ad", "Context", "Message"],
        Espanhol: ["Lectura", "Diálogo", "Anuncio", "Texto", "Contexto"]
    };

    const lista = [];

    if (materiaSelecionada === "Matemática") {
        for (let i = 0; i < 50; i++) {
            lista.push(
                gerarMatematica(random, i)
            );
        }

        return embaralhar(lista, random);
    }

    const bancoAtual =
        bancoQuestoes[materiaSelecionada] || [];

    const bancoEmbaralhado =
        embaralhar(bancoAtual, random);

    for (let i = 0; i < 50; i++) {
        const item =
            bancoEmbaralhado[i % bancoEmbaralhado.length];

        const tipo =
            item.tipo ||
            tiposPorMateria[materiaSelecionada][i % tiposPorMateria[materiaSelecionada].length];

        lista.push(
            criarQuestao(
                materiaSelecionada,
                item[0],
                item[1],
                item[2],
                item[3],
                random,
                tipo
            )
        );
    }

    return embaralhar(lista, random);
}

/* PROGRESSO */

function chaveProgresso() {
    return (
        "ritmo-enem-" +
        pegarDataLocal() +
        "-materia-" +
        materiaSelecionada +
        "-nivel-" +
        nivelSelecionado
    );
}

function salvarProgresso() {
    localStorage.setItem(
        chaveProgresso(),
        JSON.stringify({
            questaoAtual,
            respostas
        })
    );

    atualizarBotaoInicial();
}

function carregarProgresso() {
    const salvo =
        localStorage.getItem(chaveProgresso());

    if (!salvo) {
        return {
            questaoAtual: 0,
            respostas: {}
        };
    }

    try {
        return JSON.parse(salvo);
    } catch {
        return {
            questaoAtual: 0,
            respostas: {}
        };
    }
}

/* INICIA O QUIZ */

function iniciarQuiz() {
    questoes = gerarQuestoes();

    const progresso = carregarProgresso();

    questaoAtual =
        progresso.questaoAtual || 0;

    respostas =
        progresso.respostas || {};

    alternativaSelecionada = null;

    quiz.classList.remove("escondido");
    resultado.classList.add("escondido");

    mostrarQuestao();

    quiz.scrollIntoView({
        behavior: "smooth"
    });
}

/* MOSTRA UMA QUESTÃO */

function mostrarQuestao() {
    const questao =
        questoes[questaoAtual];

    const respostaSalva =
        respostas[questaoAtual];

    document.getElementById("nivelQuiz").textContent =
        `Nível ${nivelSelecionado} — ${
            niveis[nivelSelecionado - 1].nome
        }`;

    document.getElementById("contadorQuestoes").textContent =
        `Questão ${questaoAtual + 1} de 50`;

    document.getElementById("barraProgresso").style.width =
        `${Object.keys(respostas).length * 2}%`;

    document.getElementById("materiaQuestao").textContent =
        questao.materia;

    document.getElementById("tipoQuestao").textContent =
        questao.tipo || "Texto";

    document.getElementById("pergunta").textContent =
        questao.pergunta;

    const alternativasElemento =
        document.getElementById("alternativas");

    const feedback =
        document.getElementById("feedback");

    const confirmar =
        document.getElementById("confirmar");

    alternativasElemento.innerHTML = "";

    feedback.className =
        "feedback escondido";

    alternativaSelecionada =
        respostaSalva
            ? respostaSalva.selecionada
            : alternativaSelecionada;

    questao.alternativas.forEach(
        (alternativa, indice) => {
            const botao =
                document.createElement("button");

            botao.type = "button";
            botao.className = "alternativa";

            const letra =
                document.createElement("span");

            letra.className = "letra";
            letra.textContent =
                String.fromCharCode(65 + indice);

            const texto =
                document.createElement("span");

            texto.textContent = alternativa;

            botao.appendChild(letra);
            botao.appendChild(texto);

            if (
                alternativaSelecionada === indice
            ) {
                botao.classList.add("selecionada");
            }

            if (respostaSalva) {
                botao.disabled = true;

                if (indice === questao.correta) {
                    botao.classList.add("correta");
                }

                if (
                    indice === respostaSalva.selecionada &&
                    indice !== questao.correta
                ) {
                    botao.classList.add("errada");
                }
            }

            botao.addEventListener("click", () => {
                if (respostas[questaoAtual]) {
                    return;
                }

                alternativaSelecionada = indice;
                mostrarQuestao();
            });

            alternativasElemento.appendChild(botao);
        }
    );

    if (respostaSalva) {
        const acertou =
            respostaSalva.selecionada ===
            questao.correta;

        feedback.className =
            acertou
                ? "feedback"
                : "feedback erro";

        feedback.innerHTML = `
            <strong>
                ${
                    acertou
                        ? "Resposta correta!"
                        : "Resposta incorreta."
                }
            </strong>

            <p>${questao.explicacao}</p>
        `;

        confirmar.disabled = true;

        confirmar.textContent =
            "Resposta confirmada";
    } else {
        confirmar.disabled =
            alternativaSelecionada === null;

        confirmar.textContent =
            "Confirmar resposta";
    }

    document.getElementById("anterior").disabled =
        questaoAtual === 0;

    document.getElementById("proxima").textContent =
        questaoAtual === 49
            ? "Ver resultado →"
            : "Próxima →";
}

/* CONFIRMA A RESPOSTA */

document
    .getElementById("confirmar")
    .addEventListener("click", () => {
        if (alternativaSelecionada === null) {
            return;
        }

        respostas[questaoAtual] = {
            selecionada: alternativaSelecionada
        };

        salvarProgresso();
        mostrarQuestao();
    });

/* QUESTÃO ANTERIOR */

document
    .getElementById("anterior")
    .addEventListener("click", () => {
        if (questaoAtual > 0) {
            questaoAtual--;
            alternativaSelecionada = null;

            salvarProgresso();
            mostrarQuestao();
        }
    });

/* PRÓXIMA QUESTÃO */

document
    .getElementById("proxima")
    .addEventListener("click", () => {
        if (questaoAtual === 49) {
            mostrarResultado();
            return;
        }

        questaoAtual++;
        alternativaSelecionada = null;

        salvarProgresso();
        mostrarQuestao();
    });

/* RESULTADO */

function mostrarResultado() {
    let acertos = 0;

    Object.entries(respostas).forEach(
        ([indice, resposta]) => {
            const questao =
                questoes[Number(indice)];

            if (
                questao &&
                resposta.selecionada ===
                questao.correta
            ) {
                acertos++;
            }
        }
    );

    const respondidas =
        Object.keys(respostas).length;

    const porcentagem =
        respondidas > 0
            ? Math.round(
                (acertos / respondidas) * 100
            )
            : 0;

    document.getElementById("notaFinal").textContent =
        `${porcentagem}%`;

    document.getElementById("textoResultado").textContent =
        `Você acertou ${acertos} de ${respondidas} questões respondidas. Restam ${50 - respondidas} questões para concluir o treino do dia.`;

    quiz.classList.add("escondido");
    resultado.classList.remove("escondido");

    resultado.scrollIntoView({
        behavior: "smooth"
    });
}

/* VOLTAR AO QUIZ */

document
    .getElementById("voltarQuestoes")
    .addEventListener("click", () => {
        resultado.classList.add("escondido");
        quiz.classList.remove("escondido");

        mostrarQuestao();
    });

/* BOTÃO PRINCIPAL */

botaoComecar.addEventListener(
    "click",
    iniciarQuiz
);

/* INICIALIZA O SITE */

criarMaterias();
criarNiveis();
atualizarBotaoInicial();