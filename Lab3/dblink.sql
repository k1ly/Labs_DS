alter session set NLS_LANGUAGE = AMERICAN;

drop database link dml_link;
create database link dml_link
    connect to pdb_lab8_admin
        identified by "1234"
    using 'WIN-168SM02HSM4:1521/pdb_lab8';

drop table ris_lke_table;
create table ris_lke_table
(
    value varchar2(100)
);

select *
from ris_lke_table;

select *
from ris_dml_table@dml_link;

insert into ris_dml_table@dml_link (value)
values ('Transaction 1');
insert into ris_lke_table (value)
values ('Transaction 1');
commit;

insert into ris_dml_table@dml_link (value)
values ('Transaction 2');
commit;
update ris_lke_table
set value = 'Transaction 2'
where value = 'Transaction 1';
commit;

update ris_dml_table@dml_link
set value = 'Transaction 3'
where value = 'Transaction 2';
commit;
insert into ris_lke_table (value)
values ('Transaction 3');
commit;

insert into ris_dml_table@dml_link (value)
values ('qwertyuioopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm123456789qwertyuiopasdfghjklzxcvbnmqwertyuiopasdfghjklzxcvbnm');
commit;

update ris_dml_table@dml_link
set value = 'New value'
where value = 'test';
rollback;
