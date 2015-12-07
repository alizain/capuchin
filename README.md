# Capuchin Task Pipeline Orchestration

- Generator based
- Supports series, and parallel chaining/execution
- Supports async actions
- Tree-based pipeline semantics/construction
- Keep running (which, by definition, means watching)

### Motivation

There is not 1 problem, but actually 3 orthogonal problems

**reading/writing files**
All this needs is a wrapper around the native `fs` module to abstract the actual work of reading/writing whilst only exposing the actual content to be transformed

**declaratively define dependencies in multiple places**
Some dependencies are declared in JS, others in CSS, and others still in HTML. As all of these languages and environments evolve, it will be important to be respectful of the way they manage dependencies.

**declaratively orchestrate pipelines of transformations**
The actual process of building a website is really unique for every company and probably involves a bunch of steps that flow to each other. The key here is to think of it all as a pipeline and not as tasks. This includes efficiently bundling output for the browser.


### Interface

```javascript
{
  root : '/',
  dir : '/home/user/dir',
  base : 'file.txt',
  ext : '.txt',
  name : 'file',
  mime: 'text/plain',
  source: {},
  content: '',
  onDisk: false
}
```
