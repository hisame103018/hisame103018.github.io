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
// const WEB_SERVER_HOME = 'C:\\EJLee\\Util\\nginx-1.24.0\\html';
app.use('/', express.static(WEB_SERVER_HOME + '/'));
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
    connectString: 'localhost:1521/xe'
};

app.set('view engine', 'ejs');
oracledb.initOracleClient({libDir: 'C:\\instantclient_21_13'});

// express-session 미들웨어 설정
app.use(session({
    secret: 'mySecretKey', // 세션을 암호화하기 위한 임의의 키
    resave: false,
    saveUninitialized: true
}));

// 게시판 메인 페이지 렌더링
app.get('/boardMain', async (req, res) => {
    let conn;

    const loggedInUserId = req.session.loggedInUserId;
    const loggedInUserName = req.session.loggedInUserName;
    const loggedInUserRealName = req.session.loggedInUserRealName;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.extended(
            `select count (*) as total from posts`
        );
        const totalPosts = result.rows[0];
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}, 정렬방식: ${req.query.sort}`);

        // 정렬 방식에 따른 SQL 쿼리 작성
        let orderByClause = 'order by p.created_at desc' // 기본적으로 최신순 정렬

        if (req.query.sort === 'views_desc') {
            orderByClause = 'order by p.created_at desc, p.created_at desc'; // 조회수 내림차순, 최신순
        }

        // 검색 조건에 따른 SQL 쿼리 작성
        let searchCondition = ''; // 기본적으로 검색 조건 없음

        if (req.query.searchType && req.query.searchInput) {
            const searchType = req.query.searchType;
            const searchInput = req.query.searchInput;

            // 검색 조건에 따라 where 절 설정
            if (searchType === 'title') {
                searchCondition = `and p.title like '%${searchInput}%'`;
            } else if (searchType === 'content') {
                searchCondition = `and p.content like '%${searchInput}%'`;
            } else if (searchType === 'author') {
                searchCondition = `and u.username like '%${searchInput}%'`;
            }
        }

        const sql_query = `select 
                                id, subject, title, author, to_char(created_at, 'YYYY-MM-DD'), views, likes, 
                                (select count (*) from comments c where c.post_id = p.id) as comments_count
            from (
                    select
                        p.id, p.subject, p.title, u.username as author, p.created_at, p.views, p.likes,
                        row_number() over (${orderByClause}) as rn
                    from posts p join users u on p.author_id = u.id
                    where 1=1 
                        ${searchCondition}
                 ) p
            where rn between :startRow and :endRow`;
        result = await conn.execute(sql_query,
            {
                startRow: startRow,
                endRow: endRow
            }
        );

        const MAX_PAGE_LIMIT = 5;
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? totalPages - MAX_PAGE_LIMIT + 1 : currentPage;
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
        console.log(`result.rows: ${result.rows}`);
        console.log(`result.rows[0].id: ${result.rows[0].id}`);

        res.render('index', {
            userId: loggedInUserId,
            userName: loggedInUserName,
            userRealName: loggedInUserRealName,
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPages,
            maxPageNumber: MAX_PAGE_LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if (conn) {
            try {
                await conn.close();
            } catch (err){
                console.error(err);
            }
        }
    }
});

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

// 글작성 페이지 렌더링
app.get('/create', (req, res) => {
    // 로그인 여부 확인 로직 생성
    res.render('create', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

app.post('/create', async (req, res) => {
    console.log('Debug: post create');
    const { title, content } = req.body;
    const authorID = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        const result = await conn.execute(
            `select post_id_seq.nextval from dual`
        );
        const postId = result.rows[0][0];

        // 게시글 삽입
        await conn.execute(
            `insert into posts (id, subject, author_id, title, content) values (:id, :subject, :authorId, :title, :content)`,
            [postId, subject, authorID, title, content]
        );

        // 변경 사항 커밋
        await conn.commit();

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/boardMain');
    } catch (err) {
        console.error('글 작성 중 오류 발생:', err);
        res.status(500).send('글 작성 중 오류가 발생했습니다.');
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

// app.get('/detailPost/:id', async (req, res) => {
app.get('/detailPost/:id', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login'); // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
    }

    const postId = req.params.id;
    const userId = req.session.loggedInUserId;
    const userName = req.session.loggedInUserName;
    const userRealName = req.session.loggedInUserRealName;
    console.log(`username: ${userName}`);
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 조회수 증가 처리
        await conn.execute(
            `update posts set views = views + 1 where id = :id`
            [postId]
        );

        // 변경 사항을 커밋
        await conn.commit();

        // 게시글 정보 가져오기
        const postResult = await conn.execute(
            `select p.id, p.subject, p.title, u.username as author, p.content, to_char(p.create_at, 'YYYY-MM-DD') as created_at, p.views
            from posts p
            join users u on p.author_id = u.id
            where p.id = :id`,
            [postId],
            { fetchInfo: { content: { type: oracledb.string } } }
        );

        // 댓글 가져오기
        const commentResult = await conn.execute(
            `select c.id, c.author_id, c.content, u.username as author, to_char(c.created_at, 'YYYY-MM-DD HH:MM') as created_at, c.parent_comment_id
            from comments c
            join users u on c.author_id = u.id
            where c.post_id = :id
            order by c.id`,
            [postId],
            { fetchInfo: { content: { type: oracledb.string } } }
        );

        // 댓글과 댓글의 댓글을 구성
        const comments = [];
        const commentMap = new Map(); // 댓글의 id를 key로 하여 댓글을 맵으로 저장

        commentResult.rows.forEach(row => {
            const comment = {
                id: row[0],
                author_id: row[1],
                content: row[2],
                author: row[3],
                created_at: row[4],
                children: [], // 자식 댓글을 저장할 배열
                isAuthor: row[1] === userId // 댓글 작성자가 현재 로그인한 사용자인지 확인
            };

            const parentId = row[5]; // 부모 댓글의 id

            if (parentId === null ) {
                // 부모 댓글이 null이면 바로 댓글 배열에 추가
                comments.push(comment);
                commentMap.set(comment.id, comment); // 맵에 추가
            } else {
                // 부모 댓글이 있는 경우 부모 댓글을 찾아서 자식 댓글 배열에 추가
                const parentComment = commentMap.get(parentId);
                parentComment.children.push(comment);
            }
        });
        const post = {
            id: postResult.rows[0][0],
            subject: postResult.rows[0][1],
            title: postResult.rows[0][2],
            author: postResult.rows[0][3],
            content: postResult.rows[0][4],
            created_at: postResult.rows[0][5],
            views: postResult.rows[0][6],
            likes: postResult.rows[0][7]
        };
        res.render('detalePost', {
            post: post,
            userId: userId,
            userName: userName,
            userRealName: userRealName,
            comments: comments
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