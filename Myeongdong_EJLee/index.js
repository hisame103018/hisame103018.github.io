const express = require('express');
// const oracledb = require('orabledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 4240;

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});