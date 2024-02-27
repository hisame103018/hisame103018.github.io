drop table users;
CREATE TABLE users (
                       id NUMBER PRIMARY KEY,  -- PK
                       username VARCHAR2(50),  -- UserID 또는 User 닉네임
                       password VARCHAR2(50),  -- 패스워드
                       name VARCHAR2(100)      -- 실제 사용자 이름
);

INSERT INTO users (id, username, password, name) VALUES (1, 'user1', 'password1', '김철수');
INSERT INTO users (id, username, password, name) VALUES (2, 'user2', 'password2', '이영희');
INSERT INTO users (id, username, password, name) VALUES (3, 'user3', 'password3', '박민수');

-- post, comment 테이블 초기화 및 생성 스크립트
drop sequence comment_id_seq;
drop sequence post_id_seq;
drop table comments;
drop table md_posts;
-- posts 테이블의 시퀀스 생성
CREATE SEQUENCE post_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;
-- 주제(category) 외래 키 연결
CREATE TABLE categories (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) UNIQUE
);

INSERT INTO categories (id, name) values (1, '명소');
INSERT INTO categories (id, name) values (2, '맛집');
INSERT INTO categories (id, name) values (3, '숙소');

-- 게시글 테이블 생성
CREATE TABLE md_posts (
                       id NUMBER PRIMARY KEY,
                       category_id NUMBER,
                       author_id NUMBER,
                       title VARCHAR2(255),
                       content CLOB,
                       file_original_name VARCHAR2(4000), -- 파일의 원본 이름을 저장하는 컬럼
                       file_stored_name VARCHAR2(4000), -- 파일의 저장된 이름(변환된 이름)을 저장하는 컬럼
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       views NUMBER DEFAULT 0,
                       likes NUMBER DEFAULT 0,
                       FOREIGN KEY (author_id) REFERENCES users(id),
                       FOREIGN KEY (category_id) REFERENCES categories(id)
);
-- 55개의 더미 글 작성 ver1: 동일 시간에 생성되는 문제가 있다.

BEGIN
FOR i IN 1..55 LOOP
    INSERT INTO md_posts (id, category_id, title, content, author_id, created_at)
    VALUES (post_id_seq.nextval,
            ROUND(DBMS_RANDOM.VALUE(1, 3)),
            '게시글 제목 ' || i,
            '게시글 내용 ' || i,
            ROUND(DBMS_RANDOM.VALUE(1, 3)),
            SYSTIMESTAMP + INTERVAL '0.001' SECOND * i);
END LOOP;
COMMIT;
END;
/


-- comments 테이블의 시퀀스 생성
CREATE SEQUENCE comment_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;


CREATE TABLE comments (
                          id NUMBER PRIMARY KEY,
                          post_id NUMBER,
                          author_id NUMBER,
                          content CLOB,
                          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          parent_comment_id number,
                          FOREIGN KEY (post_id) REFERENCES md_posts(id),
                          FOREIGN KEY (author_id) REFERENCES users(id),
                          FOREIGN KEY (parent_comment_id) REFERENCES comments(id)
);
commit;