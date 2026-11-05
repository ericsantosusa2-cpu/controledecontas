let usuario = localStorage.getItem("usuario");

if (!usuario) {

    usuario = prompt("Digite seu nome:");

    if (!usuario || usuario.trim() === "") {
        usuario = "Usuário";
    }

    localStorage.setItem("usuario", usuario);
}

document.getElementById("usuarioAtual").innerHTML =
    "Usuário Atual: " + usuario;

let todosRegistros = [];

/* ===========================
   REGISTRAR
=========================== */

async function registrar() {

    try {

        const codigo =
            document
            .getElementById("codigo")
            .value
            .trim();

        const etapa =
            document
            .getElementById("etapa")
            .value;

        if (
            codigo.length !== 6 &&
            codigo.length !== 7
        ) {

            alert("Código inválido");

            return;
        }

        const tipo =
            codigo.length === 7
                ? "CONTA"
                : "PROTOCOLO";

        const {
            data: existe,
            error: erroConsulta
        } =
        await supabaseClient
            .from("registros")
            .select("*")
            .eq("codigo", codigo)
            .eq("etapa", etapa);

        if (erroConsulta) {

            console.error(erroConsulta);

            alert(
                "Erro ao verificar duplicidade."
            );

            return;
        }

        if (
            existe &&
            existe.length > 0
        ) {

            alert(
                `Esta conta já foi registrada em ${etapa}`
            );

            return;
        }

        const { error } =
            await supabaseClient
            .from("registros")
            .insert([
                {
                    codigo,
                    tipo,
                    etapa,
                    usuario
                }
            ]);

        if (error) {

            console.error(error);

            alert(
                "Erro ao gravar:\n\n" +
                error.message
            );

            return;
        }

        document.getElementById(
            "codigo"
        ).value = "";

        carregar();

    }
    catch (erro) {

        console.error(erro);

        alert(
            "Erro inesperado:\n\n" +
            erro.message
        );
    }
}

/* ===========================
   CARREGAR
=========================== */

async function carregar() {

    const { data, error } =
        await supabaseClient
            .from("registros")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );

    if (error) {

        console.error(error);

        return;
    }

    todosRegistros = data || [];

    render(todosRegistros);

    const pre =
        todosRegistros.filter(
            x => x.etapa === "PRE"
        ).length;

    const pos =
        todosRegistros.filter(
            x => x.etapa === "POS"
        ).length;

    document.getElementById("pre").innerText =
        pre;

    document.getElementById("pos").innerText =
        pos;

    document.getElementById("total").innerText =
        todosRegistros.length;
}

/* ===========================
   RENDER
=========================== */

function render(lista) {

    let html = "";

    lista.forEach(item => {

        html += `
        <tr>

            <td>${item.codigo}</td>

            <td>
                ${
                    item.tipo === "CONTA"
                    ? '<span class="badge-conta">CONTA</span>'
                    : '<span class="badge-protocolo">PROTOCOLO</span>'
                }
            </td>

            <td>
                ${item.etapa || "-"}
            </td>

            <td>
                ${item.usuario}
            </td>

            <td>
                ${new Date(item.data_hora)
                .toLocaleString("pt-BR")}
            </td>

        </tr>
        `;
    });

    document
        .getElementById("tabela")
        .innerHTML = html;
}

/* ===========================
   FILTRAR
=========================== */

function filtrar() {

    const texto =
        document
        .getElementById("pesquisa")
        .value
        .toLowerCase();

    const dataFiltro =
        document
        .getElementById("filtroData")
        .value;

    const filtrados =
        todosRegistros.filter(item => {

            const pesquisaOk =

                String(item.codigo)
                .toLowerCase()
                .includes(texto)

                ||

                String(item.usuario)
                .toLowerCase()
                .includes(texto)

                ||

                String(item.tipo)
                .toLowerCase()
                .includes(texto)

                ||

                String(item.etapa || "")
                .toLowerCase()
                .includes(texto);

            let dataOk = true;

            if(dataFiltro){

                const dataRegistro =
                    new Date(item.data_hora)
                    .toISOString()
                    .split("T")[0];

                dataOk =
                    dataRegistro === dataFiltro;
            }

            return pesquisaOk && dataOk;

        });

    render(filtrados);
}

function limparFiltroData() {

    document
    .getElementById("filtroData")
    .value = "";

    render(todosRegistros);
}

/* ===========================
   TROCAR USUARIO
=========================== */

function trocarUsuario() {

    localStorage.removeItem(
        "usuario"
    );

    location.reload();
}

/* ===========================
   EXPORTAR CSV
=========================== */

function exportarCSV() {

    let csv =
    "Codigo,Tipo,Etapa,Usuario,DataHora\n";

    todosRegistros.forEach(item => {

        csv +=
        `${item.codigo},${item.tipo},${item.etapa || ""},${item.usuario},${item.data_hora}\n`;

    });

    const blob =
        new Blob(
            [csv],
            {
                type:
                "text/csv;charset=utf-8;"
            }
        );

    const link =
        document.createElement("a");

    link.href =
        URL.createObjectURL(blob);

    link.download =
        "controle_producao.csv";

    link.click();
}

/* ===========================
   ENTER
=========================== */

document
    .getElementById("codigo")
    .addEventListener(
        "keypress",
        function (e) {

            if (e.key === "Enter") {

                registrar();
            }
        }
    );

/* ===========================
   REALTIME
=========================== */

carregar();

supabaseClient
    .channel("registros")
    .on(
        "postgres_changes",
        {
            event: "*",
            schema: "public",
            table: "registros"
        },
        () => {

            carregar();
        }
    )
    .subscribe();
