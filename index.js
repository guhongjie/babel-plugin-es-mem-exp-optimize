const crypto = require('crypto');
const prefix = '_es_mem_exp_'

module.exports = function ({ types: t }, options) {
  return {
    visitor: {
      Program: {
        exit(path) {
          const md5 = crypto.createHash("md5");
          md5.update(this.filename);
          const filePrefix = prefix + md5.digest('hex')
          const identMap = {}
          let insertValIdx = 0
          for (let i = 0; i < path.node.body.length; i++) {
            if (!t.isImportDeclaration(path.node.body[i])) {
              insertValIdx = i
              break
            }
          }

          const impNameMap = {}
          const impNodes = {}
          path.traverse({
            ImportDeclaration(subPath) {
              const impName = subPath.node.source.value
              if (options[impName] && subPath.node.specifiers) {
                subPath.node.specifiers.forEach(e => {
                  if (t.isImportDefaultSpecifier(e)) {
                    impNameMap[e.local.name] = impName
                    impNodes[impName] = subPath.node
                  }
                });
              }
            }
          })
          path.traverse({
            MemberExpression(subPath) {
              if (!t.isIdentifier(subPath.node.object)) return
              if (!t.isIdentifier(subPath.node.property)) return
              const esName = impNameMap[subPath.node.object.name]
              if (!esName) return
              const esExpressionMap = options[esName]
              const valOpt = esExpressionMap[subPath.node.property.name]
              if (!valOpt) return

              const identKey = filePrefix + '_' + esName + '_' + subPath.node.property.name
              if (!identMap[identKey]) {
                if (valOpt.import) {
                  const impNode = impNodes[esName]
                  impNode.specifiers.push(
                    t.importSpecifier(
                      t.identifier(identKey + '_'),
                      t.identifier(subPath.node.property.name)
                    )
                  )
                  let exp = t.identifier(identKey + '_')
                  if (valOpt.bind) {
                    exp = t.callExpression(
                      t.memberExpression(exp, t.identifier("bind")),
                      [t.identifier(subPath.node.object.name)])
                  }

                  path.node.body.splice(insertValIdx, 0,
                    t.variableDeclaration("const", [
                      t.variableDeclarator(
                        t.identifier(identKey),
                        exp
                      )
                    ]))
                } else {
                  let memExp = t.memberExpression(
                    t.identifier(subPath.node.object.name),
                    t.identifier(subPath.node.property.name)
                  )
                  if (valOpt.bind) {
                    memExp = t.callExpression(
                      t.memberExpression(memExp, t.identifier("bind")),
                      [t.identifier(subPath.node.object.name)])
                  }

                  path.node.body.splice(insertValIdx, 0,
                    t.variableDeclaration("const", [
                      t.variableDeclarator(
                        t.identifier(identKey),
                        memExp
                      )
                    ]))
                }
                identMap[identKey] = true
              }
              subPath.replaceWith(t.identifier(identKey))
            }
          })
        }
      }
    }
  }
}
