const niveis = [
    {
        nome: "Base ativa",
        descricao:
            "Questões introdutórias, com leitura cuidadosa e aplicação direta."
    },
    {
        nome: "Consolidação",
        descricao:
            "Problemas com duas etapas e relações entre conceitos."
    },
    {
        nome: "Ritmo ENEM",
        descricao:
            "Questões contextualizadas que exigem interpretar dados e contexto."
    },
    {
        nome: "Alta performance",
        descricao:
            "Textos mais densos, alternativas próximas e análise de consequências."
    },
    {
        nome: "Desafio máximo",
        descricao:
            "Problemas avançados que combinam conceitos e exigem eliminar distrações."
    }
];

let nivelSelecionado = 1;
let questaoAtual = 0;
let questoes = [];
let respostas = {};
let alternativaSelecionada = null;
let materiaSelecionada = "Matemática";
const nivelPorMateria = {};

const materias = [
    "Matemática",
    "Português",
    "História",
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

const ehServidorLocal = ["localhost", "127.0.0.1"].includes(
    window.location.hostname
);

const API_URL = window.location.protocol === "file:" || ehServidorLocal
    ? "http://localhost:3000/api"
    : `${window.location.origin}/api`;

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
        const mensagem = erro.name === "TypeError"
            ? "Não foi possível conectar ao servidor. Abra o site em http://localhost:3000 e verifique se o backend está ligado."
            : erro.message || "Não foi possível concluir o acesso.";

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
            nivelSelecionado = nivelPorMateria[materia] || 1;
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
            nivelPorMateria[materiaSelecionada] = numero;

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
    tipo = "Texto",
    origem = "Questão autoral"
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
        origem,
        pergunta,
        alternativas: opcoes,
        correta: opcoes.indexOf(respostaCorreta),
        explicacao
    };
}

function aumentarComplexidade(questao, indice) {
    if (nivelSelecionado < 2) {
        return questao;
    }

    const comandos = {
        2: "Analise o enunciado e relacione as informações antes de escolher a alternativa.",
        3: "Considere o contexto apresentado e identifique a interpretação mais consistente.",
        4: "Além da informação principal, avalie a consequência implícita no enunciado.",
        5: "Resolva considerando as relações entre os conceitos e descarte as alternativas parcialmente corretas."
    };

    const comando = comandos[nivelSelecionado];

    questao.pergunta = `${comando}\n\n${questao.pergunta}`;
    questao.complexidade = `Nível ${nivelSelecionado} — ${niveis[nivelSelecionado - 1].nome}`;

    if (indice % 2 === 0 && nivelSelecionado >= 4) {
        questao.tipo = `${questao.tipo} analítico`;
    }

    return questao;
}

/* QUESTÕES DE MATEMÁTICA */

function gerarMatematica(random, indice) {
    if (nivelSelecionado >= 3) {
        const desafio = indice % 5;

        if (desafio === 0) {
            const menor = numeroAleatorio(random, 2, 7);
            const maior = menor + numeroAleatorio(random, 3, 8);
            const soma = menor + maior;
            const produto = menor * maior;

            return criarQuestao(
                "Matemática",
                `As raízes de uma equação quadrática são positivas, têm soma ${soma} e produto ${produto}. Qual é a maior raiz?`,
                String(maior),
                [String(menor), String(soma), String(produto)],
                "Se as raízes são x e y, então x + y é a soma e xy é o produto. A maior raiz é obtida pela fórmula de Bhaskara.",
                random
            );
        }

        if (desafio === 1) {
            const total = numeroAleatorio(random, 6, 10);
            const favoraveis = numeroAleatorio(random, 2, total - 2);
            const extras = numeroAleatorio(random, 2, 5);
            const probabilidade = (favoraveis / total) * 100;
            const probabilidadeCondicional = (favoraveis / (total + extras)) * 100;

            return criarQuestao(
                "Matemática",
                `Uma urna tem ${favoraveis} peças aprovadas e ${total - favoraveis} reprovadas. Após incluir ${extras} peças reprovadas, uma peça é retirada ao acaso. Qual é a probabilidade de ela ser aprovada?`,
                `${probabilidadeCondicional.toFixed(1)}%`,
                [`${probabilidade.toFixed(1)}%`, `${(favoraveis / extras * 100).toFixed(1)}%`, "50%"],
                "O número de peças aprovadas permanece igual, mas o total aumenta com as novas peças reprovadas. Portanto, divide-se o número de aprovadas pelo novo total.",
                random
            );
        }

        if (desafio === 2) {
            const raio = numeroAleatorio(random, 4, 9);
            const area = Math.PI * raio * raio;
            const lado = numeroAleatorio(random, 3, 8);
            const areaQuadrado = lado * lado;
            const percentual = ((area / areaQuadrado) * 100).toFixed(1);

            return criarQuestao(
                "Matemática",
                `Uma circunferência de raio ${raio} cm está desenhada sobre uma placa quadrada de lado ${lado} cm. Usando π = 3,14, qual percentual aproximado da área da placa corresponde à área do círculo?`,
                `${((3.14 * raio * raio) / areaQuadrado * 100).toFixed(1)}%`,
                [`${percentual}%`, `${(areaQuadrado / (3.14 * raio * raio) * 100).toFixed(1)}%`, `${(raio / lado * 100).toFixed(1)}%`],
                "Calcula-se a área do círculo por πr², divide-se pela área do quadrado e multiplica-se o resultado por 100.",
                random
            );
        }

        if (desafio === 3) {
            const capital = numeroAleatorio(random, 8, 20) * 100;
            const taxa = numeroAleatorio(random, 2, 5);
            const periodos = numeroAleatorio(random, 2, 4);
            const montante = capital * Math.pow(1 + taxa / 100, periodos);

            return criarQuestao(
                "Matemática",
                `Um investimento de ${formatarDinheiro(capital)} rende juros compostos de ${taxa}% ao período durante ${periodos} períodos. Qual é o montante aproximado ao final?`,
                formatarDinheiro(montante),
                [formatarDinheiro(capital * (1 + taxa * periodos / 100)), formatarDinheiro(capital + taxa * periodos), formatarDinheiro(capital * Math.pow(1 + taxa / 100, periodos - 1))],
                "Em juros compostos, o fator (1 + taxa) é elevado ao número de períodos. Não se soma a taxa diretamente ao capital.",
                random
            );
        }

        const a = numeroAleatorio(random, 2, 6);
        const b = numeroAleatorio(random, 1, 5);
        const x = numeroAleatorio(random, 2, 7);
        const resultado = a * (x + b) + b;

        return criarQuestao(
            "Matemática",
            `Considere f(x) = ${a}x + ${b} e g(x) = x + ${b}. Qual é o valor de f(g(${x}))?`,
            String(resultado),
            [String(a * x + b), String(a * (x + b)), String(a * x + 2 * b + 1)],
            `Primeiro, g(${x}) = ${x + b}. Depois, f(${x + b}) = ${a}(${x + b}) + ${b} = ${resultado}.`,
            random
        );
    }

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

    História: [
        [
            "Fonte: Em uma carta de 1888, um fazendeiro afirma que a abolição alterou a lei, mas não criou meios para que os libertos participassem da vida econômica. A crítica central do documento está relacionada à:",
            "Persistência de desigualdades após a abolição",
            ["Defesa do retorno da escravidão", "Criação imediata de direitos sociais amplos", "Desaparição dos conflitos no campo"],
            "A fonte distingue a mudança jurídica da transformação social, sugerindo que a liberdade formal não eliminou a exclusão econômica."
        ],
        [
            "Fonte: Um jornal operário do início do século XX descreve jornadas extensas, baixos salários e a organização de associações de trabalhadores. A leitura do texto permite identificar:",
            "A formação de reivindicações coletivas no contexto industrial",
            ["A ausência de conflitos entre patrões e empregados", "A rejeição da urbanização pelos trabalhadores", "O fim das relações assalariadas"],
            "O documento relaciona condições de trabalho e organização política, característica da formação do movimento operário."
        ],
        [
            "Fonte: Ao justificar a expansão marítima, um cronista europeu combina argumentos religiosos, comerciais e políticos. Considerando a finalidade do relato, é mais adequado concluir que ele:",
            "Constrói uma justificativa favorável aos interesses da expansão",
            ["Registra uma descrição neutra e sem valores", "Rejeita qualquer contato entre sociedades", "Apresenta apenas dados geográficos sem interpretação"],
            "A seleção dos argumentos revela a perspectiva do autor e ajuda a legitimar o projeto expansionista."
        ],
        [
            "Fonte: Durante a Revolução Francesa, diferentes grupos defenderam a liberdade, mas divergiram sobre quem deveria participar da política. Essa tensão evidencia que:",
            "Ideias universais podiam conviver com limites sociais e políticos",
            ["Todos os grupos tinham os mesmos interesses", "A revolução eliminou imediatamente as desigualdades", "A linguagem política não sofreu mudanças"],
            "A interpretação deve considerar tanto o discurso de direitos quanto as exclusões presentes na prática."
        ],
        [
            "Fonte: Um decreto colonial regulamenta o comércio de determinados produtos e pune comerciantes que negociem fora das rotas autorizadas. A medida indica uma tentativa de:",
            "Reforçar o controle metropolitano sobre a economia colonial",
            ["Garantir autonomia comercial à colônia", "Reduzir a arrecadação da metrópole", "Encerrar a circulação atlântica"],
            "A regulamentação das rotas e das mercadorias busca concentrar benefícios e fiscalização nas mãos da metrópole."
        ],
        [
            "Fonte: Um depoimento de 1968 relata que a censura atingia jornais, peças e músicas, enquanto o governo apresentava a medida como necessária à segurança nacional. O contraste entre essas informações permite analisar:",
            "A disputa entre a justificativa oficial e os efeitos sobre a liberdade de expressão",
            ["A inexistência de censura cultural", "A plena liberdade de imprensa no período", "A separação entre política e produção artística"],
            "A fonte apresenta a justificativa do regime e uma consequência concreta, permitindo confrontar discurso e prática."
        ],
        [
            "Fonte: Em uma entrevista, uma liderança indígena afirma que a demarcação não é apenas uma questão de propriedade, mas também de memória, proteção ambiental e continuidade cultural. A principal chave de interpretação é:",
            "A relação entre território, identidade e direitos coletivos",
            ["A redução do território a um bem comercial", "A oposição entre cultura e preservação ambiental", "A defesa de fronteiras sem relação com a história"],
            "O depoimento amplia o conceito de território ao relacioná-lo à reprodução social, à memória e ao ambiente."
        ],
        [
            "Fonte: Um gráfico histórico mostra crescimento urbano acelerado após a instalação de indústrias, mas também aumento de moradias precárias nas periferias. A interpretação mais consistente é que a industrialização:",
            "Gerou empregos e urbanização, mas de modo socialmente desigual",
            ["Distribuiu renda e infraestrutura de forma uniforme", "Impediu o crescimento das cidades", "Eliminou as diferenças entre os grupos sociais"],
            "O gráfico exige relacionar crescimento econômico, migração e desigualdade, sem tratar a industrialização como fenômeno apenas positivo."
        ],
        [
            "Fonte: Dois livros didáticos descrevem a mesma revolta: um a chama de desordem, e o outro destaca a ação política de grupos populares. A diferença entre os relatos mostra que o conhecimento histórico:",
            "É construído a partir de interpretações, escolhas e perspectivas",
            ["Depende apenas da data dos acontecimentos", "É sempre idêntico em qualquer narrativa", "Dispensa a análise da autoria das fontes"],
            "Comparar narrativas revela que a seleção de palavras e enfoques interfere na interpretação do passado."
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
        História: ["Fonte histórica", "Documento", "Contexto", "Depoimento", "Análise"],
        Natureza: ["Experimento", "Dados", "Gráfico", "Ciclo", "Comparação"],
        Humanas: ["Mapa", "Texto", "Estatística", "Contexto", "Análise"],
        Inglês: ["Reading", "Dialogue", "Ad", "Context", "Message"],
        Espanhol: ["Lectura", "Diálogo", "Anuncio", "Texto", "Contexto"]
    };

    const estilosVestibular = [
        "Estilo ENEM",
        "Estilo FUVEST",
        "Estilo UNICAMP",
        "Estilo UNESP",
        "Estilo UERJ"
    ];

    const lista = [];

    if (materiaSelecionada === "Matemática") {
        for (let i = 0; i < 50; i++) {
            const questao = gerarMatematica(random, i);
            questao.origem = estilosVestibular[i % estilosVestibular.length];
            lista.push(questao);
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
            aumentarComplexidade(criarQuestao(
                materiaSelecionada,
                item[0],
                item[1],
                item[2],
                item[3],
                random,
                tipo,
                estilosVestibular[lista.length % estilosVestibular.length]
            ), lista.length)
        );
    }

    if (lista.length < 50) {
        while (lista.length < 50) {
            const item = bancoEmbaralhado[lista.length % bancoEmbaralhado.length];
            const tipo =
                item.tipo ||
                tiposPorMateria[materiaSelecionada][lista.length % tiposPorMateria[materiaSelecionada].length];

            lista.push(
                aumentarComplexidade(criarQuestao(
                    materiaSelecionada,
                    item[0],
                    item[1],
                    item[2],
                    item[3],
                    random,
                    tipo,
                    estilosVestibular[lista.length % estilosVestibular.length]
                ), lista.length)
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

    document.getElementById("origemQuestao").textContent =
        questao.origem || "Questão autoral";

    document.getElementById("complexidadeQuestao").textContent =
        questao.complexidade || `Nível ${nivelSelecionado} — ${niveis[nivelSelecionado - 1].nome}`;

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

    document.getElementById("acertosFinal").textContent =
        `${acertos} ${acertos === 1 ? "questão acertada" : "questões acertadas"}`;

    document.getElementById("textoResultado").textContent =
        `Você respondeu ${respondidas} de 50 questões, errou ${respondidas - acertos} e ainda tem ${50 - respondidas} para concluir o treino do dia.`;

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
    iniciarQuiz();
});

/* INICIALIZA O SITE */

criarMaterias();
criarNiveis();
atualizarBotaoInicial();