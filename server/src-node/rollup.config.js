import * as path from 'path'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
import {nodeResolve} from '@rollup/plugin-node-resolve'




export default {
	input: './index.js',
	output: {
		format: 'cjs',
		// dir: path.resolve(__dirname, '.'),
		file: 'bundle.js',
	},
	plugins: [commonjs(), json(), nodeResolve()],
}