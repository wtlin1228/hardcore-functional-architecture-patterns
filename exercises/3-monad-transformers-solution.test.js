// setup

const Fn = g => ({
  map: f => Fn(x => f(g(x))),
  chain: f => Fn(x => f(g(x)).run(x)),
  run: g,
})
Fn.ask = Fn(x => x)
Fn.of = x => Fn(() => x)

const FnT = M => {
  const Fn = g => ({
    map: f => Fn(x => g(x).map(f)),
    chain: f => Fn(x => g(x).chain(y => f(y).run(x))),
    run: g,
  })
  Fn.ask = Fn(x => M.of(x))
  Fn.of = x => Fn(() => M.of(x))
  Fn.lift = x => Fn(() => x)
  return Fn
}

const Either = (() => {
  const Right = x => ({
    chain: f => f(x),
    ap: other => other.map(x),
    alt: other => Right(x),
    extend: f => f(Right(x)),
    concat: other =>
      other.fold(
        x => other,
        y => Right(x.concat(y))
      ),
    traverse: (of, f) => f(x).map(Right),
    map: f => Right(f(x)),
    fold: (_, g) => g(x),
    toString: () => `Right(${x})`,
  })

  const Left = x => ({
    chain: _ => Left(x),
    ap: _ => Left(x),
    extend: _ => Left(x),
    alt: other => other,
    concat: _ => Left(x),
    traverse: (of, _) => of(Left(x)),
    map: _ => Left(x),
    fold: (f, _) => f(x),
    toString: () => `Left(${x})`,
  })

  const of = Right
  const tryCatch = f => {
    try {
      return Right(f())
    } catch (e) {
      return Left(e)
    }
  }

  const fromNullable = x => (x != null ? Right(x) : Left(x))

  return { Right, Left, of, tryCatch, fromNullable }
})()

const EitherT = M => {
  const Right = mx => ({
    extract: () => mx,
    chain: f => Right(mx.chain(x => f(x).extract())),
    map: f => Right(mx.map(f)),
    fold: (_, g) => g(mx),
  })

  const Left = mx => ({
    chain: _ => Left(mx),
    map: _ => Left(mx),
    fold: (h, _) => h(mx),
  })

  const of = x => Right(M.of(x))
  const tryCatch = f => {
    try {
      return Right(M.of(f()))
    } catch (e) {
      return Left(e)
    }
  }

  const lift = Right

  return { of, tryCatch, lift, Right, Left }
}

const Task = fork => ({
  fork,
  map: f => Task((rej, res) => fork(rej, x => res(f(x)))),
  chain: f => Task((rej, res) => fork(rej, x => f(x).fork(rej, res))),
})
Task.of = x => Task((rej, res) => res(x))
Task.rejected = x => Task((rej, res) => rej(x))

const TaskT = M => {
  const Task = fork => ({
    fork,
    map: f => Task((rej, res) => fork(rej, mx => res(mx.map(f)))),
    chain: f =>
      Task((rej, res) => fork(rej, mx => mx.chain(x => f(x).fork(rej, res)))),
  })
  Task.lift = x => Task((rej, res) => res(x))
  Task.of = x => Task((rej, res) => res(M.of(x)))
  Task.rejected = x => Task((rej, res) => rej(x))

  return Task
}

// Ex1:
// =========================
const FnEither = FnT(Either)
const { Right, Left } = Either

// TODO: Use FnEither.ask to get the cfg and return the port
const ex1 = () => FnEither.ask.map(config => config.port)

test('Ex1', () => {
  const result = ex1(1)
    .run({ port: 8080 })
    .fold(
      x => x,
      x => x
    )
  expect(8080).toBe(result)
})

// Ex1a:
// =========================
const fakeDb = xs => ({ find: id => Either.fromNullable(xs[id]) })

const connectDb = port =>
  port === 8080
    ? Right(fakeDb(['red', 'green', 'blue']))
    : Left('failed to connect')

// TODO: Use ex1 to get the port, connect to the db, and find the id
const ex1a = id =>
  ex1()
    .chain(port => FnEither.lift(connectDb(port)))
    .chain(db => FnEither.lift(db.find(id)))

test('Ex1a', () => {
  expect(
    ex1a(1)
      .run({ port: 8080 })
      .fold(
        x => x,
        x => x
      )
  ).toBe('green')

  expect(
    ex1a(1)
      .run({ port: 8081 })
      .fold(
        x => x,
        x => x
      )
  ).toBe('failed to connect')
})

// Ex2:
// =========================
const posts = [
  { id: 1, title: 'Get some Fp' },
  { id: 2, title: 'Learn to architect it' },
  { id: 3 },
]

const postUrl = (server, id) => [server, id].join('/')

const fetch = url =>
  url.match(/serverA/gi)
    ? Task.of({ data: JSON.stringify(posts) })
    : Task.rejected(`Unknown server ${url}`)

const ReaderTask = FnT(Task)

// Use ReaderTask.ask to get the server for the postUrl
const ex2 = id =>
  ReaderTask.ask
    .chain(server => ReaderTask.lift(fetch(postUrl(server, id))))
    .map(x => x.data)
    .map(JSON.parse) // <--- get the server variable from ReaderTask

test('Ex2', () => {
  ex2(30)
    .run('http://serverA.com')
    .fork(
      e => console.error(e),
      posts => expect('Get some Fp').toBe(posts[0].title)
    )
})

// Ex3:
// =========================
const TaskEither = TaskT(Either)

const Api1 = {
  getFavoriteId: user_id =>
    Task((rej, res) => res(user_id === 1 ? Right(2) : Left(null))),
  getPost: post_id =>
    Task((rej, res) => res(Either.fromNullable(posts[post_id - 1]))),
}

const Api2 = {
  getFavoriteId: user_id =>
    TaskEither((rej, res) => res(user_id === 1 ? Right(2) : Left(null))),
  getPost: post_id =>
    TaskEither((rej, res) => res(Either.fromNullable(posts[post_id - 1]))),
}

// TODO: Rewrite ex3 using Api2
const ex3 = user_id =>
  Api2.getFavoriteId(user_id)
    .chain(post_id => Api2.getPost(post_id))
    .map(post => post.title)

test('Ex3', () => {
  ex3(1).fork(
    e => console.error(e),
    ename =>
      ename.fold(
        error => expect('fail').toBe(error),
        name => expect('Learn to architect it').toBe(name)
      )
  )
})

// Bonus: write IdT
// =========================
