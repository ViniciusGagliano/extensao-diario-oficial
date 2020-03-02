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
            if (localStorage.getItem("paginas") === 12)
                return false;
            
            await $('#container-busca a').each(async (index, value) => {
                if (value.href.indexOf('.pdf') >= 0) {
                    window.open(value.href);
                    let baixados = localStorage.getItem("baixados");
                    localStorage.setItem("baixados", ++baixados);
                }
            });

            if (localStorage.getItem("baixados") === 15) {
                let pagina = localStorage.getItem("pagina");
                localStorage.setItem("pagina", ++pagina);
                await $('.pager.lfr-pagination-buttons li').each(async (index, value) => {
                    if (value.text === 'Próximo') {
                        localStorage.setItem("baixados", 0);
                        window.open(value.href, "_self");
                    }
                });
            }
        },
    };

    new Promise(resolve => {
        if (Telas.isLogin)
            resolve(Telas.Login());
        else if (Telas.isSelecionarAplicacao)
            resolve(Telas.SelecionarAplicacao());
        else if (Telas.isDefault)
            resolve(Telas.Default());
        else if (Telas.isEntradaPreIndexacao)
            resolve(Telas.EntradaPreIndexacao());
        else if (Telas.isPreIndexacao)
            resolve(Telas.PreIndexacao());
        else if (Telas.isLogout)
            resolve(Telas.Logout());
        else {
            if (Global.url[2] == 'san.nsportal.com.br') {
                $('body').html('<B><CENTER>AUTENTICANDO USUÁRIO...</CENTER></B>');
                resolve(Telas.Autenticacao());
            }
        }
    }).catch(err => Servicos.Encerramento(StatusProcessamento.Erro, err.message));
    return false;
});