use ds_main;
drop table data;
create table data
(
    id      bigint primary key identity (1,1),
    date    datetime not null,
    value   int      not null,
    service bigint   not null
);

use ds_service1;
drop table data;
create table data
(
    id      bigint   not null check (id > 0),
    date    datetime not null,
    value   int      not null,
    service bigint   not null check (service > 0)
);

use ds_service2;
drop table data;
create table data
(
    id      bigint   not null check (id > 0),
    date    datetime not null,
    value   int      not null,
    service bigint   not null check (service > 0)
);