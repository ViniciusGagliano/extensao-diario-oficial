$(document).ready(function () {
    //Objeto Global
    const Global = {
        url: window.location.href.split('/')
    };

    const Funcoes = {
        Clique: async (id) => {
            $(`#${id}`)[0].click();
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
        TrocarPagina: async (pagina) => {
            let url = window.location.href.split('/').splice(0, 3);
            let params = `index.php?pagina=${pagina}`;
            url.push(params);
            window.open(url.join('/'), '_self');
        }
    };

    const Telas = {
        //Atributos
        isHome: Global.url.some(url => url.includes(`mpse.mp.br`)),
        isDiarioOficial: Global.url.some(url => url.includes(`informativo-diario-oficial`)),

        //Métodos
        Home: async () => {
            localStorage.clear();
            localStorage.setItem('pagina', 1);
            Funcoes.TrocarPagina(1);
        },
        DiarioOficial: async () => {
            setTimeout(() => {
                console.log('esperando');
            }, 10000);

            localStorage.removeItem('length');
            localStorage.removeItem('pdf');
            let arrayDownload = document.getElementsByClassName('img_download');
            if (!arrayDownload.length)
                return;

            localStorage.setItem('length', arrayDownload.length);
            localStorage.setItem('pdf', 0);
            for (const item of arrayDownload) {
                let url = item.href;
                console.log(url);
                await Funcoes.BaixarPdf(url);
            }

            let thread = setInterval(() => {
                let pdf = parseInt(localStorage.getItem('pdf'));
                let length = parseInt(localStorage.getItem('length'));
                if (pdf === length) {
                    clearInterval(thread);
                    let pagina = parseInt(localStorage.getItem('pagina'));
                    pagina += 1;
                    localStorage.setItem('pagina', pagina);
                    Funcoes.TrocarPagina(pagina);
                }
            }, 1000);
        },
    };

    new Promise(resolve => {
        if (Telas.isDiarioOficial)
            resolve(Telas.DiarioOficial());
        else if (Telas.isHome)
            resolve(Telas.Home());
        return false;
    }).catch(err => console.log(err));
    return false;
});