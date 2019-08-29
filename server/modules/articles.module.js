const fs = require('fs')
const path = require('path')
const markdown = require('markdown').markdown
const _ = require('lodash')

const Module = require('@ignitial/iio-app-server').Module

class Articles extends Module {
  constructor(options) {
    super(options)

    // static articles
    this._articles = []

    let articlesFolder = path.join(this.$app._cwd, 'data/articles')

    fs.readdir(articlesFolder, (err, result) => {
      if (!err) {
        for (let f of result) {
          let thePath = path.join(articlesFolder, f, 'index.md')
          let content = fs.readFileSync(thePath, 'utf8')
          let lines = content.split('\n')
          let comment = 0
          let params = {}
          let markdownContent = []

          for (let line of lines) {
            if (line.substring(0, 3) === '---') {
              comment++

              if (comment === 2) continue
            } else {
              if (comment < 2) {
                let param = line.split(':')
                params[param[0]] = param[1].trimLeft()
              }
            }

            if (comment === 2) {
              markdownContent.push(line)
            }
          }

          this._articles.push({
            name: f,
            params: params,
            content: markdown.toHTML(markdownContent.join('\n'))
          })
        }
      } else {
        console.error({ err: err }, 'fail to read articles')
      }
    })
  }

  /* */
  get() {
    return new Promise( (resolve, reject) => {
      resolve({ articles: this._articles })
    })
  }
}

module.exports = Articles
