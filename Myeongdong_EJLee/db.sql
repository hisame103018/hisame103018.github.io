-- 게시글 테이블 생성
create table posts (
                       id number primary key,
                       subject varchar2(255),
                       title varchar2(255),
                       content clob,
                       create_at timestamp default current_timestamp,
                       views number default 0,
                       foreign key (author_id) references users(id)
);
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