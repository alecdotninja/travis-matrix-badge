# Travis Matrix Badge
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/alecdotninja/travis-matrix-badge)

Travis Matrix Badge is an unofficial badge for TravisCI that shows the state of each job for the latest build in a matrix.


## Demo

Here is how it looks for [the TravisCI configuration](https://github.com/alecdotninja/firstlast-pg/blob/master/.travis.yml) in [firstlast-pg](github.com/alecdotninja/firstlast-pg):

[![Build Matrix](https://travis-matrix-badge.alec.ninja/badge-v1.svg?owner=alecdotninja&repo=firstlast-pg&branch=master)](https://travis-ci.org/alecdotninja/firstlast-pg)


## Getting Started

_Note: The examples here use the public instance at `travis-matrix-badge.alec.ninja`, but you can also easily [deploy your own with Netlify](https://app.netlify.com/start/deploy?repository=https://github.com/alecdotninja/travis-matrix-badge)._


For a project at `https://travis-ci.org/OWNER/REPO`, the matrix can be displayed with is markdown:
```markdown
[![Build Matrix](https://travis-matrix-badge.alec.ninja/badge-v1.svg?owner=OWNER&repo=REPO)](https://travis-ci.org/OWNER/REPO)
```

For best results, make sure that you have specified [names for all of the jobs in your build](https://docs.travis-ci.com/user/build-stages/#naming-your-jobs-within-build-stages).

## Options

The table below contains all of the options for `badge-v1.svg`. They are all specified as query paramaters.

|   Option  | Required | Default                                      | Description                                                           |
|:---------:|----------|----------------------------------------------|-----------------------------------------------------------------------|
| `owner`   | Yes      | _none_                                       | The owner of the repo (`OWNER` in `https://travis-ci.org/OWNER/REPO`) |
| `repo`    | Yes      | _none_                                       | The repo (`REPO` in `https://travis-ci.org/OWNER/REPO`)               |
| `branch`  | No       | _default branch for repo_ (usually `master`) | The branch whose latest build status that you would like to display   |
| `columns` | No       | `3`                                          | The number of columns to show in the matrix                           |
| `width`   | No       | `820`                                        | The width (in pixels) of the matrix                                   |


## Development

This project uses [Netlify Functions](https://www.netlify.com/products/functions/).

Dependencies, the local server, and builds are all managed via [NPM](https://www.npmjs.com/get-npm). After checking out the repo, run `npm install` to get setup.

Running `npm run dev` will start a local server at [http://localhost:9000](http://localhost:9000) that can be used for testing.
Each of the files in the [functions directory](functions) is the entry point for a Netlify Function.
In production [rewrite rules](netlify.toml) are used to canonicalize and simplify the URL;
however, in development, the full path is required (e.g. [http://localhost:9000/.netlify/badge-v1](http://localhost:9000/.netlify/badge-v1) for [`functions/badge-v1.js`](functions/badge-v1.js)).

If you would to locally build a copy of the functions suitable for deployment directly to AWS Lambda, you can run `npm run build`. The compiled functions will appear in `.netlify/functions`. For `travis-matrix-badge.alec.ninja`, [this is all handled by Netlify](netlify.toml).

There isn't an automated test suite or any linting at this time (🙈), but [pull requests are welcome](https://github.com/alecdotninja/travis-matrix-badge)!


## Contributing

Bug reports and pull requests are welcome on [GitHub](https://github.com/alecdotninja/travis-matrix-badge).


## License

The code in this repository is available as open source under the terms of the [MIT License](http://opensource.org/licenses/MIT).
