// @flow
import folderStructure from './folderStructure'
import defaults from '../defaults'
import type { Options } from '../picturebook.types'

const { resolve } = require('path')

describe('folderStructure', () => {
  let options: $Shape<Options>

  beforeEach(() => {
    options = {
      ...defaults,
      stories: require.context(
        resolve(__dirname, '../../sampleFolder/stories'),
        true,
        /\.(js|md|png|jpg)/
      ),
    }
  })

  it('should add markdown file as documentation when present', () => {
    const out = folderStructure(options)
    const { doc } = out.find(({ title }) => title === 'File4') || {}

    expect(doc).toEqual(jasmine.any(String))
  })

  it('should not define documentation if no related md file exists', () => {
    const out = folderStructure(options)
    const { doc } = out.find(({ title }) => title === 'File1') || {}

    expect(doc).not.toBeDefined()
  })

  it('should group tests based on their extension', () => {
    const out = folderStructure(options)
    const { tests } = out.find(({ title }) => title === 'File4') || {}

    expect(tests['cypress.spec']).toEqual(expect.any(String))
    expect(tests.spec).toEqual(expect.any(String))
  })

  it('should group screenshots based on their extension', () => {
    const out = folderStructure(options)
    const { screenshots } = out.find(({ title }) => title === 'File4') || {}

    expect(screenshots['desktop.chrome']).toEqual(expect.any(String))
    expect(screenshots['mobile.iphone7']).toEqual(expect.any(String))
  })

  it('should specify a url on every item', () => {
    const out = folderStructure(options)

    expect(out.every(({ url }) => !!url)).toBe(true)
  })

  it('should allow modifying the base url', () => {
    const baseUrl = 'http://myStorybooktest.com'
    const out = folderStructure({ ...options, baseUrl })

    expect(out.every(({ url }) => (url || '').startsWith(baseUrl))).toBe(true)
  })
})
