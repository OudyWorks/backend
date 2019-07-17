import path from 'path'
import fg from 'fast-glob'

export default function (_ref) {
  const localesRegex = /components\/(.*?)\/(tasks\/(.*?)\/)?i18n\/(.*?)\.js/
  return {
    name: 'i18n',
    visitor: {
      ObjectMethod: {
        enter(_path) {
          if (_path.node.key.name == 'render') {
            const filename = _path.hub.file.opts.filename,
            locales = fg.sync(
                path.join(
                  path.dirname(filename),
                  'i18n/*.{js,json}'
                )
              )
            if (locales.length) {
              // console.log(filename, locales, _path.parent.properties)
              let i18n = _ref.template.ast(`return {
                i18n: {
                  messages: {
                    ${locales.map(
                          file => {
                            const [, component, , task, language] = file.match(localesRegex)
                            return {
                              file, component, task, language
                            }
                          }
                        ).map(
                          ({ file, component, task, language }) =>
                            `'${language}': require('${file}').default`
                        ).join(',\n')}
                  }
                }
              }`).argument.properties[0]
              _path.parent.properties.push(i18n)
            }
          }
        },
        exit(path) {

        }
      },
    }
  }
}