// 실행 전 반드시 설치해야 할 것.
// npm i express
// npm i oracledb
// npm i body-parser
// npm i express-session
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
const WEB_SERVER_HOME = 'C:\\EJLee\\Util\\nginx-1.24.0\\html';
// 비대면 PC 경로
// const WEB_SERVER_HOME = 'D:\\EJLEE\\Util\\nginx-1.24.0\\html';
app.use(express.static(WEB_SERVER_HOME + '/'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'open-source',
    password: '1111',
    connectString: '192.168.0.17:1521/xe'
};

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
app.use('/md_deletePost', require('./routes/md_deletePost'));


// 댓글 페이지 렌더링
app.get('/addComment', (req, res) => {
    const postId = req.query.post_id; // postId 가져오기
    const userId = req.query.loggedInUserId;
    const username = req.query.loggedInUserName;
    const userRealName = req.query.loggedInUserRealName;
    res.render('addComment',{postId:postId, userId:userId, username:username, userRealName:userRealName});
});

app.post('/addComment', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const post_id = req.body.post_id;
    const author_id = req.session.loggedInUserId;
    const comment_id = req.body.comment_id; // req.body에서 comment_id를 가져옴
    const { content } = req.body;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 추가
        await conn.execute(
            `insert into comments (id, post_id, author_id, content, parent_comment_id) 
             values (comment_id_seq.nextval, :post_id, :author_id, :content, :parent_id)`, // parend_id를 parent_id로 수정
            [post_id, author_id, content, comment_id]
        );

        await conn.commit();

        res.redirect(`/detailPost/${post_id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// 로그인 페이지 렌더링
app.get('/login', (req, res) => {
    // '/' 경로로의 요청은 Nginx에서 login.html을 처리하도록 리다이렉트
    res.redirect('/login.html');
});

// 로그인 처리
app.post('/login', bodyParser.urlencoded({extended: false}), async (req, res) => {
    const { username, password } = req.body;
    const authenticatedUser = await varifyID(username, password);

    if (authenticatedUser) {
        req.session.loggedIn = true;
        req.session.loggedInUserId = authenticatedUser.id;         // 사용자 테이블의 ID(PK) 저장
        req.session.loggedInUserName = username;                   // 사용자 테이블의 username
        req.session.loggedInUserRealName = authenticatedUser.name; // 사용자 테이블에서 실제 이름 저장
        // res.redirect(`/boardMain?id=${authenticatedUser.id}&username=${authenticatedUser.username}&name=${authenticatedUser.name}`);
        res.redirect(`/boardMain`);
        // res.redirect('welcome', { WEB_SERVER_HOME, username });
    } else {
        res.render('loginFail', { username });
    }
});
app.get('/loginFail', (req, res) => {
    res.render('/loginFail');
});

// 로그아웃 처리
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('세션 삭제 중 오류 발생:', err);
            res.status(500).send('Internal Server Error');
        } else {
            res.redirect('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
        }
    });
});

async function varifyID(username, password) {
    let connection;
    try {
        connection = await oracledb.getConnection(dbConfig);

        const result = await connection.execute(
            'select * from users where username = :username and password = :password',
            { username, password }
        );

        if (result.rows.length > 0) {
            console.log('varifyID');
            console.log(result.rows[0][0]);
            return {
                id: result.rows[0][0],
                username: result.rows[0][1],
                name: result.rows[0][3]
            };
        } else {
            return null;
        }
    } catch (error) {
        console.error('오류 발생:', error);
        return null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}


// 수정 페이지 렌더링
app.get('/md_editPost/:id', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.params.user_id;
    const userName = req.query.username;
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 정보 가져오기
        const result = await conn.execute(
            `select * from posts where id = :id`,
            [postId],
            { fetchInfo: { content: { type: oracledb.STRING }}}
        );

        const post = {
            id: result.rows[0][0],
            title: result.rows[0][2],
            content: result.rows[0][3]
        };

        res.render('editPost', {
            post: post,
            userId: userId,
            userName: userName,
            userRealName: userRealName
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// 수정 처리
app.post('/md_editPost/:id', async (req, res) => {
    const { title, content } = req.body;
    const postId = req.params.id;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글 수정
        await conn.execute(
            `update posts set title = :title, content = :content where id = :id`,
            [title, content, postId]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 수정 후 상세 페이지로 리다이렉트
        res.redirect(`/md_detailPost/${postId}?user=id=${req.session.userId}&username=${req.session.username}&user_realname=${req.session.userRealName}`);
    } catch (err) {
        console.error('게시글 수정 중 오류 발생:', err);
        res.status(500).send('게시글 수정 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

// 댓글 삭제 처리
app.post('/deleteComment/:id', async (req, res) => {
    // 로그인 여부 확인
    if(!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const commentId = req.params.id;
    const postId = req.body.post_id;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 삭제
        await conn.execute(
            `delete from comments where id = :id or parent_comment_id = :parent_commnet_id`,
            { id: commentId, parent_comment_id: commentId }
        );

        // 변경 사항 커밋
        await conn.commit();

        // 삭제 후 상세 페이지로 리다이렉트
        res.redirect(`/md_detailPost/${postId}`);
    } catch (err) {
        console.error('댓글 삭제 중 오류 발생:', err);
        res.status(500).send('댓글 삭제 중 오류가 발생했습니다.');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error('오라클 연결 종료 중 오류 발생:', err);
            }
        }
    }
});

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/md_mainBoard`);
});