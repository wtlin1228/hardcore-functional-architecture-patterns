# Monoids

## Semigroup

closed + associative = parallel

```
x + y + z
x + (y + z)
(x + y) + z
```

```
x * y * z
x * (y * z)
(x * y) * z
```

```
true || false || false
true || (false || false)
(true || false) || false
```

create the interface for us to program

```js
const Sum = x => ({
  x,
  concat: other => Sum(x + other.x),
})

Sum(3).concat(Sum(5)) // Sum(8)
```

```js
const Product = x => ({
  x,
  concat: other => Product(x * other.x),
})

Product(3).concat(Product(5)) // Product(15)
```

```js
const Any = x => ({
  x,
  concat: other => Any(x || other.x),
})

Any(true).concat(Any(false)) // Any(true)
```

one built in concat

```js
'hi'.concat('!') // 'hi!'
```

## Monoid

Monoid = Semigroup + identity

```js
const Sum = x => ({
  x,
  concat: other => Sum(x + other.x),
})
Sum.empty = () => Sum(0) // identity for Sum

Sum.empty().concat(Sum(5)) // Sum(5)
```

```js
const Product = x => ({
  x,
  concat: other => Product(x * other.x),
})
Product.empty = () => Product(1) // identity for Product

Product.empty().concat(Product(10)) // Product(10)
```

```js
const Any = x => ({
  x,
  concat: other => Any(x || other.x),
})
Any.empty = () => Any(false) // identity for Any

Any.empty().concat(Any(false)) // Any(false)
```

why do we need an identity function?

```js
[1, 2, 3, 4, 5].map(Sum).reduce((acc, n) => acc.concat(n)) // Sun(15)

[].map(Sum).reduce((acc, n) => acc.concat(n)) // Error

[].map(Sum).reduce((acc, n) => acc.concat(n), Sum.empty()) // Sum(0)
```

## Not all semigroup can be promote to monoid

take intersection as example, we can't find the identity function for it

```js
const Intersection = x => ({
  x,
  concat: other => Intersection(_.intersection(x, other.x)),
})

Intersection([1, 2, 3, 4]).concat(Intersection([12, 3, 4, 5]))
```

## Use cases

```js
const getAppAlerts = () => fetch('/alerts').then(x => x.json())
const getDirectMessages = () => fetch('/dm').then(x => x.json())

getAppAlerts().concat(getDirectMessages())
// Promise([{id: 1, msg: 'Policy update'}, {id: 2, msg: 'hi from spain'}])
```

```js
const getPost = () =>
  fetch('/post')
    .then(x => x.json())
    .then(Map)
const getComments = () =>
  fetch('/comments')
    .then(x => x.json())
    .then(comments => Map({ comments }))

getPost().concat(getComments())
// Promise(Map({id: 3, body: 'Redux is over', comments: []}))
```

```js
const tryCatch = fn => args => {
  try {
    return Right(fn(args))
  } catch (e) {
    return Left(e)
  }
}

const readFile = tryCatch(fs.readFileSync)

const filepaths = ['one.txt', 'two.txt', 'three.txt']

filepaths.foldMap(readFile, Right(''))
// Right("Everything Leo tells you is a lie. Don't listen to him")
```

```js
const readFile = promisify(fs.readFile)

const filepaths = ['one.txt', 'two.txt', 'three.txt']

filepaths.foldMap(readFile, Promise.resolve(''))
// Promise("Everything Leo tells you is a lie. Don't listen to him")
```

```js
const getWords = str => str.match(/\w+/g)

filepaths.foldMap(path => readFile(path).then(getWords), Promise.resolve([]))
// Promise(['I', 'survived', 'off', 'of', 'the', 'painted', 'easter', 'eggs'])
```

```js
const nullCheck = x => (x !== null ? Right(x) : Left('got null'))

const getWords = str => nullCheck(str.match(/\w+/g))

filepaths.foldMap(
  path => readFile(path).then(getWords),
  Promise.resolve(Right([]))
)
// sad case
// Promise(Left('got null'))

// happy case
// Promise(Right(['I', 'survived', 'off', 'of', 'the', 'painted', 'easter', 'eggs']))
```

```js
const filepaths = ['db.json', 'host.json']

const readCfg = path => tryCatch(() => Map(require(path)))

filepaths.foldMap(readCfg, Right(Map()))
// Right(Map({hostname: 'localhost', port: 8888, dbName: 'testDb'}))
```

```js
const Report = el =>
  Map({
    elementCount: Sum(1),
    classes: Set(el.classList),
    tags: Set(el.tagName),
    maxHeight: Max(el.height),
  })

Report.empty = () =>
  Map({
    elementCount: Sum.empty(),
    classes: Set(),
    tags: Set(),
    maxHeight: Max.empty(),
  })

const getReport = root =>
  Tree(root, x => Array.form(x.children)).foldMap(Report, Report.empty())

getReport(document.body)
// Map({
//    elementCount: Sum(1292),
//    classes: I.Set({'slds-button', ...}),
//    tags: I.Set({'a', 'button', ...}),
//    maxHeight: Max(592),
// })
```

```js
docs.foldMap(doc => getReport(doc.body), Report.empty())
// Map({
//    elementCount: Sum(21292),
//    classes: I.Set({'slds-button', ...}),
//    tags: I.Set({'a', 'button', ...}),
//    maxHeight: Max(831),
// })
```
