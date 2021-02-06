const Fn = run => ({
  run,
  chain: f => Fn(x => f(run(x)).run(x)),
  map: f => Fn(x => f(run(x))),
  concat: other => Fn(x => run(x).concat(other.run(x))),
})

const Endo = run => ({
  run,
  concat: other => Endo(x => other.run(run(x))),
})

const Reducer = run => ({
  run,
  contramap: f => Reducer((acc, x) => run(acc, f(x))),
  concat: other => Reducer((acc, x) => other.run(run(acc, x), x)),
})

const state = { loggedIn: false, perf: {} }
const payload = { email: 'admin', password: '123', perf: { bgColor: '#000' } }

// ------------------------------------------------------------------------------

const checkCred = (email, password) => email === 'admin' && password === '123'

const login = (state, payload) =>
  payload.email
    ? Object.assign({}, state, {
        loggedIn: checkCred(payload.email, payload.password),
      })
    : state

const setPerf = (state, payload) =>
  payload.perf ? Object.assign({}, state, { perf: payload.perf }) : state

const reducer = Reducer(login).concat(Reducer(setPerf))

console.log(reducer.run(state, payload))

// ------------------------------------------------------------------------------

// (acc, a) -> acc
// (a, acc) -> acc
// a -> acc -> acc
// a -> Endo(acc -> acc)

// Fn(a -> Endo(acc -> acc))

const login2 = payload => state =>
  payload.email
    ? Object.assign({}, state, {
        loggedIn: checkCred(payload.email, payload.password),
      })
    : state

const setPerf2 = payload => state =>
  payload.perf ? Object.assign({}, state, { perf: payload.perf }) : state

const reducer2 = Fn(login2).map(Endo).concat(Fn(setPerf2).map(Endo))

console.log(reducer2.run(payload).run(state))
