$(document).ready(function () {
    //Objeto Global
    const Global = {
        url: window.location.href.split('/')
    };

    const Funcoes = {
        LocalStorage: {
            RemoveAll: async () => {
                localStorage.removeItem('pagina');
                localStorage.removeItem('baixados');
            },
        },
        Util: {
            Clique: async (id) => {
                $(`#${id}`)[0].click();
            },
            PreencherCampo: async ({ id, valor, tipo }) => {
                $(tipo).each(function () {
                    if (Object.is(this.id, id)) {
                        $(this).val(valor);
                        $(this).attr('onclick', $(this).attr('onchange'));
                        Funcoes.Util.Clique(id);
                    }
                });
            },
        },
    };

    const Telas = {
        //Atributos
        isHome: Global.url.some(url => url.indexOf(`home`) >= 0),
        isDiarioOficial: Global.url.some(url => url.indexOf(`diario-oficial-eletronico`) >= 0),
        isBusca: Global.url.some(url => url.indexOf(`busca`) >= 0),

        //Métodos
        Home: async () => {
            Funcoes.LocalStorage.RemoveAll();
            window.open("http://www.mprj.mp.br/diario-oficial-eletronico", "_self");
        },
        DiarioOficial: async () => {
            localStorage.setItem("pagina", 1);
            localStorage.setItem("baixados", 0);
            $('#link-all-mobile a').each(async (index, value) => {
                if (value.text.indexOf('Ver todos') >= 0)
                    window.open(value.href, "_self");
            });
        },
        Busca: async () => {
            if (localStorage.getItem("paginas") === 12) {
                window.close();
                return false;
            }

            await $('#container-busca a').each(async (index, value) => {
                if (value.href.indexOf('.pdf') >= 0) {
                    // window.open(value.href);
                    let a = document.createElement("a");
                    a.href = value.href;
                    a.download = value.text.trim().substring(1, 72);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    let baixados = localStorage.getItem("baixados");
                    localStorage.setItem("baixados", ++baixados);
                }
            });

            if (localStorage.getItem("baixados") === 15) {
                let pagina = localStorage.getItem("pagina");
                localStorage.setItem("pagina", ++pagina);
                await $('.pager.lfr-pagination-buttons li').each(async function () {
                    $(this).find('a').each(async (key, value) => {
                        if (value.text === 'Próximo') {
                            localStorage.setItem("baixados", 0);
                            window.open(value.href, "_self");
                        }
                    });
                });
            }
        },
    };

    new Promise(resolve => {
        if (Telas.isHome)
            resolve(Telas.Home());
        else if (Telas.isDiarioOficial)
            resolve(Telas.DiarioOficial());
        else if (Telas.isBusca)
            resolve(Telas.Busca());
        else
            return false;
    }).catch(err => console.log(err));
    return false;
});