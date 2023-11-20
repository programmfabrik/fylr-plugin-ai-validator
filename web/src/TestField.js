class AIValidatorTestFieldConfig extends BaseConfigPlugin {
    queryApi(path, body) {
        const baseUrl = ez5.pluginManager.getPlugin("ai-validator").getBareBaseURL().replace('/plugin/static', '/plugin/extension').slice(0, -1)
        return new CUI.XHR({
            method: "POST",
            url: baseUrl+"/test",
            headers: {
                'X-Fylr-Authorization': 'Bearer ' + ez5.session.token,
            },
            body: body,
        })
    }


    getFieldDefFromParm(baseConfig, pname, def, parent_def) {
        if (def.plugin_type !== "testfield") {
            return;
        }

        const TEXTFIELD_NAME = 'test-text'

        return {
            type: CUI.Form,
            name: "kjansdajnsd",  // don't ask, don't rename
            fields: [{
                type: CUI.DataFieldProxy,
                element: (dataField) =>
                    new CUI.Label({
                        multiline: true,
                        text: $$("server.config.parameter.system.aivalidator-testing.testfield.caption"),
                        markdown: true
                    })
            }, {
                type: CUI.Input,
                textarea: true,
                name: TEXTFIELD_NAME,
            }, {
                type: CUI.DataFieldProxy,
                element: (dataField) =>
                    new CUI.Button({
                        text: $$("server.config.parameter.system.aivalidator-testing.testfield.button.label"),
                        onClick: () => this.exec({dataField}, dataField.getForm().getData()[TEXTFIELD_NAME])
                    }),
            }, {
                type: CUI.DataFieldProxy,
                element: (dataField) =>
                    new CUI.Label({
                        text: " ",  // can not be empty, otherwise no span element is created
                        multiline: true,
                        class: "aivalidator-evaluation",
                    })
            }]
        }
    }


    exec(context, text) {
        this.setResultText(context, $$("server.config.parameter.system.aivalidator-testing.testfield.loading"))
        AIValidatorAPI.evaluate(text).then((result) => {
            const {text, evaluations} = result

            let textParts = []

            const headlines = {
                markings: $$("server.config.parameter.system.aivalidator-testing.testfield.markings"),
                spelling: $$("server.config.parameter.system.aivalidator-testing.testfield.spelling"),
                sentiment: $$("server.config.parameter.system.aivalidator-testing.testfield.sentiment"),
                german: $$("server.config.parameter.system.aivalidator-testing.testfield.german"),
                chatgpt: $$("server.config.parameter.system.aivalidator-testing.testfield.chatgpt"),
                predefinedBlocklist: $$("server.config.parameter.system.aivalidator-testing.testfield.predefinedBlocklist"),
                customBlocklist: $$("server.config.parameter.system.aivalidator-testing.testfield.customBlocklist"),
            }

            if (result.error) {
                this.setResultText(context, $$("server.config.parameter.system.aivalidator-testing.testfield.error")+': '+result.error)
            }
            else {
                textParts.push($$("server.config.parameter.system.aivalidator-testing.testfield.result")+": "+(result.failed? $$("server.config.parameter.system.aivalidator-testing.testfield.result-bad") : $$("server.config.parameter.system.aivalidator-testing.testfield.result-okay"))+"\n")

                for (const key in headlines) {
                    const {rating, details, threshold, error} = evaluations[key]
                    let text = ''
                    text += headlines[key]+': '
                    if (error) {
                        text += $$("server.config.parameter.system.aivalidator-testing.testfield.error")+': '+error
                    }
                    else if (typeof rating === 'boolean') {
                        text += rating? $$("server.config.parameter.system.aivalidator-testing.testfield.okay") : $$("server.config.parameter.system.aivalidator-testing.testfield.not-okay")
                    } else {
                        text += Math.round(rating*100)+'% '+$$("server.config.parameter.system.aivalidator-testing.testfield.problematic")+' '+Math.round(threshold*100)+'%'
                    }
                    text += '\n'
                    if ( ! error) {
                        for (const descrKey in details) {
                            text += '...' + $$("server.config.parameter.system.aivalidator-testing.testfield."+key+"."+descrKey) + ': ' + this.stringifyValue(details[descrKey]) + '\n'
                        }
                    }
                    textParts.push(text)
                }

                this.setResultText(context, textParts.join('\n'))
            }
        })
    }


    setResultText(context, text) {
        const {dataField} = context
        const evalField = dataField.getForm().DOM.querySelector('.aivalidator-evaluation span')
        evalField.style['white-space-collapse'] = 'preserve'
        evalField.innerText = text
    }


    stringifyValue(value) {
        if (value===null || value===undefined || value==='' || (Array.isArray(value) && value.length===0)) {
            return '-'
        }
        if (value===true || value===false) {
            return value? $$("server.config.parameter.system.aivalidator-testing.testfield.yes") : $$("server.config.parameter.system.aivalidator-testing.testfield.no")
        }
        if (Array.isArray(value)) {
            return value.join(', ')
        }
        return '' + value
    }
}




CUI.ready(() => {
    BaseConfig.registerPlugin(new AIValidatorTestFieldConfig())
})
