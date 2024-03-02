CREATE TABLE users (
                       id NUMBER PRIMARY KEY,  -- PK
                       username VARCHAR2(50),  -- UserID �Ǵ� User �г���
                       password VARCHAR2(50),  -- �н�����
                       name VARCHAR2(100)      -- ���� ����� �̸�
);

INSERT INTO users (id, username, password, name) VALUES (1, 'user1', 'password1', '��ö��');
INSERT INTO users (id, username, password, name) VALUES (2, 'user2', 'password2', '�̿���');
INSERT INTO users (id, username, password, name) VALUES (3, 'user3', 'password3', '�ڹμ�');

CREATE SEQUENCE post_id_seq
    START WITH 1
    INCREMENT BY 1
    NOCACHE;
    
CREATE TABLE categories (
    id NUMBER PRIMARY KEY,
    name VARCHAR2(255) UNIQUE
);

INSERT INTO categories (id, name) values (0, '');
INSERT INTO categories (id, name) values (1, '���');
INSERT INTO categories (id, name) values (2, '����');
INSERT INTO categories (id, name) values (3, '����');

CREATE TABLE md_posts (
                       id NUMBER PRIMARY KEY,
                       category_id NUMBER,
                       category_name varchar2(255),
                       author_id NUMBER,
                       title VARCHAR2(255),
                       content CLOB,
                       file_original_name VARCHAR2(4000), -- ������ ���� �̸��� �����ϴ� �÷�
                       file_stored_name VARCHAR2(4000), -- ������ ����� �̸�(��ȯ�� �̸�)�� �����ϴ� �÷�
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       views NUMBER DEFAULT 0,
                       likes NUMBER DEFAULT 0,
                       FOREIGN KEY (author_id) REFERENCES users(id),
                       FOREIGN KEY (category_id) REFERENCES categories(id)
);

BEGIN
FOR i IN 1..55 LOOP
    INSERT INTO md_posts (id, category_name, title, content, author_id, created_at)
    VALUES (post_id_seq.nextval,
            case round(dbms_random.value(1,4))
                when 0 then ''
                when 1 then '���'
                when 2 then '����'
                when 3 then '����'
            end,
            '�Խñ� ���� ' || i,
            '�Խñ� ���� ' || i,
            ROUND(DBMS_RANDOM.VALUE(1, 3)),
            SYSTIMESTAMP + INTERVAL '0.001' SECOND * i);
END LOOP;
COMMIT;
END;
/

select * from md_posts;

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

SELECT id, category_id, title, author, TO_CHAR(created_at, 'YYYY-MM-DD'), views,  category_name,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
        from ( select p.id, p.category_id, p.title, u.username as author, p.created_at, p.views, p.category_name,
                row_number() over (ORDER BY p.created_at DESC) as rn
                from md_posts p join users u on p.author_id = u.id
                where 1=1
                    and p.title like '%title%'
                    or u.username like '%username%'
                    or p.content like '%content%'
                    or p.category_id = category_id
            ) p
        where rn between :startRow and :endRow;

-- �˻� �׽�Ʈ
SELECT id, category_id, title, author, TO_CHAR(created_at, 'YYYY-MM-DD'), views, category,
       (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comments_count
from ( select p.id, p.category_id, p.title, u.username as author, p.created_at, p.views, p.category_name as category,
              row_number() over (ORDER BY p.created_at DESC) as rn
       from md_posts p join users u on p.author_id = u.id
       where 1=1
           and p.title like '%50%'
     ) p
where rn between 1 and 10;