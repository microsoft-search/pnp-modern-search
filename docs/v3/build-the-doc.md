# Building the Documentation

Building the documentation locally can help you visualize change you are making to the docs. What you see locally should be what you see online.

## Building
Documentation is built using MkDocs. You will need to latest version of Python (tested on version 3.7.1) and pip. If you're on the Windows operating system, make sure you have added Python to your [Path environment variable](https://docs.python.org/3/using/windows.html).

When executing the pip module on Windows you can prefix it with **python -m**. 
For example: 

`python -m pip install mkdocs-material`

The repository includes a pinned set of documentation dependencies in `requirements-docs.txt`. Using these versions avoids compatibility issues between MkDocs 1.2.2 and newer Jinja2 releases.

- [Install MkDocs](https://www.mkdocs.org/#installation)
    - `python -m pip install -r requirements-docs.txt`
- Serve it up
    - `python -m mkdocs serve`
    - Open a browser to http://127.0.0.1:8000/
- Deploy
    - `python -m mkdocs gh-deploy` from main branch