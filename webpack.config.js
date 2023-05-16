module.exports = function (webpackEnv) {
    return {
        resolve: {
            fallback: {
                "tls": false,
                "net": false,
            }
        }
    }
}