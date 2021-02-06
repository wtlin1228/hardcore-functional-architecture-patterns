# Introduction

## Goal

- Modular
- Extendable
- Performant
- Maintainable
- Readable
- etc

## Metaphors?

- Know about context and domain
- Mixed metaphors: Processor, Converter, etc
- Evolves/Blurs over time
- Hodge-podge of functionality in each object

## Procedures

- Can I run this twice in a row?
- Which order do I need to run these in?
- Is it changing other parts of the program?
- How does it interact with others?

### To prevent we getting confuse

```js
// associative
add(add(x, y), z) == add(x, add(y, z))

// commutative
add(x, y) == add(y, x)

// identity
add(x, 0) == x

// distributive
add(multiply(x, y), multiply(x, z)) == multiply(x, add(y, z))
```

### Simple example

Break this down and generalize it.

```js
class User {
  constructor(firstName, lastName) {
    this.firstName = firstName
    this.lastName = lastName
  }

  fullName() {
    return this.firstName + ' ' + this.lastName
  }
}

const user = new User('Leo', 'Lin')
user.fullName()
// 'Leo Lin'
```

Step - 1

```js
const user = { firstName: 'Leo', lastName: 'Lin' }
const fullName = (firstName, lastName) => [firstName, lastName].join(' ')

fullName(user.firstName, user.lastName)
// 'Leo Lin'
```

Step - 2

```js
const user = { firstName: 'Leo', lastName: 'Lin' }
const joinWithSpace = (...arg) => args.join(' ')

joinWithSpace(user.firstName, user.lastName)
// 'Leo Lin'

joinWithSpace('a', 'b', 'c') // 'a b c'

joinWithSpace(joinWithSpace('a', 'b'), 'c') // 'a b c'
joinWithSpace('a', joinWithSpace('b', 'c')) // 'a b c'
```

Step - 3

make a interface `joinable`

```js
joinWithSpaces = joinable => joinable.join(' ')

joinWithSpaces([user.firstName, user.lastName])
```

## Highly generalized functions

Highly generalized functions is what we want to have!

### Composition

To compose, normalize effect types throughout the app

pros

- Satisfy use cases
- Simple, understandable pieces
- Reuse

cons

- Harder to change implementation
- Harder for user to compose

on the other hand, if we use a bigger function

pros

- Flexibility in implementation changes
- Less use cases to support

cons

- Flags, if/else
- Won't satisfy all cases
- Less reuse
