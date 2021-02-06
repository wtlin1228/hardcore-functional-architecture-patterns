// Definitions
const Endo = run => ({
  run,
  concat: other => Endo(x => other.run(run(x))),
})

Endo.empty = () => Endo(x => x)

// Ex1:
// =========================

const classToClassName = html => html.replace(/class\=/gi, 'className=')

const updateStyleTag = html => html.replace(/style="(.*)"/gi, 'style={{$1}}')

const htmlFor = html => html.replace(/for=/gi, 'htmlFor=')

const ex1 = html => htmlFor(updateStyleTag(classToClassName(html))) //rewrite using Endo

test('Ex1', () => {
  const template = `
		<div class="awesome" style="border: 1px solid red">
			<label for="name">Enter your name: </label>
			<input type="text" id="name" />
		</div>
	`
  const expected = `
		<div className="awesome" style={{border: 1px solid red}}>
			<label htmlFor="name">Enter your name: </label>
			<input type="text" id="name" />
		</div>
	`

  expect(expected).toBe(ex1(template))
})

// Ex2: model a predicate function :: a -> Bool and give it contramap() and concat(). i.e. make the test work
// =========================
const Pred = undefined // todo

test('Ex2: pred', () => {
  const p = Pred(x => x > 4)
    .contramap(x => x.length)
    .concat(Pred(x => x.startsWith('s')))
  const result = ['scary', 'sally', 'sipped', 'the', 'soup'].filter(p.run)
  expect(result).toStrictEqual(['scary', 'sally', 'sipped'])
})

// Ex3:
// =========================
const extension = file => file.name.split('.')[1]

const matchesAny = regex => str => str.match(new RegExp(regex, 'ig'))

const matchesAnyP = pattern => Pred(matchesAny(pattern)) // Pred(str => Bool)

// TODO: rewrite using matchesAnyP. Take advantage of contramap and concat
const ex3 = file =>
  matchesAny('txt|md')(extension(file)) &&
  matchesAny('functional')(file.contents)

test('Ex3', () => {
  const files = [
    { name: 'blah.dll', contents: '2|38lx8d7ap1,3rjasd8uwenDzvlxcvkc' },
    {
      name: 'intro.txt',
      contents: 'Welcome to the functional programming class',
    },
    { name: 'lesson.md', contents: 'We will learn about monoids!' },
    {
      name: 'outro.txt',
      contents:
        'Functional programming is a passing fad which you can safely ignore',
    },
  ]

  expect([files[1], files[3]]).toStrictEqual(files.filter(ex3))
})
