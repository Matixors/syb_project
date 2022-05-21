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
  if (doc.type === 'product') {
    return `/detail/${doc.slug}`
  }

  if (doc.type === 'offers') {
    return '/offers'
  }

  if (doc.type === 'about') {
    return '/about'
  }

  return '/'
}

app.use(errorHandler())

app.use((req, res, next) => {
  res.locals.Links = handleLinkResolver
  res.locals.PrismicDOM = PrismicDOM
  next()
})

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

const handleRequest = async (api) => {
  const navigation = await api.getSingle('navigation')
  const preloader = await api.getSingle('preloader')
  const meta = await api.getSingle('meta')

  return {
    meta,
    navigation,
    preloader
  }
}

app.get('/', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const home = await api.getSingle('home')

  const { results: items } = await api.query(Prismic.Predicates.at('document.type', 'offer'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/home', {
    ...defaults,
    items,
    home
  })
})

app.get('/about', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const about = await api.getSingle('about')
  res.render('pages/about', {
    ...defaults,
    about
  })
})

app.get('/offers', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const { results: items } = await api.query(Prismic.Predicates.at('document.type', 'offer'), {
    fetchLinks: 'product.image'
  })

  res.render('pages/offers', {
    ...defaults,
    items
  })
})

app.get('/detail/:uid', async (req, res) => {
  const api = await initApi(req)
  const defaults = await handleRequest(api)
  const product = await api.getByUID('product', req.params.uid, {
    fetchLinks: 'offer.title'
  })

  res.render('pages/detail', {
    ...defaults,
    product
  })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
