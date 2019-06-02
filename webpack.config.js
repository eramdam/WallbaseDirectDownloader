const CopyPlugin = require('copy-webpack-plugin');


module.exports = {
	entry: './source/content.js',
	output: {
		filename: 'content.js'
	},
	mode: 'development',
	plugins: [
    new CopyPlugin([
      {
				from: '*.{png,json,eot,svg,ttf,woff,css}',
				context: './source'
			}
    ]),
  ],
};
