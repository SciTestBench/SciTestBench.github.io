# SciTestBench

Project website for **SciTestBench: Can AI Agents Find Errors in Scientific Software?**, a paper currently under review.

## About the paper

Scientific software underpins scientific instruments, and its errors can compromise experimental integrity and downstream conclusions. SciTestBench is a benchmark for evaluating AI coding agents on test generation for production scientific software. It has two complementary tasks:

- **Issue reproduction test generation.** Given a GitHub issue and the buggy repository, the agent writes a test-only patch that fails before the fix and passes after it.
- **Sanitizer-guided test generation.** Given a repository instrumented with scientific sanitizers, the agent writes valid tests that trigger as many invariant families as possible.

We evaluate 8 coding agents on 149 issue-reproduction tasks and 400 sanitizers across 6 scientific domains. Tests generated during the study led to 56 upstream issue reports, of which 31 were confirmed and 9 were fixed by maintainers.

## About this website

This repository hosts the companion website for the paper. Its pages cover:

- `index.html`: overview, task design, and main results
- `method.html`: benchmark construction (issue curation, sanitizer curation, workflow)
- `analysis.html`: where agent performance breaks down (harness effects, difficulty, per-repository results)
- `cases.html`: failure mechanisms and ten worked cases
- `impact.html`: from benchmark to upstream issue reports and fixes

Paper, code, and dataset links will be added once available.
