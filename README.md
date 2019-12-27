# Travis Matrix Badge

This is an unofficial badge for TravisCI that shows the state of each job for the latest build in a matrix.
A public instance hosted by [Netlify](https://www.netlify.com) is located at [`travis-matrix-badge.alec.ninja`](https://travis-matrix-badge.alec.ninja).


## Demo

Here is how it looks for [the TravisCI configuration](https://github.com/alecdotninja/firstlast-pg/blob/master/.travis.yml) in [firstlast-pg](https://github.com/alecdotninja/firstlast-pg):

[![Build Matrix](https://travis-matrix-badge.alec.ninja/v1/alecdotninja/firstlast-pg/matrix.svg?branch=master)](https://travis-ci.org/alecdotninja/firstlast-pg)


## Getting Started

For a project at `https://travis-ci.org/:owner/:repo`, the matrix can be displayed with is markdown:
```markdown
[![Build Matrix](https://travis-matrix-badge.alec.ninja/v1/:owner/:repo/matrix.svg)](https://travis-ci.org/:owner/:repo)
```

For best results, make sure that you have specified [names for all of the jobs in your build](https://docs.travis-ci.com/user/build-stages/#naming-your-jobs-within-build-stages).

_**Note:** The examples here use the public instance at [`travis-matrix-badge.alec.ninja`](https://travis-matrix-badge.alec.ninja), but you can also easily [deploy your own with Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/alecdotninja/travis-matrix-badge)._


## Options

The matrix can be customized with the following query paramaters.

|   Option  | Default            | Description                                     |
|:---------:|--------------------|-------------------------------------------------|
| `branch`  | _default for repo_ | The branch whose latest build status to display |
| `columns` | `3`                | The number of columns to show in the matrix     |
| `width`   | `820`              | The width (in pixels) of the matrix             |


## Development

This project uses [Netlify Functions](https://www.netlify.com/products/functions/).

Dependencies, a local server for testing, and the build process are all managed via [NPM](https://www.npmjs.com/get-npm).
After checking out the repo, run `npm install` to get setup.

Running `npm run dev` will start a local server at [http://localhost:9000](http://localhost:9000) that can be used for testing.
Each of the files in the [functions directory](functions) is the entry point for a Netlify Function.
In production [rewrite rules](_redirects) are used to canonicalize and simplify the URL;
however, in development, the full path is required (e.g. [http://localhost:9000/.netlify/functions/badge-v1](http://localhost:9000/.netlify/functions/badge-v1) for [`functions/badge-v1.js`](functions/badge-v1.js)).

If you would to locally build a copy of the functions suitable for deployment directly to AWS Lambda, you can run `npm run build`. The compiled functions will appear in `.netlify/functions`. For `travis-matrix-badge.alec.ninja`, [this is all handled by Netlify](netlify.toml).

There isn't an automated test suite or any linting at this time (pull requests welcome!), so just be careful I guess. 🙈


## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/alecdotninja/travis-matrix-badge).


## License

The code in this repository is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
