// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.get('/', async (req, res) => {
    let conn;

    const loggedInUserId = req.session.loggedInUserId;
    const loggedInUserName = req.session.loggedInUserName;
    const loggedInUserRealName = req.session.loggedInUserRealName;

    try {
        conn = await oracledb.getConnection(dbConfig);
        let result = await conn.execute(
            `select count(*) as total from md_posts`
        );
        const totalPosts = result.rows[0];
        const postsPerPage = 10; // 한 페이지에 표시할 게시글 수
        const totalPages = Math.ceil(totalPosts / postsPerPage); // 총 페이지 수 계산

        let currentPage = req.query.page ? parseInt(req.query.page) : 1; // 현재 페이지 번호
        const startRow = (currentPage - 1) * postsPerPage + 1;
        const endRow = currentPage * postsPerPage;
        console.log(`startRow: ${startRow}, endRow: ${endRow}`);

        // 정렬 방식에 따른 SQL 쿼리 작성
        let orderByClause = 'ORDER BY p.created_at DESC'; // 기본적으로 최신순 정렬

        // 검색 조건에 따른 SQL 쿼리 작성
        let searchCondition = ''; // 기본적으로 검색 조건 없음
        let searchSelectCondition = '';


        if ((req.query.searchType && req.query.searchInput) || req.query.searchSelect) {
            const searchType = req.query.searchType;
            const searchInput = req.query.searchInput;
            const searchSelect = req.query.searchSelect;


            // 검색 조건에 따라 where 절 설정
            if (searchType === 'title') {
                searchCondition = `and p.title like '%${searchInput}%'`;
            } else if (searchType === 'author') {
                searchCondition = `and u.username like '%${searchInput}%'`;
            } else if (searchType === 'content') {
                searchCondition = `and p.content like '%${searchInput}%'`;
            } else if (searchType === 'category') {
                searchSelectCondition = `and p.category = '${searchSelect}'`;
            }
        }

        const sql_query = `SELECT id, category, author, title, TO_CHAR(created_at, 'YYYY-MM-DD'), views,
                                  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
                           from ( select p.id, p.category, u.username as author, p.title, p.created_at, p.views,
                                         row_number() over (ORDER BY p.created_at DESC) as rn
                                  from md_posts p join users u on p.author_id = u.id
                                  where 1=1
                                      ${searchCondition}
                                        ${searchSelectCondition}
                                ) p
                           where rn between :startRow and :endRow`;
        console.log(sql_query);

        result = await conn.execute(sql_query,
            {
                startRow: startRow,
                endRow: endRow
            }
        );

        const MAX_PAGE_LIMIT = 5;
        const startPage = (totalPages - currentPage) < MAX_PAGE_LIMIT ? Math.max(totalPages - MAX_PAGE_LIMIT + 1, 1) : currentPage;
        const endPage = Math.min(startPage + MAX_PAGE_LIMIT - 1, totalPages);
        console.log(`result.rows: ${JSON.stringify(result.rows)}`);
        console.log(`result.rows[0][0]: ${result.rows[0][0]}`);

        res.render('md_mainBoard', {
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
            } catch (err) {
                console.error(err);
            }
        }
    }
});

module.exports = router;
