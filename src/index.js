const express = require('express');
const { get } = require('axios');
const bodyParser = require('body-parser');
const session = require('express-session');

const PORT = 4321;
const URL = 'https://kodaktor.ru/j/users';
const app = express();

let items;

const checkAuth = (r, res, next) => {
  if(r.session.auth === 'ok') {
    next();
  } else {
    res.redirect('/login');
  }
};

app
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({extended: true}))
  .use(session({ secret: 'mysecret', resave: true, saveUninitialized: true }))
  .get('/hello/', r => r.res.end('Hello world!'))
  .get('/author/', r => r.res.send('<h4 id="author" title="GossJS">PeterS</h4>'))
  .get('/login', r => r.res.render('login'))
  .get('/logout', r => {
    r.session.auth = 'fail';
    r.res.redirect('/login');
  })
  .post('/login/check/', r => {
    const {body: {login: l}} = r;
    const user = items.find(({login}) => login === l);
    if(user) {
      if(user.password === r.body.pass) {
        r.session.auth = 'ok';
        r.res.send('Good!');
      } else {
        r.res.send('Wrong pass!');
      }
    } else {
      r.res.send('No such user!');
    }
  })
  .get('/users/', checkAuth, async r => r.res.render('list',
    { title: 'Список логинов из kodaktor.ru/j/user', items }))
  .use(r => r.res.status(404).end('Still not here, sorry!'))
  .use((e, r, res, n) => res.status(500).end(`Error: ${e}`))
  .set('view engine', 'pug')
  .listen(process.env.PORT || PORT, async () => {
    console.log(process.pid);

    ({data: {users: items}} = await get(URL));

  });
