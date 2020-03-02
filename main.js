$(document).ready(function () {
    //Identificando a tela do sistema.
    window.alert = function () { };

    //Objeto Global
    const Global = {
        homologacao: true,
        url: window.location.href.split('/'),
        bancoExtensaoId: 11,
        codigoCliente: 7056,

        //Configuração das chamdas ajax
        Settings: {
            "async": true,
            "crossDomain": true,
            "url": ``,
            "method": "POST",
            "headers": { "content-type": "application/x-www-form-urlencoded" },
            "data": {}
        },
    };

    //Chamadas das apis
    const Servicos = {
        url: `${(Global.homologacao) ? atob("aHR0cDovL2xvY2FsaG9zdA==") : atob("aHR0cHM6Ly93d3cuZ2VyZW5jaWFsY3JlZGl0by5jb20=")}/apis/extensaodigitacao/api/${Global.codigoCliente}/dados`,

        CarregarDadosAcesso: async () => {
            return new Promise(async (resolve, reject) => {
                Global.Settings.url = `${Servicos.url}/carregardadosacesso`;
                Global.Settings.data = Funcoes.LocalStorage.GetModel();
                console.log(Global.Settings);

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    console.log(status);
                    console.log(error);
                    reject(new Error(`${status} - ${error}`));
                });
            });
        },

        CarregarDadosMapeamento: async () => {
            return new Promise((resolve, reject) => {
                Global.Settings.url = `${Servicos.url}/carregar`;
                Global.Settings.data = Funcoes.LocalStorage.GetModel();

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    reject(`${status} - ${error}`);
                });
            });
        },

        CarregarPedidoFila: async () => {
            return new Promise((resolve, reject) => {
                Global.Settings.url = `${Servicos.url}/carregarpedidofila/${localStorage.getItem('login')}`;
                Global.Settings.data = Funcoes.LocalStorage.GetModel();

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    reject(`${status} - ${error}`);
                });
            });
        },

        CadastrarPedidoFila: async () => {
            return new Promise((resolve, reject) => {
                Global.Settings.url = `${Servicos.url}/cadastrarpedidofila/${localStorage.getItem('login')}`;
                Global.Settings.data = Funcoes.LocalStorage.GetModel();

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    reject(`${status} - ${error}`);
                });
            });
        },

        SalvarProposta: async (ade) => {
            return new Promise(resolve => {
                Global.Settings.url = `${Servicos.url}/salvarproposta`;
                let model = Funcoes.LocalStorage.GetModel();
                model.numeroProposta = ade;
                Global.Settings.data = model;

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    reject(`${status} - ${error}`);
                });
            });
        },

        SalvarErroExtensao: async (msg) => {
            return new Promise((resolve, reject) => {
                Global.Settings.url = `${Servicos.url}/salvarerroextensaos`;
                let model = Funcoes.LocalStorage.GetModel();
                model.mensagemErro = msg;
                Global.Settings.data = model;

                $.ajax(Global.Settings).done(response => {
                    resolve(response);
                }).fail((_, status, error) => {
                    reject(`${status} - ${error}`);
                });
            });
        },
    };

    //Funções
    const Funcoes = {
        Auth: {
            PreLogar: async (cdUsuario) => {
                return await axios.post(`https://www.santandernegocios.com.br/F6_framework_portal/asp/F6_preLogin.asp`, `cdUsuario=${cdUsuario}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },

            Autenticar: async (cdUsuarioMD5, Eka) => {
                return await axios.post(`https://www.santandernegocios.com.br/F6_framework_portal/asp/F6_autenticar.asp`, `cdUsuarioMD5=${cdUsuarioMD5}&Eka=${Eka}`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },

            IdentificacaoUsuario: async (pswSenhaCript, cdUsuario, cdSenha) => {
                return await axios.post(`https://www.santandernegocios.com.br/F6_FrameWork_Portal/asp/F6_identificacaousuario.asp`, `autoSubmit=0&hdnSubmit=1&pswSenha=${cdSenha}&pswSenhaCript=${pswSenhaCript}&txtIs_fb=false&txtIs_fx=false&txtIs_ie=true&txtIs_major=7&txtIs_minor=7&txtIs_moz=false&txtIs_nav=false&txtUsuario=${cdUsuario}&txtW_height=&txtW_width=`, {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },

            ObterToken: async (pswSenhaCript) => {
                return await axios.get(`https://www.santandernegocios.com.br/CSG_CREDITO_CONSIGNADO/ASP/CSG_LOGINMBSCSG.ASP`, "", {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            },

            //Função para entrar no sistema do banco
            Logar: async () => {
                return new Promise(async (resolve, reject) => {
                    const cdUsuario = localStorage.getItem('login');
                    const cdSenha = localStorage.getItem('senha');
                    const preLogin = await Funcoes.Auth.PreLogar(cdUsuario);
                    //cod == 200 || !cod == -1
                    if (!preLogin.data || preLogin.data.indexOf('<retorno cod="-1" />') >= 0)
                        reject(new Error("Falha no PreLogin"));

                    var cdUsuarioMD5 = f40(f62(cdUsuario.toUpperCase()));
                    if (!cdUsuarioMD5)
                        reject(new Error("Login inválido"));

                    var PASS = cdUsuarioMD5;
                    PBE_RANDOM = xml2json(preLogin.data).retorno.HS_Random;
                    kA = new String();
                    kSc = new String();
                    var Eka = f52(PASS, kA, kSc);
                    if (!Eka)
                        reject(new Error("Eka incorreto"));

                    const autenticacao = await Funcoes.Auth.Autenticar(cdUsuarioMD5, Eka);
                    if (autenticacao.status != 200)
                        reject(new Error("Erro ao se autenticar"));

                    const senhaCript = f9(f44(f41(f12(kSc.value), 16), cdSenha));
                    const usuario = await Funcoes.Auth.IdentificacaoUsuario(senhaCript, cdUsuario, cdSenha);
                    if (usuario.status != 200 || usuario.data.indexOf(`alert('Usu`) >= 0)
                        reject(new Error("Erro na identificação do usuário"));

                    const token = await Funcoes.Auth.ObterToken(senhaCript);
                    if (token.status != 200 || token.data.indexOf('Erro ') >= 0)
                        reject(new Error("Erro ao obter token"));

                    if (!token.data || token.data.includes(`alert('Usu)`))
                        reject(new Error("Falha ao ler o token"));

                    setTimeout(() => {
                        let url = token.data.split('window.open')[1];
                        if (url) {
                            // var url = token.data.split('window.open')[1].split("',")[0].replace("('", '');
                            url = url.split("',")[0].replace("('", '');
                            url = url.replace("https://consignado.santander.com.br/portal/login/default.aspx", "https://consignado.santander.com.br/autorizador45/login/default.aspx");
                            resolve(url);
                        }
                        reject("Erro ao capturar a url");
                    }, 1000);
                });
            },
        },
        LocalStorage: {
            //Função para remover todos os dados do localStorage
            RemoveAll: async () => {
                return new Promise(resolve => {
                    localStorage.removeItem('dadosMapeamentoJSON');
                    localStorage.removeItem('model');
                    localStorage.removeItem("login");
                    localStorage.removeItem('senha');
                    localStorage.removeItem('digitado');
                    localStorage.removeItem('confirmacao');
                    localStorage.removeItem('pdf');
                    resolve();
                });
            },

            SetItem: (key, value) => {
                try {
                    localStorage.removeItem(key);
                    localStorage.setItem(key, value);
                } catch (error) {
                    throw new Error(`SetItem: ${error.message}`);
                }
            },

            SetModel: async (atributo) => {
                return new Promise(resolve => {
                    let model = {};
                    if (typeof (atributo) === 'string') {
                        const atributos = atributo.split(';');
                        model = {
                            usuarioId: parseInt(atributos[0]),
                            codigoCliente: parseInt(atributos[1]),
                            contratoId: parseInt(atributos[2]),
                            clienteId: parseInt(atributos[3]),
                            privlegioId: parseInt(atributos[4]),
                            bancoExtensaoId: Global.bancoExtensaoId
                        };
                    } else {
                        model = atributo;
                    }

                    Funcoes.LocalStorage.SetItem('model', JSON.stringify(model));
                    resolve();
                });
            },

            GetModel: () => {
                return $.parseJSON(localStorage.getItem('model'));
            },

            //Chama da api para trazer os dados de login e senha. Precisa da model cadastrada antes.
            SetDadosAcesso: async () => {
                return new Promise(async (resolve, reject) => {
                    await Servicos.CarregarDadosAcesso().then(auth => {
                        console.log(auth);
                        if (!auth.Key || !auth.Value)
                            reject(new Error(`Erro na autenticação da api`));

                        Funcoes.LocalStorage.SetItem('login', auth.Key);
                        Funcoes.LocalStorage.SetItem('senha', auth.Value);
                        resolve();
                    }).catch(error => {
                        console.log(error);
                        reject(new Error(`SetDadosAcesso: ${error.message}`));
                    })
                });
            },

            SetDadosMapeamento: async () => {
                return new Promise(async (resolve, reject) => {
                    await Servicos.CarregarDadosMapeamento().then(dados => {
                        Funcoes.LocalStorage.SetItem('dadosMapeamentoJSON', JSON.stringify(dados));
                        resolve();
                    }).catch(error => {
                        reject(new Error(`SetDadosMapeamento: ${error.message}`));
                    });
                });
            },

            //Carregar os dados que estão salvos no localStorage
            GetDadosMapeamento: async (tela) => {
                return new Promise((resolve, reject) => {
                    const dadosMapeamentoJSON = localStorage.getItem(`dadosMapeamentoJSON`);
                    const dados = $.parseJSON(dadosMapeamentoJSON);
                    if (!!dados && dados != null) {
                        let dadosTela = dados.filter(dado => {
                            if (Object.is(dado.Tela.toLowerCase(), tela.toLowerCase()))
                                return dado;
                        });
                        resolve(dadosTela);
                    }
                    reject([]);
                });
            },
        },
        Util: {
            //Esperando o "Carregando" sumir
            Esperar: async () => {
                return new Promise(resolve => {
                    let thread = setInterval(() => {
                        let progress = $('#ctl00_up').attr('aria-hidden');
                        if (progress) {
                            if (!Object.is(progress, 'false')) {
                                clearInterval(thread);
                                resolve(true);
                            }
                        }
                    }, 1000); //1 segundo
                });
            },

            //Função para clicar nas <a>Âncoras</a>
            CliqueAncora: async (id) => {
                return new Promise(async resolve => {
                    $(`#${id}`)[0].click();
                    await Funcoes.Util.Esperar();
                    resolve();
                });
            },

            //Função para setar o valor do campo e clicar nele se necessário.
            SetValue: async ({ id, valor, tipo }) => {
                return new Promise(async resolve => {
                    $(tipo).each(function () {
                        if (Object.is(this.id, id)) {
                            $(this).val(valor);
                            $(this).attr('onclick', $(this).attr('onchange'));
                            if ($(this).attr('onclick'))
                                $(this).click();
                        }
                    });
                    resolve(await Funcoes.Util.Esperar());
                });
            },

            PreencherCampos: async (tela) => {
                return new Promise(async resolve => {
                    let dados = await Funcoes.LocalStorage.GetDadosMapeamento(tela);
                    //Removendo campos do tipo indexof
                    dados = dados.filter(dado => {
                        if (!Object.is(dado.Campo, "indexof"))
                            return dado;
                    });

                    for (const dado of dados) {
                        const model = {
                            key: dado.Key,
                            value: (Object.is(dado.Campo, 'radio')) ? dado.Value.replace('"', "") : `'${dado.Value}'`,
                            campo: (dado.Campo == "date") ? "input" : dado.Campo,
                            keyNome: (typeof dado.KeyNome != "undefined") ? dado.KeyNome : '',
                            evento: (typeof dado.Evento != "undefined") ? dado.Evento : '',
                            tempo: (typeof dado.Tempo != "undefined") ? parseInt(dado.Tempo) : 0
                        };

                        eval(`Funcoes.Util.SetValue({ id: '${model.key}', valor: ${model.value}, tipo: '${model.campo}' });`);
                        await Funcoes.Util.Esperar();
                    }

                    resolve();
                });
            },
        },
    };

    const AreaTela = {
        Correspondente: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('Correspondente').catch(error => {
                    reject(new Error(`Correspondente: ${error.message}`));
                });
                resolve();
            });
        },
        DocumentoCliente: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('DocumentoCliente').catch(error => {
                    reject(new Error(`DocumentoCliente: ${error.message}`));
                });

                await Funcoes.Util.SetValue({ id: '__EVENTTARGET', valor: 'ctl00$cph$j0$j1$VENDPROM$CAMPO', tipo: 'input' }).catch(error => {
                    reject(new Error(`DocumentoCliente: ${error.message}`));
                });

                resolve();
            });
        },
        Basico: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('Basico').catch(error => {
                    reject(new Error(`Basico: ${error.message}`));
                });

                await Funcoes.Util.CliqueAncora(`ctl00_cph_j0_j_CalcMargem`).catch(error => {
                    reject(new Error(`Basico: ${error.message}`));
                });

                resolve();
            });
        },
        CondicoesFinanciamento: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('CondicoesFinanciamento').catch(error => {
                    reject(new Error(`CondicoesFinanciamento: ${error.message}`));
                });

                resolve();
            });
        },
        DadosSimulacao: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('DadosSimulacao').catch(error => {
                    reject(new Error(`DadosSimulacao: ${error.message}`));
                });

                await Funcoes.Util.CliqueAncora(`ctl00_cph_j0_j_lkCalcular`).catch(error => {
                    reject(new Error(`CondicoesFinanciamento: ${error.message}`));
                });

                resolve();
            });
        },
        DadosCliente: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('DadosCliente').catch(error => {
                    reject(new Error(`DadosCliente: ${error.message}`));
                });

                resolve();
            });
        },
        DadosBancariosLiberacao: async () => {
            return new Promise(async (resolve, reject) => {
                await Funcoes.Util.PreencherCampos('DadosBancariosLiberacao').catch(error => {
                    reject(new Error(`DadosBancariosLiberacao: ${error.message}`));
                });

                await Funcoes.Util.SetValue({ id: 'ctl00_cph_j0_j_UcAloPro1_PPCODORG1_CAMPO', valor: '3333', tipo: 'input' }).catch(error => {
                    reject(new Error(`DadosBancariosLiberacao: ${error.message}`));
                });

                resolve();
            });
        },
    };

    const Telas = {
        /**
         * A página de login é a única página que está no domínio santandernegocios.
         * As outras estão na consignado.santander
         * Por conta disso temos que cadastrar os pedidos de cadastro em filas no domínio santandernegocios, gravando o login do usuário
         * E no domínio consignado.santander buscar os dados do pedido na fila
         */

        //Atributos
        isLogin: Global.url.some(url => url.indexOf("F6_menuVazio.htm") >= 0),
        isMenu: Global.url.some(url => url.indexOf("UI.MENU.aspx") >= 0),
        isPropostaPrimeiraParte: Global.url.some(url => url.indexOf("UI.CD.Proposta.aspx") >= 0),
        isPropostaSegundaParte: Global.url.some(url => url.indexOf('UI.CD.PRPUNF.aspx') >= 0),
        isAnaliseCredito: Global.url.some(url => url.indexOf('UI.CD.AnaliseCredito.aspx') >= 0),
        isPropostaReprovada: Global.url.some(url => url.indexOf('UI.CN.RecusaProp.aspx') >= 0),
        isLogout: Global.url.some(url => url.indexOf('AC.UI.SAN.aspx') >= 0),
        isImpressao: Global.url.some(url => url.indexOf('UI.PR.IMPCTRT.aspx') >= 0),

        propostaCadastro: `https://consignado.santander.com.br/Autorizador45/MenuWeb/Cadastro/Proposta/UI.CD.Proposta.aspx?seqdeci=1`,

        //Métodos
        Login: async () => {
            return new Promise(async (resolve, reject) => {
                $('body').html('<B><CENTER>AUTENTICANDO USUÁRIO...</CENTER></B>');
                //Limpando todos os nomes do localStorage
                await Funcoes.LocalStorage.RemoveAll().catch(error => {
                    reject(new Error(`RemoveAll: ${error.message}`));
                });

                //Criando o model em JSON para fazermos as requisições
                let url = Global.url[Global.url.length - 1];
                await Funcoes.LocalStorage.SetModel(url.substr(url.indexOf('?') + 1)).catch(error => {
                    reject(new Error(`SetModel: ${error.message}`));
                });

                //Buscando os dados do login chamando a api passando a model
                await Funcoes.LocalStorage.SetDadosAcesso();

                //Cadastrando o pedido na fila com o usuário que recuperamos
                await Servicos.CadastrarPedidoFila();

                //Chamada para entrar no sistema do banco
                Funcoes.Auth.Logar().then(url => {
                    resolve(window.open(url, '_self'));
                }).catch(error => {
                    console.log(error);
                    reject(new Error(`Login: ${error.message}`));
                });
            });
        },
        Menu: async () => {
            return new Promise(async (resolve, reject) => {
                //Limpando todos os nomes do localStorage
                await Funcoes.LocalStorage.RemoveAll().catch(error => {
                    reject(new Error(`RemoveAll: ${error.message}`));
                });

                await Funcoes.LocalStorage.SetModel({
                    usuarioId: 0,
                    codigoCliente: Global.codigoCliente,
                    contratoId: 0,
                    clienteId: 0,
                    privlegioId: 0,
                    bancoExtensaoId: Global.bancoExtensaoId
                }).catch(error => {
                    reject(new Error(`SetModel: ${error.message}`));
                });

                //Lendo o login na tela
                Funcoes.LocalStorage.SetItem('login', $(`#ctl00_L_Usuario`).text());

                //Recuperando a model do pedido com o login
                await Servicos.CarregarPedidoFila().then(pedido => {
                    Funcoes.LocalStorage.SetModel(pedido);
                });

                //Buscar e salvar todos os dados
                await Funcoes.LocalStorage.SetDadosMapeamento().catch(error => {
                    reject(new Error(`Menu: ${error.message}`));
                });

                resolve(window.open(Telas.propostaCadastro, "_self"));
            });
        },
        PropostaPrimeiraParte: async () => {
            try {
                if (localStorage.getItem('digitado') == 'true') {
                    window.close();
                } else {
                    await AreaTela.Correspondente();
                    await AreaTela.DocumentoCliente();
                    Funcoes.LocalStorage.SetItem('confirmacao', 0);
                    await Funcoes.Util.CliqueAncora('BBOk_txt').catch(error => {
                        reject(new Error(`DocumentoCliente: ${error.message}`));
                    });
                }
            } catch (error) {
                throw new Error(`PropostaPrimeiraParte: ${error.message}`);
            }
        },
        PropostaSegundaParte: async () => {
            try {
                const divConfirmar = $('#ctl00_cph_divConfirmar').attr('style');

                if (divConfirmar.indexOf('display: none') >= 0) {
                    $('#ctl00_cph_j0_j_ucCli_ucEndRes_CLCEP_CAMPO').attr('onChange', '');
                    await AreaTela.Basico();
                    await AreaTela.CondicoesFinanciamento();
                    await AreaTela.DadosSimulacao();
                    await AreaTela.DadosCliente();
                    await AreaTela.DadosBancariosLiberacao();

                    // await Funcoes.Util.CliqueAncora('BBConf_txt').catch(function (error) {
                    //     reject(new Error(`DadosBancariosLiberacao: ${error.message}`));
                    // });
                } else {
                    if (parseInt(localStorage.getItem('confirmacao')) == 0) {
                        Funcoes.LocalStorage.SetItem('confirmacao', parseInt(localStorage.getItem('confirmacao')) + 1);
                        Funcoes.Util.CliqueAncora('btnConfDivConf_txt');
                    }
                }
            } catch (error) {
                throw new Error(`PropostaSegundaParte: ${error.message}`);
            }
        },
        AnaliseCredito: async () => {
            try {
                const NumeroProposta = $('#ctl00_cph_j0_j1_UcDadosCliente_lblNumeroDaProposta').text();
                await Servicos.SalvarProposta(NumeroProposta);

                // Funcoes.Util.CliqueAncora('BBRep_txt');
                Funcoes.Util.CliqueAncora('BBApr_txt');
            } catch (error) {
                throw new Error(`AnaliseCredito: ${error.message}`);
            }
        },
        PropostaReprovada: async () => {
            try {
                if (!$('#ctl00_cph_j0_j1_cbMotivo_CAMPO').val()) {
                    $('#ctl00_cph_j0_j1_ucObs_NOVAOBS_CAMPO').val('Valor excedido.');
                    Funcoes.Util.SetValue({ id: 'ctl00_cph_j0_j1_cbMotivo_CAMPO', valor: '11', tipo: 'select' });
                } else {
                    Funcoes.LocalStorage.SetItem('digitado', true);
                    Funcoes.Util.CliqueAncora('bbConfirmar_txt');
                }
            } catch (error) {
                throw new Error(`PropostaReprovada: ${error.message}`);
            }
        },
        Impressao: async () => {
            const dados = await axios.post(`https://consignado.santander.com.br/Autorizador45/Esteira/Processos/Web/MPIMPCTRT/${Global.url[Global.url.length - 1]}`, {
                "__EVENTTARGET": "ctl00$cph$j0$j1$BBOk"
            });
            console.log(dados.data);

            if (localStorage.getItem('pdf')) {
                Funcoes.Util.CliqueAncora('BBRep_txt');
                // Funcoes.Util.CliqueAncora('BBOk_txt');
            } else {
                Funcoes.LocalStorage.SetItem('pdf', true);
                await Funcoes.Util.CliqueAncora('BBOk_txt');
            }
        },
    };

    /* Inicio da verificação das telas em ordem de digitação */
    if (Telas.isLogin) {
        (async () => {
            await Telas.Login().catch(error => { Servicos.SalvarErroExtensao(error.message); });
        })();
        return false;
    }

    if (Telas.isMenu) {
        (async () => {
            await Telas.Menu().catch(error => { Servicos.SalvarErroExtensao(error.message); });
        })();
        return false;
    }

    if (Telas.isPropostaPrimeiraParte) {
        (async () => {
            await Telas.PropostaPrimeiraParte().catch(error => { Servicos.SalvarErroExtensao(error); });
        })();
        return false;
    }

    if (Telas.isPropostaSegundaParte) {
        (async () => {
            await Telas.PropostaSegundaParte().catch(error => { Servicos.SalvarErroExtensao(error); });
        })();
        return false;
    }

    if (Telas.isAnaliseCredito) {
        (async () => {
            await Telas.AnaliseCredito().catch(error => { Servicos.SalvarErroExtensao(error); });
        })();
        return false;
    }

    if (Telas.isPropostaReprovada) {
        (async () => {
            await Telas.PropostaReprovada().catch(error => { Servicos.SalvarErroExtensao(error); });
        })();
        return false;
    }

    if (Telas.isImpressao) {
        (async () => {
            await Telas.Impressao().catch(error => { Servicos.SalvarErroExtensao(error); })
        })();
        return false;
    }

    if (Telas.IsLogout) {
        window.close();
        return false;
    }

    return false;
});