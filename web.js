
const express = require('express');
const session = require('express-session');
const http = require('http');
const bcrypt = require('bcryptjs');
const { Order, Admin } = require('./db');
const { init } = require('./realtime');
const app = express();
const server = http.createServer(app);
init(server);
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(session({secret:'secret',resave:false,saveUninitialized:false}));
app.get('/login',(_,res)=>res.render('login'));
app.post('/login',async(req,res)=>{
  const a = await Admin.findOne({username:req.body.username});
  if(!a||!bcrypt.compareSync(req.body.password,a.password)) return res.redirect('/login');
  req.session.admin=a; res.redirect('/');
});
app.get('/',async(req,res)=>{
  if(!req.session.admin) return res.redirect('/login');
  const orders = await Order.find();
  res.render('dashboard',{orders});
});
server.listen(process.env.PORT||3000);
