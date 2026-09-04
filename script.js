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

const nomeCadastroInput =
    document.getElementById("nomeCadastro");

const emailCadastroInput =
    document.getElementById("emailCadastro");

const senhaCadastroInput =
    document.getElementById("senhaCadastro");

const statusCadastro =
    document.getElementById("statusCadastro");

const listaUsuarios =
    document.getElementById("listaUsuarios");

const API_URL = "/api";

function mostrarStatusCadastro(mensagem, sucesso = false) {
    statusCadastro.textContent = mensagem;
    statusCadastro.style.color = sucesso ? "#3c6d56" : "#b16060";
}

function listarUsuarios() {
    listaUsuarios.innerHTML = "<strong>Acesso protegido</strong><span>Os acessos ficam disponíveis apenas no painel do administrador.</span>";
}

async function salvarCadastro() {
    const nome = nomeCadastroInput.value.trim();
    const email = emailCadastroInput.value.trim();
    const senha = senhaCadastroInput.value.trim();

    if (!nome || !email || !senha) {
        mostrarStatusCadastro("Preencha nome, e-mail e senha para continuar.");
        return false;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailValido) {
        mostrarStatusCadastro("Digite um e-mail válido.");
        return false;
    }

    if (senha.length < 4) {
        mostrarStatusCadastro("A senha deve ter pelo menos 4 caracteres.");
        return false;
    }

    try {
        const resposta = await fetch(`${API_URL}/users/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name: nome,
                email,
                password: senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            if (resposta.status === 409) {
                throw new Error("E-mail já cadastrado. Tentando entrar com o login...");
            }

            throw new Error(dados.error || "Não foi possível cadastrar.");
        }

        localStorage.setItem("usuarioAtual", JSON.stringify({ nome, email }));
        mostrarStatusCadastro(`Login realizado para ${nome}.`, true);
        await listarUsuarios();
        return true;
    } catch (erro) {
        const mensagem = erro.message || "Não foi possível concluir o acesso.";

        if (mensagem.includes("Tentando entrar com o login")) {
            try {
                const resposta = await fetch(`${API_URL}/users/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password: senha
                    })
                });

                const dados = await resposta.json();

                if (!resposta.ok) {
                    throw new Error(dados.error || "Senha incorreta.");
                }

                localStorage.setItem("usuarioAtual", JSON.stringify({
                    nome: dados.name || nome,
                    email: dados.email || email
                }));

                mostrarStatusCadastro(`Bem-vindo novamente, ${dados.name || nome}.`, true);
                await listarUsuarios();
                return true;
            } catch (erroLogin) {
                mostrarStatusCadastro(erroLogin.message || "Não foi possível realizar o login.");
                return false;
            }
        }

        mostrarStatusCadastro(mensagem);
        return false;
    }
}

function carregarCadastro() {
    const salvo = localStorage.getItem("usuarioAtual");

    if (!salvo) {
        listarUsuarios();
        return;
    }

    try {
        const cadastro = JSON.parse(salvo);
        nomeCadastroInput.value = cadastro.nome || "";
        emailCadastroInput.value = cadastro.email || "";
        mostrarStatusCadastro(`Usuário logado: ${cadastro.nome}.`, true);
    } catch {
        localStorage.removeItem("usuarioAtual");
    }

    listarUsuarios();
}

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
            "Em um texto argumentativo, a tese é normalmente apresentada como:",
            "Uma ideia defendida ao longo do texto",
            ["Um dado estatístico isolado", "Um resumo final sem opinião", "Uma pergunta sem resposta"],
            "A tese organiza a linha de raciocínio e orienta a defesa do autor."
        ],
        [
            "A expressão “por isso” em um texto estabelece relação de:",
            "Consequência",
            ["Concessão", "Contraste", "Comparação"],
            "“Por isso” indica efeito ou resultado de uma ideia anterior."
        ],
        [
            "Qual recurso foi usado na frase “A cidade acordou cedo, mas o trânsito já reclamava seu espaço”?",
            "Personificação",
            ["Metonímia", "Hipérbole", "Catacrese"],
            "O trânsito “reclama” como se fosse uma pessoa, caracterizando personificação."
        ],
        [
            "A leitura crítica de uma notícia exige observar principalmente:",
            "As fontes, o contexto e os dados apresentados",
            ["A quantidade de imagens", "A cor usada no site", "O nome do autor"],
            "Uma boa leitura crítica analisa argumentos, fontes e contexto."
        ],
        [
            "Em “Embora estivesse cansado, concluiu o trabalho”, a palavra “embora” introduz ideia de:",
            "Concessão",
            ["Finalidade", "Causa", "Adição"],
            "“Embora” indica um fato que dificulta a ação, mas não a impede."
        ],
        [
            "A principal função do conectivo “contudo” é:",
            "Introduzir oposição",
            ["Indicar conclusão", "Organizar enumeração", "Expressar dúvida"],
            "“Contudo” é uma conjunção adversativa, típica de contraste."
        ],
        [
            "Um texto em que o autor expõe argumentos para convencer o leitor é classificado como:",
            "Argumentativo",
            ["Descritivo", "Narrativo", "Expositivo"],
            "Esses textos têm a finalidade de persuadir ou defender uma tese."
        ],
        [
            "Qual é a função da metáfora em um texto literário?",
            "Produzir uma imagem mais expressiva e subjetiva",
            ["Informar com precisão absoluta", "Eliminar a interpretação pessoal", "Substituir toda a argumentação"],
            "A metáfora amplia a expressão artística e a percepção do leitor."
        ]
    ],

    Natureza: [
        [
            "Em uma reação de neutralização, ácido e base reagem para formar:",
            "Sal e água",
            ["Oxigênio e hidrogênio", "Água e gás carbônico", "Metal e gás"],
            "A neutralização típica produz sal e água."
        ],
        [
            "A mitocôndria é fundamental para a célula porque:",
            "Produz ATP por respiração celular",
            ["Armazena material genético", "Produz proteínas ribossômicas", "Controla a divisão celular"],
            "A mitocôndria é o principal local de produção de energia celular."
        ],
        [
            "Se uma lâmpada de 60 W permanece acesa por 2 horas, o consumo é de:",
            "120 Wh",
            ["30 Wh", "60 Wh", "180 Wh"],
            "Energia = potência × tempo: 60 × 2 = 120 Wh."
        ],
        [
            "No cruzamento Aa × Aa, qual é a probabilidade de nascer um indivíduo homozigoto recessivo?",
            "25%",
            ["50%", "75%", "100%"],
            "Aa × Aa gera AA, Aa, Aa e aa, sendo 25% aa."
        ],
        [
            "A presença de gás carbônico na atmosfera favorece o efeito estufa porque:",
            "Retém parte do calor irradiado pela Terra",
            ["Aumenta a quantidade de oxigênio", "Reduz a umidade do ar", "Elimina a radiação solar"],
            "Os gases do efeito estufa absorvem e reemitem parte do calor."
        ],
        [
            "Em uma cadeia alimentar, os consumidores primários são:",
            "Herbívoros",
            ["Carnívoros de topo", "Produtores", "Decompositores"],
            "Consumidores primários se alimentam diretamente dos produtores."
        ],
        [
            "Uma solução com pH 2 é, em comparação com outra de pH 5:",
            "1000 vezes mais ácida",
            ["100 vezes mais ácida", "10 vezes menos ácida", "3 vezes mais ácida"],
            "Cada unidade de pH representa variação de 10 vezes na concentração de H+."
        ],
        [
            "O papel das vacinas no sistema imunológico é:",
            "Estimular a memória imunológica para respostas futuras",
            ["Causar doença para fortalecer o organismo", "Substituir células do sangue", "Eliminar todos os microrganismos"],
            "As vacinas preparam o sistema imune para reconhecer rapidamente o patógeno."
        ],
        [
            "No lançamento vertical, no ponto mais alto, a velocidade do objeto é:",
            "Zero",
            ["Máxima", "Constante", "Igual à gravidade"],
            "No instante de inversão do movimento, a velocidade momentaneamente se anula."
        ]
    ],

    Humanas: [
        [
            "A cidadania plena pressupõe, além dos direitos, o exercício de:",
            "Deveres e participação política",
            ["Isenção fiscal total", "Desobediência às leis", "Ausência de responsabilidades"],
            "Cidadania envolve direitos, deveres e participação no espaço público."
        ],
        [
            "A divisão dos poderes no Estado tem como finalidade principal:",
            "Evitar a concentração de poder",
            ["Eliminar as eleições", "Centralizar decisões econômicas", "Proibir a fiscalização"],
            "A separação de poderes garante equilíbrio entre Executivo, Legislativo e Judiciário."
        ],
        [
            "A migração pendular é caracterizada por:",
            "Deslocamentos diários entre moradia e trabalho",
            ["Mudança definitiva para outro país", "Emigração por guerras", "Migração sazonal de colheita"],
            "Esse tipo de deslocamento ocorre em rotina, com ida e volta frequentes."
        ],
        [
            "A industrialização foi impulsionada, entre outros fatores, pelo(a):",
            "Uso de máquinas e divisão do trabalho",
            ["Extinção do comércio", "Fim da urbanização", "Abolição das fábricas"],
            "A Revolução Industrial reorganizou a produção com mecanização e especialização."
        ],
        [
            "A globalização econômica se caracteriza pela:",
            "Integração de mercados e mobilidade de capitais",
            ["Isolamento comercial dos países", "Menor circulação de mercadorias", "Fim da tecnologia"],
            "A globalização intensifica fluxos comerciais, financeiros e de informação."
        ],
        [
            "O iluminismo provocou mudanças na política ao defender:",
            "A razão e a limitação do poder",
            ["O absolutismo monárquico", "A expansão do feudalismo", "A proibição da ciência"],
            "Os pensadores iluministas criticavam o poder absoluto e estimulavam a racionalidade."
        ],
        [
            "Depois da Revolução Industrial, a urbanização cresceu porque:",
            "Houve concentração de empregos e serviços nas cidades",
            ["As cidades deixaram de receber população", "Os campos foram modernizados sem empregos", "Não havia trabalho industrial"],
            "As indústrias atraíram trabalhadores para áreas urbanas."
        ],
        [
            "A desigualdade socioespacial pode ser observada quando:",
            "Há acesso desigual a serviços e infraestrutura entre bairros",
            ["Todos os bairros têm a mesma renda", "Os serviços públicos são distribuídos igualmente", "Não existem áreas periféricas"],
            "Esse fenômeno revela diferenças na distribuição de oportunidades e infraestrutura."
        ],
        [
            "O envelhecimento da população está associado, em muitos países, ao(a):",
            "Aumento da expectativa de vida e queda da natalidade",
            ["Aumento constante da taxa de crianças", "Redução da expectativa de vida", "Extinção das cidades"],
            "Esse cenário altera a estrutura etária da população."
        ]
    ],

    Inglês: [
        [
            "“The success of the project depended on accurate data and clear communication.” The sentence suggests that:",
            "Planning and information quality were essential",
            ["The project failed because of delays", "Communication was irrelevant", "Data had no impact"],
            "Accurate data and clear communication are presented as key conditions for success."
        ],
        [
            "The expression “in light of” most nearly means:",
            "Considering",
            ["Despite", "Without", "Because of"],
            "“In light of” introduces a reason or context for an action or decision."
        ],
        [
            "“Students were encouraged to reflect on the impact of technology on daily life.” This implies that students should:",
            "Think critically about the role of technology",
            ["Stop using technology", "Ignore social changes", "Accept every innovation without question"],
            "Reflection invites analysis and evaluation, not simple acceptance."
        ],
        [
            "The word “benefit” is closest in meaning to:",
            "Advantage",
            ["Obstacle", "Risk", "Expense"],
            "A benefit is a positive effect or advantage."
        ],
        [
            "“Remote work reduces commuting time, but it can also create isolation.” The contrast is between:",
            "Convenience and emotional drawbacks",
            ["Salary and transport", "Technology and education", "Work and leisure"],
            "The sentence presents a positive effect and a negative side effect."
        ],
        [
            "In the sentence “The report highlights the need for transparency,” the verb “highlights” means:",
            "Emphasizes",
            ["Denies", "Delays", "Avoids"],
            "To highlight is to bring attention to something important."
        ],
        [
            "“If the measure is implemented carefully, the results may improve.” This sentence expresses:",
            "A conditional possibility",
            ["A certainty without exception", "A past event only", "A contradiction"],
            "The use of “if” introduces a condition and a possible outcome."
        ],
        [
            "“Many students struggle with abstract concepts in science.” The sentence indicates that:",
            "Some students find theoretical ideas difficult",
            ["All students dislike science", "Science has no practical use", "Students never study theory"],
            "The sentence does not generalize to all students, only many."
        ]
    ],

    Espanhol: [
        [
            "La frase “La sostenibilidad requiere decisiones difíciles” sugiere que:",
            "La sostenibilidad exige compromisos y cambios",
            ["La sostenibilidad no implica esfuerzo", "La sostenibilidad se logra sin planificación", "La sostenibilidad depende solo de la tecnología"],
            "La frase destaca que tomar decisiones complejas es parte del processo."
        ],
        [
            "En la oración “Aunque estudió mucho, no aprobó”, la palabra “aunque” expresa:",
            "Concesión",
            ["Causa", "Consecuencia", "Tiempo"],
            "“Aunque” introduce una idea que contrasta con el resultado final."
        ],
        [
            "La expresión “a la vez” en un texto suele indicar:",
            "Simultaneidad",
            ["Finalidad", "Contradicción", "Exclusión"],
            "“A la vez” une ideas que ocurren o coexisten simultáneamente."
        ],
        [
            "“El informe concluye que la educación es esencial para la movilidad social.” Esto significa que:",
            "La educación tiene impacto en la ascensão social",
            ["La educación no altera la vida social", "La movilidad social ocurre sin esfuerzo", "El informe niega la educación"],
            "La conclusión destaca la relevancia de la educación para transformar oportunidades."
        ],
        [
            "La palabra “desafío” se refiere principalmente a:",
            "Un problema que exige esfuerzo para ser superado",
            ["Una recompensa inmediata", "Un proyecto concluido", "Una acción sin importancia"],
            "“Desafío” evoca dificuldade e exigência de solução."
        ],
        [
            "En “La noticia fue publicada antes del anuncio oficial”, la idea principal es:",
            "La noticia apareció antes de la información oficial",
            ["La noticia fue aprobada por el gobierno", "La noticia terminó definitivamente", "La noticia tuvo múltiples autores"],
            "El enunciado destaca a cronologia da publicação."
        ],
        [
            "La lectura crítica de un texto exige analizar principalmente:",
            "La intención, el contexto y la evidencia",
            ["Solo el número de páginas", "Solo la aparência visual", "Solo el nombre del autor"],
            "Un texto debe ser interpretado considerando motivos e contexto."
        ],
        [
            "“Comprueba antes de compartir” en español recomienda:",
            "Verificar la información antes de difundirla",
            ["Compartir todo sin confirmar", "Ignorar el contenido", "Publicar inmediatamente"],
            "La recomendación enfatiza la responsabilidad de conferir a veracidade."
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
        embaralhar([...bancoAtual], random);

    const itensUsados = new Set();

    for (let i = 0; lista.length < 50 && i < bancoEmbaralhado.length * 3; i++) {
        const item = bancoEmbaralhado[i % bancoEmbaralhado.length];
        const chave = JSON.stringify(item);

        if (itensUsados.has(chave)) {
            continue;
        }

        itensUsados.add(chave);

        const tipo =
            item.tipo ||
            tiposPorMateria[materiaSelecionada][lista.length % tiposPorMateria[materiaSelecionada].length];

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

    if (lista.length < 50) {
        while (lista.length < 50) {
            const item = bancoEmbaralhado[lista.length % bancoEmbaralhado.length];
            const tipo =
                item.tipo ||
                tiposPorMateria[materiaSelecionada][lista.length % tiposPorMateria[materiaSelecionada].length];

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

botaoComecar.addEventListener("click", () => {
    if (!salvarCadastro()) {
        return;
    }

    iniciarQuiz();
});

/* INICIALIZA O SITE */

carregarCadastro();
criarMaterias();
criarNiveis();
atualizarBotaoInicial();