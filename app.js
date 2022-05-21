require('dotenv').config()

console.log(process.env.PRISMIC_ENDPOINT, process.env.PRISMIC_CLIENT_ID)

const express = require('express')
const errorHandler = require('errorhandler')

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

app.use(errorHandler())

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

app.get('/about', async (req, res) => {
  // const meta = await api.getSingle('meta')
  const api = await initApi(req)
  const about = await api.getSingle('about')

  res.render('pages/about', {
    about //, meta
  })
})

app.get('/offers', (req, res) => {
  res.render('pages/offer')
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'offer.title'
  })

  console.log(product)

  res.render('pages/detail', {
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
