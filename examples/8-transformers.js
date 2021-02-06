const { TaskT, Task, Either } = require('./lib/types')
const { Left, Right } = Either
const _ = require('lodash')

const TaskEither = TaskT(Either)

const users = [
  { id: 1, name: 'Leo' },
  { id: 2, name: 'Una' },
  { id: 3, name: 'Leona' },
]
const following = [
  { user_id: 1, follow_id: 3 },
  { user_id: 1, follow_id: 2 },
  { user_id: 2, follow_id: 1 },
]

// TaskEither.of(Either) -> Task(Either(Either))
// TaskEither.lift(Either) -> Task(Either)
const find = (table, query) =>
  TaskEither.lift(Either.fromNullable(_.find(table, query)))

const app = () =>
  find(users, { id: 1 }) // Task(Either(User))
    .chain(u => find(following, { follow_id: u.id })) // Task(Either(User))
    .chain(fo => find(users, { id: fo.user_id })) // Task(Either(User))
    .fork(console.error, eu => eu.fold(console.error, console.log))

app()
