workflow "Basic workflow" {
  on = "push"
  resolves = ["Run Tests"]
}

action "Run ESLint" {
  uses = "stefanoeb/eslint-action@1.0.0"
}

action "Run Tests" {
  uses = "actions/npm@master"
  args = "test"
  needs = "Run ESLint"
}