const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');  // path 모듈 추가

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

// 정적 파일 제공을 위해 'public' 디렉토리를 사용합니다.
app.use(express.static(path.join(__dirname, 'public')));

// GET 방식: 정적인 페이지를 요청할 때 사용하는 통신 방식
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// app.post('/public/index.html', (req,res) => {
//     const age = parseInt(req.body.ticketOffice);
//
// })
app.listen(port, () => {
    console.log(`Server is running at http://54.82.4.76:3000${port}`);
});
