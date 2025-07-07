const esbuild = require('esbuild')

esbuild.build({
    entryPoints: ['functions/src/index.js'],
    bundle: true,
    outfile: 'dist/index.js',
    target: 'es2020',
    platform: 'browser'
}).catch(() => process.exit(1))
