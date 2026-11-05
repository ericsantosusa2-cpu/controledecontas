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

async function registrar() {

    try {

        const codigo =
            document.getElementById("codigo")
                .value
                .trim();

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

        const { data: existe, error: erroConsulta } =
            await supabaseClient
                .from("registros")
                .select("codigo")
                .eq("codigo", codigo);

        if (erroConsulta) {
            console.error(erroConsulta);
            alert("Erro ao verificar duplicidade.");
            return;
        }

        if (existe && existe.length > 0) {

            alert("Código já registrado");

            return;
        }

        const { error } =
            await supabaseClient
                .from("registros")
                .insert([
                    {
                        codigo: codigo,
                        tipo: tipo,
                        usuario: usuario
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

        document.getElementById("codigo").value = "";

        carregar();

    } catch (erro) {

        console.error(erro);

        alert("Erro inesperado.");
    }
}

async function carregar() {

    const contas =
data.filter(x=>x.tipo==="CONTA").length;

const protocolos =
data.filter(x=>x.tipo==="PROTOCOLO").length;

document.getElementById("contas").innerText =
contas;

document.getElementById("protocolos").innerText =
protocolos;

document.getElementById("total").innerText =
data.length;

    
    const { data, error } =
        await supabaseClient
            .from("registros")
            .select("*")
            .order(
                "id",
                { ascending: false }
            );

    if (error) {

        console.error(error);

        return;
    }

    todosRegistros = data || [];

    render(todosRegistros);
}

function render(lista) {

    let html = "";

    lista.forEach(item => {

        html += `
        <tr>
            <td>${item.codigo}</td>
            <td>
${item.tipo === "CONTA"
? '<span class="badge-conta">CONTA</span>'
: '<span class="badge-protocolo">PROTOCOLO</span>'}
</td>
            <td>${item.usuario}</td>
            <td>${new Date(item.data_hora).toLocaleString("pt-BR")}</td>
        </tr>
        `;

    });

    document.getElementById("tabela").innerHTML = html;
}

function filtrar() {

    const texto =
        document
            .getElementById("pesquisa")
            .value
            .toLowerCase();

    const filtrados =
        todosRegistros.filter(item =>

            item.codigo.toLowerCase().includes(texto) ||
            item.tipo.toLowerCase().includes(texto) ||
            item.usuario.toLowerCase().includes(texto)

        );

    render(filtrados);
}

function trocarUsuario() {

    localStorage.removeItem("usuario");

    location.reload();
}

function exportarCSV() {

    let csv =
        "Codigo,Tipo,Usuario,DataHora\n";

    todosRegistros.forEach(item => {

        csv +=
            `${item.codigo},${item.tipo},${item.usuario},${item.data_hora}\n`;

    });

    const blob =
        new Blob(
            [csv],
            {
                type: "text/csv;charset=utf-8;"
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
