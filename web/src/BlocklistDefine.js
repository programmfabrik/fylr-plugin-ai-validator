class BlocklistDefineConfig extends BaseConfigPlugin {
    getFieldDefFromParm(baseConfig, pname, def, parent_def) {
        if (def.plugin_type !== "blocklist-define") {
            return;
        }

        return {
            type: CUI.Input,
            textarea: true,
            name: "own_blocklist",
            attr: {
                style: "max-height: 9em; overflow-y: auto"
            }
        }
    }
}

CUI.ready(() => {
    BaseConfig.registerPlugin(new BlocklistDefineConfig());
});
