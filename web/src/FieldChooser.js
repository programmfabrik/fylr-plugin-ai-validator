
// Here is also a plugin that uses object and field selection: https://github.com/programmfabrik/easydb-custom-data-type-gazetteer/blob/2d12b38c43dd8920781dbf3643eb685dc5b97e53/src/webfrontend/CustomBaseConfigGazetteer.coffee#L44




class FieldChooserConfig extends BaseConfigPlugin {
    getFieldDefFromParm(baseConfig, pname, def, parent_def) {
        if (def.plugin_type !== "field-chooser") {
            return;
        }

        const allTags = []
        for (const tg of ez5.tagForm.data) {
            for (const t of tg._tags) {
                allTags.push({
                    text: tg.taggroup.displayname['de-DE'] + ': ' + t.tag.displayname['de-DE'],
                    value: tg.taggroup._id + '_' + t.tag._id,
                })
            }
        }

        const tagSelectOptions = [{
            text: $$("server.config.parameter.system.aivalidator-base.tag_chooser.placeholder"),
            value: null,
        }]
        for (const tagGroup of ez5.tagForm.tagGroups) {
            tagSelectOptions.push({
                label: tagGroup.getDisplayName(),
            })
            for (const tag of tagGroup.getTags()) {
                tagSelectOptions.push({
                    text: tag.getDisplayName(),
                    value: parseInt(tag.getId()),
                })
            }
        }

        return {
            type: CUI.Form,
            name: "fields_chooser",
            fields: [{
                type: CUI.DataTable,
                name: "data_table",
                fields: [{
                    form: {
                        label: $$("server.config.parameter.system.aivalidator-base.field-chooser.model.label")
                    },
                    type: CUI.Select,
                    name: "model",
                    options: [{
                        text: '',
                        value: '', 
                    }, ...ez5.schema.CURRENT.tables.map((table) => ({
                        text: table.name,
                        value: table.table_id,
                    }))],
                    onDataChanged: (data, field) => {
                        // Reset field option to empty
                        field.getForm().getFieldsByName("field")[0].setValue('').displayValue()
                    }
                }, {
                    form: {
                        label: $$("server.config.parameter.system.aivalidator-base.field-chooser.field.label")
                    },
                    type: CUI.Select,
                    name: "field",
                    options: (select, event) => {
                        const EMPTY_OPTION = {
                            text: '',
                            value: '',
                        }
                        const tableId = select.getForm().getFieldsByName("model")[0].getValue()
                        for (const model of ez5.schema.CURRENT.tables) {
                           if (model.table_id === tableId) {
                                return [EMPTY_OPTION, ...model.columns.map((column) => ({
                                    text: column.name,
                                    value: column.column_id,
                                }))]
                            }
                        }
                        return [EMPTY_OPTION]
                    }
                }, {
                    form: {
                        label: $$("server.config.parameter.system.aivalidator-base.tag_choose1.label")
                    },
                    type: CUI.Select,
                    name: "trigger-tag",
                    options: tagSelectOptions,
                }, {
                    form: {
                        label: $$("server.config.parameter.system.aivalidator-base.tag_choose2.label")
                    },
                    type: CUI.Select,
                    name: "marking-tag",
                    options: tagSelectOptions,
                }]
            }]
        }
    }
}




CUI.ready(() => {
    BaseConfig.registerPlugin(new FieldChooserConfig());
});
