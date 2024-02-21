-- 게시글 테이블 생성
create table md_posts (
                          id number primary key,
                          author_id number,
                          sort_id number,
                          title varchar(255),
                          content clob,
                          created_at timestamp default current_timestamp,
                          views number default 0,
                          likes number default 0,
                          FOREIGN KEY (author_id) REFERENCES users(id)
);

-- 말머리 생성
create table sort (
                         id int primary key,
                         subject varchar(255)
);

-- 말머리 id 생성
insert into subject (id, name) values (1, '명소');
insert into subject (id, name) values (2, '맛집');
insert into subject (id, name) values (3, '숙소');
commit;

-- 덧글 테이블 생성
create table comments (
                          id number primary key,
                          post_id number,
                          author_id number,
                          content clob,
                          created_at timestamp(6),
                          parent_comment_id number,
                          foreign key (parent_comment_id) references comments(id)
);

-- 60개의 더미 게시글 생성
begin
for i in 1..60 loop
    insert into posts (id, title, content, author_id)
    values (i, '테스트 제목' || i, '테스트 내용' || i, round(dbms_random.value(1, 10)));
end loop;
commit;
end;
/

drop sequence comment_id_seq;
-- comments 테이블의 시퀀스 생성
create sequence comment_id_seq
    start with 1
    increment by 1
    nocache;

drop table comments;
create table comments (
                          id number primary key,
                          post_id number,
                          author_id number,
                          content clob,
                          created_at timestamp default current_timestamp,
                          parent_comment_id number,
                          foreign key (parent_comment_id) references comments(id),
                          foreign key (author_id) references users(id),
                          foreign key (parent_comment_id) references comments(id)
);