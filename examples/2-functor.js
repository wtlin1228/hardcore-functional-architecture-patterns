const { Id, Either } = require('../class/repo/lib/types')
const { Left, Right } = Either
const { List } = require('immutable-ext')

let res

const id = x => x.toString()

// example 1
const Sum = x => ({
  x,
  concat: other => Sum(x + other.x),
  toString: () => `Sum(${x})`,
})
Sum.empty = () => Sum(0)

res = Id.of(Sum(2)).concat(Id.of(Sum(3))) // Id(Sum(5))

console.log(res.extract().toString()) // Sum(5)

// example 2
res = Right('hi').concat(Right('!'))
console.log(res.fold(id, id)) // 'hi!'

res = Right('hi').concat(Left('Arrrrrrqqqggg!!!'))
console.log(res.fold(id, id)) // 'Arrrrrrqqqggg!!!'

// if we want to keep the right value instead of left, define a new monoid
const Alternative = x => ({
  x,
  concat: other => Alternative(other.x.isLeft ? x : x.concat(other.x)),
})

res = Alternative(Right('hi'))
  .concat(Alternative(Right('!!!')))
  .concat(Alternative(Left('Arrrrrrqqqggg!!!')))
console.log(res.x.fold(id, id)) // 'hi!!!

// use foldMap to simplify the code
res = List([Right('a'), Right('b'), Left('c')]).foldMap(
  Alternative,
  Alternative(Right(''))
)
console.log(res.x.fold(id, id)) // 'ab'

res = List([Right('a'), Left('b'), Right('c')]).foldMap(
  Alternative,
  Alternative(Right(''))
)
console.log(res.x.fold(id, id)) // 'ac'

// ------------ my practice ------------
res = List([Right(Sum(1)), Right(Sum(2)), Right(Sum(3))]).foldMap(
  Alternative,
  Alternative(Right(Sum(0)))
)

console.log(res.x.fold(id, id))
