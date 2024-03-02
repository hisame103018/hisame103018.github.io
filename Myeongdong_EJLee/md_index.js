// 실행 전 반드시 설치해야 할 것.
// npm i express
// npm i oracledb
// npm i body-parser
// npm i express-session
// npm i multer
// npm i fs
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs= require('fs');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, 'temp'), encoding: 'utf8' });

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'C:\\EJLee\\Util\\nginx-1.24.0\\html';
// const WEB_SERVER_HOME = 'D:\\EJLEE\\Util\\nginx-1.24.0\\html'; // 비대면 PC 경로
const UPLOAD_FOLDER = path.join('C:\\EJLee\\Util\\nginx-1.24.0\\html\\uploads', 'uploads');
// const UPLOAD_FOLDER = path.join('D:\\EJLEE\\Util\\nginx-1.24.0\\html\\uploads', 'uploads'); // 비대면 전용 로드
app.use(express.static(WEB_SERVER_HOME + '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
// const dbConfig = {
//     user: 'open-source',
//     password: '1111',
//     connectString: '192.168.0.17:1521/xe'
// };
const dbConfig = {
    user: 'open_source',
    password: '1111',
    connectString: 'localhost:1521/xe'
}

app.set('view engine', 'ejs');
oracledb.initOracleClient({libDir: 'C:\\instantclient_21_13'});
// oracledb.initOracleClient({libDir: 'D:\\instantclient_21_13'}); // 비대면 전용 oracle 루트입니다

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true
}));

app.use('/md_mainBoard', require('./routes/md_mainBoard'));
app.use('/md_create', require('./routes/md_create'));
app.use('/md_detailPost', require('./routes/md_detailPost'));
app.use('/md_editPost', require('./routes/md_editPost'));
app.use('/md_deletePost', require('./routes/md_deletePost'));
app.use('/md_addComment', require('./routes/md_addComment'));
app.use('/md_deleteComment', require('./routes/md_deleteComment'));
app.use('/login', require('./routes/login'));
app.use('/loginFail', require('./routes/loginFail'));
app.use('/logout', require('./routes/logout'));

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/md_mainBoard`);
});