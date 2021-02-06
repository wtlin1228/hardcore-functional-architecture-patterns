const { List } = require('immutable-ext')

const All = x => ({
  x,
  concat: other => All(x && other.x),
})
All.empty = () => All(true)

const res = List([true, true]).foldMap(All, All.empty())

console.log(res)

// foldMap detail implementation
const res2 = [true, true]
  .map(All)
  .reduce((acc, curr) => acc.concat(curr), All.empty())

console.log(res2)
