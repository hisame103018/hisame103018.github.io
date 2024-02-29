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
    const { title, content } = req.body;
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
    console.log('Debug: authorId', authorId);

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 게시글을 위한 시퀀스에서 새로운 ID 가져오기
        // const result = await conn.execute(
        //     `select post_id_seq.nextval from dual`
        // );
        // const postId = result.rows[0][0];

        async function getcategoryIdBySomeLogic(categoryName) {
            const result = await conn.execute('select id from categories where name = :categoryName', { categoryName });
            return result.rows[0][0];
        }

        async function getcategoryNameBySomeLogic(categoryId) {
            const result = await conn.execute('select name from categories where id = :categoryId', { categoryId });
            return result.rows[0][0];
        }

        // 말머리인 '주제' 외래키 가져오기
        const categoryId1 = await getcategoryIdBySomeLogic('명소'); // 카테고리 명소 ID
        const categoryId2 = await getcategoryIdBySomeLogic('맛집'); // 카테고리 맛집 ID
        const categoryId3 = await getcategoryIdBySomeLogic('숙소'); // 카테고리 숙소 ID
        const categoryNameHotPlace = await getcategoryNameBySomeLogic(categoryId1);
        const categoryNameFoodPlace = await getcategoryNameBySomeLogic(categoryId2);
        const categoryNameLodging = await getcategoryNameBySomeLogic(categoryId3);

        // const getCategoryInfo = {
        //     1: { categoryId: 1, categoryName: '명소' },
        //     2: { categoryId: 2, categoryName: '맛집' },
        //     3: { categoryId: 3, categoryName: '숙소' }
        // }

        const getCategoryInfo = [
            { categoryId: 0, categoryName: 'null' },
            { categoryId: 1, categoryName: '명소' },
            { categoryId: 2, categoryName: '맛집' },
            { categoryId: 3, categoryName: '숙소' }
        ]

        const selectedCategoryId = req.body.selectedCategoryId;
        const categoryInfo = getCategoryInfo[selectedCategoryId];

        // 게시글 삽입
        const sql_CreatePost =  `
            insert into md_posts(id, category_id, category_name, author_id, title, content, file_original_name, file_stored_name) 
            values (post_id_seq.nextval, :categoryId, :categoryName, :authorId, :title, :content, :file_original_name, :file_stored_name)
            `

        const bindData = {
            categoryId: categoryInfo.categoryId,
            categoryName: categoryInfo.categoryName,
            authorId: authorId,
            title: title,
            content: content,
            file_original_name: files.map(file => file.originalName).join(';'),
            file_stored_name: files.map(file => file.storedName).join(';')
        }
        console.log('bindData : '+ JSON.stringify(bindData));

        await conn.execute(sql_CreatePost, bindData);

        // 선택한 categoryId에 따라 카테고리 정보를 반환하는 함수
        // function getCategoryInfo(categoryId) {
        //     switch (categoryId) {
        //         case 1:
        //             return { categoryId: 1, categoryName: '명소' };
        //         case 2:
        //             return { categoryId: 2, categoryName: '맛집' };
        //         case 3:
        //             return { categoryId: 3, categoryName: '숙소' };
        //         default:
        //             // 기본값 또는 오류 처리
        //             return { categoryId: 0, categoryName: '(null)' };
        //     }
        // }



        // await conn.execute(
        //     `insert into md_posts (id, category_id, category_name, author_id, title, content, file_original_name, file_stored_name)
        //     values (post_id_seq.nextval, :categoryId, :categoryName, :authorId, :title, :content, :file_original_name, :file_stored_name)`,
        //     {
        //         // id: postId,
        //         categoryId: categoryId1,
        //         categoryName: categoryNameHotPlace,
        //         authorId: authorId,
        //         title: title,
        //         content: content,
        //         file_original_name: files.map(file => file.originalName).join(';'),
        //         file_stored_name: files.map(file => file.storedName).join(';')
        //     }
        // );
        // await conn.execute(
        //     `insert into md_posts (id, category_id, category_name, author_id, title, content, file_original_name, file_stored_name)
        //     values (post_id_seq.nextval, :categoryId, :categoryName, :authorId, :title, :content, :file_original_name, :file_stored_name)`,
        //     {
        //         // id: postId,
        //         categoryId: categoryId2,
        //         categoryName: categoryNameFoodPlace,
        //         authorId: authorId,
        //         title: title,
        //         content: content,
        //         file_original_name: files.map(file => file.originalName).join(';'),
        //         file_stored_name: files.map(file => file.storedName).join(';')
        //     }
        // );
        // await conn.execute(
        //     `insert into md_posts (id, category_id, category_name, author_id, title, content, file_original_name, file_stored_name)
        //     values (post_id_seq.nextval, :categoryId, :categoryName, :authorId, :title, :content, :file_original_name, :file_stored_name)`,
        //     {
        //         // id: postId,
        //         categoryId: categoryId3,
        //         categoryName: categoryNameLodging,
        //         authorId: authorId,
        //         title: title,
        //         content: content,
        //         file_original_name: files.map(file => file.originalName).join(';'),
        //         file_stored_name: files.map(file => file.storedName).join(';')
        //     }
        // );


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
