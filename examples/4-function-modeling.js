const { List } = require('immutable-ext')

let fn

const toUpper = x => x.toUpperCase()
const exclaim = x => x.concat('!')

// The reader monad
const Fn = run => ({
  run,
  chain: f => Fn(x => f(run(x)).run(x)), // make it a monad
  map: f => Fn(x => f(run(x))), // make it a functor
  concat: other => Fn(x => run(x).concat(other.run(x))),
})

Fn.ask = Fn(x => x)
Fn.of = x => Fn(() => x)

fn = Fn.of('hello') // Fn(() => 'hello'), run = () => 'hello'
  .map(toUpper) // Fn(x => 'HELLO'),  run = x => 'HELLO'
  .map(exclaim) // Fn(x => 'HELLO!'), run = x => 'HELLO!'
  .chain(upper => Fn.ask.map(config => [upper, config])) // Fn(config => ['HELLO!', config]))

console.log(fn.run({ port: 3000 }))
console.log(fn.run({ port: 8080 }))

// The endo functor
const Endo = run => ({
  run,
  concat: other => Endo(x => other.run(run(x))),
})
Endo.empty = () => Endo(x => x)

fn = List([toUpper, exclaim]).foldMap(Endo, Endo.empty())

console.log(fn.run('hello'))
console.log(fn.run('Leo Lin'))

// contramap
const Reducer = run => ({
  run,
  contramap: f => Reducer((acc, x) => run(acc, f(x))),
  concat: other => Reducer((acc, x) => other.run(run(acc, x), x)),
})

const login = (state, payload) =>
  Object.assign({}, state, { isLogin: !!payload.token })

const changePage = (state, payload) =>
  Object.assign({}, state, { nextPage: `${payload.url}/next` })

fn = Reducer(login)
  .contramap(payload => payload.user)
  .concat(Reducer(changePage).contramap(payload => payload.currentPage))

const payload = { user: { token: '123' }, currentPage: { url: '/foo' } }
const state = {}
console.log(fn.run(state, payload))
