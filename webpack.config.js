const path = require('path');

module.exports = {
    entry: {
        index: './src/main/resources/static/lib/index.ts',
        status: './src/main/resources/static/lib/status.ts'
    },
    devtool: 'inline-source-map',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'src/main/resources/static/lib'),
    },
    mode: "development"
};