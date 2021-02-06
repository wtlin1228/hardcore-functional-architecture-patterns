const { List } = require('immutable-ext')

const Success = x => ({
  isFail: false,
  x,
  fold: (_, g) => g(x),
  concat: other => (other.isFail ? other : Success(x)),
})

const Fail = x => ({
  isFail: true,
  x,
  fold: (f, _) => f(x),
  concat: other => (other.isFail ? Fail(x.concat(other.x)) : Fail(x)),
})

const Validation = run => ({
  run,
  concat: other =>
    Validation((key, x) => run(key, x).concat(other.run(key, x))),
})

const isPresent = Validation((key, x) =>
  !!x ? Success(x) : Fail([`${key} needs to be present`])
)

const isEmail = Validation((key, x) =>
  /@/.test(x) ? Success(x) : Fail([`${key} must be an email`])
)

const validate = (spec, obj) =>
  List(Object.keys(spec)).foldMap(
    key => spec[key].run(key, obj[key]),
    Success(obj)
  )

const validations = {
  name: isPresent,
  email: isPresent.concat(isEmail),
}
const obj = { name: 'leo', email: '' }
const res = validate(validations, obj)

const id = x => x
console.log(res.fold(id, id))

module.exports = { validate }
