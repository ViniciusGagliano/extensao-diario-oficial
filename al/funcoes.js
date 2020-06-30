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
        BaixarPdf: async (id) => {
            return new Promise(async resolve => {
                await $(`#${id} a`).each(async (index, value) => {
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
                });

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
    },
};