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

// Oracle 데이터베이스 연결 설정
const dbConfig = {
    user: 'open-source',
    password: '1111',
    connectString: 'localhost:1521/xe'
};

// 자동 commit 처리
app.set('view engine', 'ejs');
oracledb.initOracleClient({ lirDir: '../../../instantclient_21_13' });
oracledb.autoCommit = true;

// 게시판 메인 페이지 랜더링
app.get('/', async (req, res) => {
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `select count(*) total
             from posts`
        );
        const totalPosts = result.rows[0];
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}`);
        result = await conn.execute(
            `select id,
                    subject,
                    title,
                    author,
                    to_char(created_at, 'YYYY-MM-DD'),
                    views,
                    (select count(*) from comments c where c.post_id = p.id) as comments_count
             from (select p.id,
                          p.subject,
                          p.title,
                          u.name as    author,
                          p.created_at,
                          p.views,
                          row_number() over (order by p.id desc) as rn
                   from posts p
                            join users u on p.author_id = u.id) p
             where rn between :startRow and :endrow
            `,
            {
                startRow: startRow,
                endRow: endRow
            }
        );

        const max_page_limit = 5;
        const startPage = (totalPages - currentPage) < max_page_limit ? totalPages - max_page_limit + 1 : currentPage;
        const endPage = Math.min(startPage + max_page_limit - 1, totalPages);
        console.log(`totalPages: ${totalPages}, currentPage: ${currentPage}, startPage: ${startPage}, endPage: ${endPage}`);

        res.render('index', {
            posts: result.rows,
            startPage: startPage,
            currentPage: currentPage,
            endPage: endPage,
            totalPages: totalPosts,
            maxPageNumber: max_page_limit
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    } finally {
        if(conn) {
            try {
                await conn.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
});

// 게시판 서버 시작
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});