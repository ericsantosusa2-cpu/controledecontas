let usuario =
localStorage.getItem("usuario");

if(!usuario){

    usuario = prompt(
        "Digite seu nome:"
    );

    if(!usuario){
        usuario = "Usuário";
    }

    localStorage.setItem(
        "usuario",
        usuario
    );
}

document.getElementById(
    "usuarioAtual"
).innerHTML =
    "Usuário Atual: " + usuario;

let todosRegistros = [];

async function registrar(){

    const codigo =
    document.getElementById("codigo")
    .value
    .trim();

    if(
        codigo.length !== 6 &&
        codigo.length !== 7
    ){
        alert("Código inválido");
        return;
    }

    const tipo =
    codigo.length === 7
    ? "CONTA"
    : "PROTOCOLO";

    const { data: existe } =
    await supabaseClient
    .from("registros")
    .select("codigo")
    .eq("codigo", codigo);

    if(existe && existe.length > 0){

        alert("Código já registrado");
        return;
    }

    const { error } =
    await supabaseClient
    .from("registros")
    .insert([
        {
            codigo,
            tipo,
            usuario
        }
    ]);

    if(error){

        alert(error.message);
        return;
    }

    document.getElementById(
        "codigo"
    ).value = "";

    carregar();
}

async function carregar(){

    const { data, error } =
    await supabaseClient
    .from("registros")
    .select("*")
    .order(
        "id",
        {
            ascending:false
        }
    );

    if(error){
        console.error(error);
        return;
    }

    todosRegistros = data;

    render(data);
}

function render(lista){

    let html = "";

    lista.forEach(item=>{

        html += `
        <tr>
            <td>${item.codigo}</td>
            <td>${item.tipo}</td>
            <td>${item.usuario}</td>
            <td>${new Date(item.data_hora).toLocaleString("pt-BR")}</td>
        </tr>
        `;
    });

    document
    .getElementById("tabela")
    .innerHTML = html;
}

function filtrar(){

    const texto =
    document
    .getElementById("pesquisa")
    .value
    .toLowerCase();

    const filtrados =
    todosRegistros.filter(r=>

        r.codigo.toLowerCase().includes(texto) ||
        r.tipo.toLowerCase().includes(texto) ||
        r.usuario.toLowerCase().includes(texto)

    );

    render(filtrados);
}

function trocarUsuario(){

    localStorage.removeItem(
        "usuario"
    );

    location.reload();
}

function exportarCSV(){

    let csv =
    "Codigo,Tipo,Usuario,DataHora\n";

    todosRegistros.forEach(r=>{

        csv += `${r.codigo},${r.tipo},${r.usuario},${r.data_hora}\n`;

    });

    const blob =
    new Blob(
        [csv],
        {type:"text/csv"}
    );

    const a =
    document.createElement("a");

    a.href =
    URL.createObjectURL(blob);

    a.download =
    "controle_producao.csv";

    a.click();
}

document
.getElementById("codigo")
.addEventListener(
    "keypress",
    e=>{
        if(e.key==="Enter"){
            registrar();
        }
    }
);

supabaseClient
.channel("registros")
.on(
    "postgres_changes",
    {
        event:"*",
        schema:"public",
        table:"registros"
    },
    ()=>{
        carregar();
    }
)
.subscribe();

carregar();