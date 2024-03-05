// routes/addComment.js
const express = require('express');
const session = require('express-session');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');
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
    const { category, title, content } = req.body;
    /*
    - req.files: 이것은 Multer라는 미들웨어에 의해 추가.
    Multer는 파일 업로드를 처리하기 위한 미들웨어로,
    업로드된 파일에 대한 정보를 req.files 객체에 저장
    - files: req.files의 file객체들의 정보중
     */
    const files = req.files.map(file => {
        return {
            // Multer의 file객체가 관리하는 업로드된 파일의 원본 이름
            originalName: file.originalname,
            // Multer의 file객체가 관리하는 업로드된 파일의 변환된 이름
            storedName: file.filename
        };
    });

    const authorId = req.session.loggedInUserId; // 현재 로그인한 사용자의 ID
    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        const result = await conn.execute(
            `select post_id_seq.nextval from dual`
        );

        const postId = result.rows[0][0];
        console.log(authorId)
        await conn.execute(
            `insert into md_posts (id, category, author_id, title, content, file_original_name, file_stored_name) values (:id, :category, :author_id, :title, :content, :file_original_name, :file_stored_name)`,
            {
                id: postId,
                category: category,
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
        res.redirect('/md_mainBoard');
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
