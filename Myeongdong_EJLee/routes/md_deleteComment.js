// routes/deleteComment.js
const express = require('express');
const oracledb = require('oracledb');
const dbConfig = require('../dbConfig');

const router = express.Router();

router.post('/:id', async (req, res) => {
    // 로그인 여부 확인
    if (!req.session.loggedIn) {
        return res.redirect('/login');
    }

    const comment_id = req.params.id;
    const post_id = req.body.post_id;

    let conn;
    try {
        conn = await oracledb.getConnection(dbConfig);

        // 댓글 삭제
        await conn.execute(
            `delete from comments where id = :id or parent_comment_id = :parent_comment_id`,
            { id: comment_id, parent_comment_id: comment_id }
        );

        await conn.commit();

        res.redirect(`/md_detailPost/${post_id}`);
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

module.exports = router;
