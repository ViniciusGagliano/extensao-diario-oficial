$(document).ready(function () {
    //Objeto Global
    const Global = {
        url: window.location.href.split('/')
    };

    const Funcoes = {
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
        BaixarPdf: async (url) => {
            return new Promise(async resolve => {
                // window.open(value.href, "_self");
                let a = document.createElement("a");
                a.href = url;
                a.download = url;
                document.body.appendChild(a);
                a.click();
                a.remove()
                localStorage.setItem('pdf', parseInt(localStorage.getItem('pdf')) + 1);
                resolve();
            });
        },
        TrocarPagina: async (c) => {
            return new Promise(async resolve => {
                let pagina = localStorage.getItem("pagina");
                console.log(pagina);
                localStorage.setItem("pagina", ++pagina);
                await $(`${c} li`).each(async function () {
                    $(this).find('a').each(async (key, value) => {
                        console.log(value.text);
                        if (value.text.trim() === 'Próximo') {
                            localStorage.setItem("baixados", 0);
                            window.open(value.href, "_self");
                        }
                    });
                });
                resolve();
            });
        },
        TrocarAno: async (ano) => {
            let url = window.location.href.split('/').splice(0, 3);
            url.push(ano);
            window.open(url.join('/'), '_self');
        }
    };

    const Telas = {
        //Atributos
        isHome: Global.url.some(url => url.includes(`mpal.mp.br`)),
        isDoe: Global.url.some(url => url.includes(`doe`)),
        // isDiarioOficial: Global.url.some(url => url.indexOf(`diario-oficial-eletronico`) >= 0),
        // isBusca: Global.url.some(url => url.indexOf(`busca`) >= 0),

        //Métodos
        Home: async () => {
            localStorage.clear();
            localStorage.setItem('ano', 2018);
            Funcoes.TrocarAno(`doe_${localStorage.getItem('ano')}`);
        },
        Doe: async () => {
            setTimeout(() => {
                console.log('esperando');
            }, 10000);
            localStorage.removeItem('length');
            localStorage.removeItem('pdf');
            let arrayDownload = document.getElementsByClassName('wpdm-download-link btn btn-primary');
            if (!arrayDownload.length)
                return;

            localStorage.setItem('length', arrayDownload.length);
            localStorage.setItem('pdf', 0);
            for (const item of arrayDownload) {
                let url = item.attributes.onclick.value;
                url = url.substr(0, url.indexOf(';'));
                console.log(url);
                await Funcoes.BaixarPdf(url);
            }
            let thread = setInterval(() => {
                let pdf = parseInt(localStorage.getItem('pdf'));
                let length = parseInt(localStorage.getItem('length'));
                if (pdf === length) {
                    clearInterval(thread);
                    let ano = localStorage.getItem('ano');
                    localStorage.setItem('ano', ano - 1);
                    Funcoes.TrocarAno(`doe_${localStorage.getItem('ano')}`);
                }
            }, 1000);
        },
        // DiarioOficial: async () => {
        //     $('#link-all-mobile a').each(async (index, value) => {
        //         if (value.text.indexOf('Ver todos') >= 0)
        //             window.open(value.href, "_self");
        //     });
        // },
        // Busca: async () => {
        //     localStorage.setItem("baixados", 0);
        //     if (localStorage.getItem("pagina") > 11) {
        //         window.close();
        //         return false;
        //     }

        //     // await Funcoes.Util.BaixarPdf('container-busca').then(async _ => {
        //     //     console.log(localStorage.getItem("baixados"));
        //     //     if (localStorage.getItem("baixados") > 14)
        //     //         await Funcoes.Util.TrocarPagina('.pager.lfr-pagination-buttons');
        //     // });

        //     let thread = setInterval(async function () {
        //         await $(`#container-busca a`).each((index, value) => {
        //             if (value.href.indexOf('.pdf') >= 0) {
        //                 // window.open(value.href);
        //                 let a = document.createElement("a");
        //                 a.href = value.href;
        //                 a.download = value.text.trim().substr(1, 72);
        //                 document.body.appendChild(a);
        //                 a.click();
        //                 a.remove();

        //                 let baixados = localStorage.getItem("baixados");
        //                 localStorage.setItem("baixados", ++baixados);
        //             }

        //             if (localStorage.getItem("baixados") > 14) {
        //                 clearInterval(thread);
        //                 let pagina = localStorage.getItem("pagina");
        //                 localStorage.setItem("pagina", ++pagina);
        //                 $(`.pager.lfr-pagination-buttons li`).each(function () {
        //                     $(this).find('a').each((key, value) => {
        //                         console.log(value.text);
        //                         if (value.text.trim() === 'Próximo') {
        //                             localStorage.setItem("baixados", 0);
        //                             window.open(value.href, "_self");
        //                         }
        //                     });
        //                 });
        //             }
        //         });
        //     })
        // },
    };

    new Promise(resolve => {
        if (Telas.isDoe) {
            resolve(Telas.Doe());
        }
        else if (Telas.isHome) {
            resolve(Telas.Home());
        }
        else
            return false;
    }).catch(err => console.log(err));
    return false;
});