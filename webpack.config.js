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
            {
                test: /\.(woff|woff2)$/,
                use: 'url-loader',
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'src/main/resources/static/lib'),
        library: 'pidgc'
    },
    mode: "development"
};