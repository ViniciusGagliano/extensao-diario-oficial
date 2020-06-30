const Telas = {
    //Atributos
    isHome: Global.url.some(url => url.indexOf(`home`) >= 0),
    isDiarioOficial: Global.url.some(url => url.indexOf(`diario-oficial-eletronico`) >= 0),
    isBusca: Global.url.some(url => url.indexOf(`busca`) >= 0),

    //Métodos
    Home: async () => {
        Funcoes.LocalStorage.RemoveAll();
        localStorage.setItem("pagina", 1);
        window.open("http://www.mprj.mp.br/diario-oficial-eletronico", "_self");
    },
    DiarioOficial: async () => {
        $('#link-all-mobile a').each(async (index, value) => {
            if (value.text.indexOf('Ver todos') >= 0)
                window.open(value.href, "_self");
        });
    },
    Busca: async () => {
        localStorage.setItem("baixados", 0);
        if (localStorage.getItem("pagina") > 11) {
            window.close();
            return false;
        }

        // await Funcoes.Util.BaixarPdf('container-busca').then(async _ => {
        //     console.log(localStorage.getItem("baixados"));
        //     if (localStorage.getItem("baixados") > 14)
        //         await Funcoes.Util.TrocarPagina('.pager.lfr-pagination-buttons');
        // });

        let thread = setInterval(async function () {
            await $(`#container-busca a`).each((index, value) => {
                if (value.href.indexOf('.pdf') >= 0) {
                    // window.open(value.href);
                    let a = document.createElement("a");
                    a.href = value.href;
                    a.download = value.text.trim().substr(1, 72);
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                    let baixados = localStorage.getItem("baixados");
                    localStorage.setItem("baixados", ++baixados);
                }

                if (localStorage.getItem("baixados") > 14) {
                    clearInterval(thread);
                    let pagina = localStorage.getItem("pagina");
                    localStorage.setItem("pagina", ++pagina);
                    $(`.pager.lfr-pagination-buttons li`).each(function () {
                        $(this).find('a').each((key, value) => {
                            console.log(value.text);
                            if (value.text.trim() === 'Próximo') {
                                localStorage.setItem("baixados", 0);
                                window.open(value.href, "_self");
                            }
                        });
                    });
                }
            });
        })
    },
};