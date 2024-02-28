// routes/addComment.js
const express = require('express');
const oracledb = require('oracledb');
const bodyParser = require('body-parser');
const session = require('express-session');
const multer = require('multer');
const fs= require('fs');
const path = require('path');
const upload = multer({ dest: path.join(__dirname, 'temp'), encoding: 'utf8' });

const router = express.Router();

router.get('/', async (req, res) => {
    // 로그인 여부 확인 로직 생성
    res.render('md_create', {
        userId: req.session.userId,
        username: req.session.username,
        userRealName: req.session.userRealName
    });
});

// POST 요청 처리
router.post('/', upload.array('files', 5), async (req, res) => {
    console.log('Debug: post create');
    const { title, content, category } = req.body;

    const files = req.files.map(file => {
        return {
            originalName: file.originalName,
            storedName: file.filename
        };
    });

    const authorID = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        const result = await conn.execute(
            `select post_id_seq.nextval from dual`
        );
        const postId = result.rows[0][0];
        console.log(authorID)

        // 말머리인 '주제' 외래키 가져오기
        const categoryId = await getcategoryIdBySomeLogic();

        // 게시글 삽입
        await conn.execute(
            `insert into md_posts (id, category_id, author_id, title, content, file_original_name, file_stored_name) 
            values (:id, :categoryId, :authorId, :title, :content, :file_original_name, :file_stored_name)`,
            {
                id: postId,
                category_id: categoryId,
                author_id: authorId,
                title: title,
                content: content,
                file_original_name: files.map(file => file.originalName).join(';'),
                file_stored_name: files.map(file => file.storedName).join(';')
            }
        );

        // 변경 사항 커밋
        await conn.commit();

        // 파일 이동 및 임시 폴더의 파일 삭제
        for (const file of req.files) {
            const tempFilePath = file.path;
            const targetFilePath = path.join(UPLOADS_FOLDER, file.filename);
            fs.renameSync(tempFilePath, targetFilePath);
        }

        // 게시글 작성 후 게시판 메인 페이지로 리다이렉트
        res.redirect('/md_boardMain');
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

module.exports = router;
