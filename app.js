require('dotenv').config()

console.log(process.env.PRISMIC_ENDPOINT, process.env.PRISMIC_CLIENT_ID)

const express = require('express')
const app = express()
const path = require('path')
const port = 3000

const Prismic = require('@prismicio/client')
const PrismicDOM = require('prismic-dom')

const initApi = req => {
  return Prismic.getApi(process.env.PRISMIC_ENDPOINT, {
    accessToken: process.env.PRISMIC_ACCESS_TOKEN,
    req
  })
}

const handleLinkResolver = (doc) => {
  // if (doc.type === 'page') {
  //   return '/page/' + doc.uid
  // } else if (doc.type === 'blog_post') {
  //   return '/blog/' + doc.uid
  // }

  return '/'
}

app.use((req, res, next) => {
  res.locals.ctx = {
    endpoint: process.env.PRISMIC_ENDPOINT,
    linkResolver: handleLinkResolver
  }
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

app.get('/', (req, res) => {
  res.render('pages/home')
})

app.get('/about', (req, res) => {
  initApi(req).then(api => {
    api.query([
      // Prismic.Predicates.any('document.type', ['meta', 'about'])
      Prismic.Predicates.at('document.type', 'about')

    ]).then(response => {
      console.log(response)
      const { results } = response
      const [about/* ,meta */] = results
      console.log(about/*, meta */)

      console.log(about.data.body)

      about.data.gallery.forEach(media => {
        console.log(media)
      })

      res.render('pages/about', {
        about //, meta
      })
    })
  })
})

app.get('/offers', (req, res) => {
  res.render('pages/offer')
})

app.get('/detail/:uid', (req, res) => {
  res.render('pages/detail')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
