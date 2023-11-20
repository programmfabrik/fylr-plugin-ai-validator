const AIValidatorAPI = {
    getPresetBlocklist: () => {
        return AIValidatorAPI.query('POST', '/get-preset-blocklist', {})
    },

    evaluate: (text) => {
        return AIValidatorAPI.query('POST', '/evaluate', {text})
    },

    query: (method, path, body) => {
        return new Promise((resolve, reject) => {
            const baseUrl = ez5.pluginManager.getPlugin("aivalidator").getBareBaseURL().replace('/plugin/static', '/plugin/extension').slice(0, -1)
            fetch(baseUrl + path, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'X-Fylr-Authorization': 'Bearer ' + ez5.session.token
                },
                body: JSON.stringify(body)
            })
            .then((response) => {
                if ((response.headers.get('content-type') ?? '').startsWith('application/json')) {
                    return response.json()
                } else {
                    return response.text()
                }
            })
            .then(resolve)
            .catch(reject)
        })
    }
}
