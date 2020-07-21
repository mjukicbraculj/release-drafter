const log = require('./log')
const regexParser = require('regex-parser')
const regexEscape = require('escape-string-regexp')

/**
 * replaces all uppercase dollar templates with their string representation from obj
 * if replacement is undefined in obj the dollar template string is left untouched
 */

const template = (string, obj, customReplacers) => {
  let str = string.replace(/(\$[A-Z_]+)/g, (_, k) => {
    let result
    if (obj[k] === undefined || obj[k] === null) {
      result = k
    } else if (typeof obj[k] === 'object') {
      result = template(obj[k].template, obj[k])
    } else {
      var replacer = !!customReplacers && customReplacers.find(x => x.property === k)

      console.log(k);
      if (k === '$TITLE') {
        console.log(replacer)
      }

      if (!!replacer) {
        console.log()
        result = `${obj[k]}`.replace(new RegExp(replacer.search), replacer.replace)
      }
      else {
        result = `${obj[k]}`
      }
    }

    console.log(result);

    return result
  })
  
  return str
}

function toRegex(search) {
  if (search.match(/^\/.+\/[gmixXsuUAJ]*$/)) {
    return regexParser(search)
  } else {
    // plain string
    return new RegExp(regexEscape(search), 'g')
  }
}

function validateReplacers({ app, context, replacers }) {
  return replacers
    .map((replacer) => {
      try {
        return { ...replacer, search: toRegex(replacer.search) }
      } catch (e) {
        log({
          app,
          context,
          message: `Bad replacer regex: '${replacer.search}'`,
        })
        return false
      }
    })
    .filter(Boolean)
}

module.exports.template = template
module.exports.validateReplacers = validateReplacers
