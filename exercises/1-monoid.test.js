const { List } = require('immutable-ext')

const Sum = x => ({
  x: x,
  concat: o => Sum(x + o.x),
  toString: () => `Sum(${x})`,
})
Sum.empty = () => Sum(0)

const Product = x => ({
  x: x,
  concat: o => Product(x * o.x),
  toString: () => `Product(${x})`,
})
Product.empty = () => Product(1)

const Any = x => ({
  x: x,
  concat: o => Any(x || o.x),
  toString: () => `Any(${x})`,
})
Any.empty = () => Any(false)

// Ex1: reimplement sum using foldMap and the Sum Monoid
// =========================

var sum = xs => List(xs).reduce((acc, x) => acc + x, 0)

test('Ex1: sum', () => {
  expect(String(sum([1, 2, 3]))).toBe('Sum(6)')
})

// Ex2: reimplement lessThanZero using foldMap and the Any Monoid
// =========================

var anyLessThanZero = xs =>
  List(xs).reduce((acc, x) => (acc < 0 ? true : false), false)

test('Ex2: anyLessThanZero', () => {
  expect(String(anyLessThanZero([-2, 0, 4]))).toBe('Any(true)')
  expect(String(anyLessThanZero([2, 0, 4]))).toBe('Any(false)')
})

// Ex3: Rewrite the reduce with a Max monoid (see Sum/Product/Any templates above)
// =========================

var max = xs => List(xs).reduce((acc, x) => (acc > x ? acc : x), -Infinity)

test('Ex3: max', () => {
  expect(String(max([-2, 0, 4]))).toBe('Max(4)')
  expect(String(max([12, 0, 4]))).toBe('Max(12)')
})

// Ex4 (Bonus): Write concat for Tuple
// =========================

const Tuple = (_1, _2) => ({
  _1,
  _2,
  concat: o => undefined, // write me
})

test('Ex4: tuple', () => {
  const t1 = Tuple(Sum(1), Product(2))
  const t2 = Tuple(Sum(5), Product(2))
  const t3 = t1.concat(t2)
  expect(String(t3._1)).toBe('Sum(6)')
  expect(String(t3._2)).toBe('Product(4)')
})
