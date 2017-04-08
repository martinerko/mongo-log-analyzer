# Mongo(d) log analyzer

This module was born to give you some statistics about your database.
As stated in the name, it works for mongo logs only.
It can be used to analyze mongod log file to find long running queries,
histogram statistics and even gives you an more details by showing you a sample of longest running query.

## Usage

This can be used as a node module
(see [samples](https://github.com/martinerko/mongo-log-analyzer/tree/master/samples) folder)
and also as a command-line utility.

This utility is provided with help that will tell you everything that you need:

```sh
node bin/  --help
```

The standard usage is as below:

To display a basic statistics about queries simply use --queries argument:

```sh
node bin/ test/data/mongod.log  --queries . > queries.csv
```

To display an additional histogram distribution info add --histogram argument:

```sh
node bin/ test/data/mongod.log  --queries --histogram > queries.csv
```

To display also a sample of longest running query for each query record type add --sample argument:

```sh
node bin/ test/data/mongod.log  --queries --sample > queries.csv
```
This can be used together with histogram as well.

### Working with big files
For very big files you might need to run your node with `--max_old_space_size=` argument.

## Disclaimer

This tool was created by me during my free time and any usage is at your own risk.

## License
(The MIT License)

Copyright (c) 2016 martinerko

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
