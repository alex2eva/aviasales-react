--
-- PostgreSQL database dump
--

\restrict M7EXCHBwIFcU0WyF0t84cS1yu10zbFhpBQwwPdDFyo8Jk4nNDyG0qx8ih9ayW0c

-- Dumped from database version 18.1
-- Dumped by pg_dump version 18.1

-- Started on 2026-04-22 20:54:25

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP DATABASE aviasales;
--
-- TOC entry 5042 (class 1262 OID 16430)
-- Name: aviasales; Type: DATABASE; Schema: -; Owner: -
--

CREATE DATABASE aviasales WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'Russian_Russia.1251';


\unrestrict M7EXCHBwIFcU0WyF0t84cS1yu10zbFhpBQwwPdDFyo8Jk4nNDyG0qx8ih9ayW0c
\connect aviasales
\restrict M7EXCHBwIFcU0WyF0t84cS1yu10zbFhpBQwwPdDFyo8Jk4nNDyG0qx8ih9ayW0c

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 253 (class 1255 OID 16791)
-- Name: seats_quantity(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seats_quantity(p_flight integer, p_class integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare
seats_count int4;
tickets_count int4;
	BEGIN
		if p_class is not null
		then 
			select seats.quantity into seats_count
			from aircraft_seats_class seats 
			inner join aircraft ac on ac.id = seats.aircraft_seats_class_aircraft_fk
			inner join flight f on ac.id = f.flight_aircraft_fk
			where f.id = p_flight and seats.aircraft_seats_class_seats_class_fk = p_class;
	
			select count(*) into tickets_count
			from ticket 
			where ticket_flight_fk = p_flight and ticket_seats_class_fk = p_class;
		else
			select sum(seats.quantity) into seats_count 
			from aircraft_seats_class seats 
			inner join aircraft ac on ac.id = seats.aircraft_seats_class_aircraft_fk
			inner join flight f on ac.id = f.flight_aircraft_fk
			where f.id = p_flight
			group by seats.aircraft_seats_class_aircraft_fk;
	
			select count(*) into tickets_count
			from ticket 
			where ticket_flight_fk = p_flight;	
		end if;
	return seats_count - tickets_count;
	END;
$$;


--
-- TOC entry 254 (class 1255 OID 16790)
-- Name: sell_ticket(character varying, character varying, character varying, date, character varying, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.sell_ticket(p_last_name character varying, p_first_name character varying, p_middle_name character varying, p_birthdate date, p_passport character varying, p_flight integer, p_class integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
declare 
passanger_id int;
ticket_id int;
	BEGIN
-- проверяем пассажира
		select p.id into passanger_id from passanger p where p.passport = p_passport; 

		if passanger_id is null then
			insert into passanger(last_name, first_name, middle_name, birth_date, passport)
			values(p_last_name, p_first_name, p_middle_name, p_birthdate, p_passport)
			returning id into passanger_id;
		end if;
		
		insert into ticket(ticket_num, ticket_flight_fk, ticket_passanger_fk, ticket_seats_class_fk)
		values(substring(md5(random()::text), 1, 20), p_flight, passanger_id, p_class)
		returning id into ticket_id;

	return ticket_id;
	END;
$$;


--
-- TOC entry 241 (class 1255 OID 16798)
-- Name: trigger_new_ticket_check(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.trigger_new_ticket_check() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
declare
seats_count int4;
	BEGIN
		select seats_quantity(new.ticket_flight_fk, new.ticket_seats_class_fk) into seats_count;
		if seats_count > 0 then
			return new;
		else
			raise exception 'На данный рейс нет свободных мест.';
		end if;
	END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 228 (class 1259 OID 16486)
-- Name: aircraft; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aircraft (
    id integer NOT NULL,
    model character varying NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 16485)
-- Name: aircraft_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.aircraft ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.aircraft_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16502)
-- Name: aircraft_seats_class; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.aircraft_seats_class (
    quantity integer NOT NULL,
    id integer NOT NULL,
    aircraft_seats_class_aircraft_fk integer NOT NULL,
    aircraft_seats_class_seats_class_fk integer CONSTRAINT aircraft_seats_class_aircraft_seats_class_seats_class__not_null NOT NULL
);


--
-- TOC entry 229 (class 1259 OID 16501)
-- Name: aircraft_seats_class_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.aircraft_seats_class ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.aircraft_seats_class_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 16691)
-- Name: airline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.airline (
    id integer NOT NULL,
    name character varying NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 16690)
-- Name: airline_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.airline ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.airline_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16459)
-- Name: airport; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.airport (
    id integer NOT NULL,
    code character(3) NOT NULL,
    airport_city_fk integer NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 16458)
-- Name: airport_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.airport ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.airport_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 222 (class 1259 OID 16444)
-- Name: city; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.city (
    id integer NOT NULL,
    "Name" character varying NOT NULL,
    country_fk integer NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 16443)
-- Name: city_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.city ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.city_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16432)
-- Name: country; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.country (
    id integer NOT NULL,
    "Name" character varying NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 16431)
-- Name: country_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.country ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.country_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16520)
-- Name: flight; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.flight (
    id integer NOT NULL,
    depature_time time without time zone NOT NULL,
    depature_date date NOT NULL,
    arrival_time time without time zone NOT NULL,
    arrival_date date NOT NULL,
    flight_num character varying NOT NULL,
    arrival_airport_fk integer NOT NULL,
    departure_airport_fk integer CONSTRAINT flight_depature_airport_fk_not_null NOT NULL,
    flight_aircraft_fk integer NOT NULL,
    flight_airline_fk integer NOT NULL,
    CONSTRAINT departure_arrival_check CHECK ((departure_airport_fk <> arrival_airport_fk))
);


--
-- TOC entry 231 (class 1259 OID 16519)
-- Name: flight_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.flight ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.flight_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16568)
-- Name: passanger; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.passanger (
    id integer NOT NULL,
    last_name character varying NOT NULL,
    first_name character varying NOT NULL,
    middle_name character varying,
    birth_date date NOT NULL,
    passport character varying NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 16567)
-- Name: passanger_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.passanger ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.passanger_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16550)
-- Name: price; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.price (
    price numeric(10,2) NOT NULL,
    price_flight_fk integer NOT NULL,
    price_seats_class_fk integer NOT NULL
);


--
-- TOC entry 226 (class 1259 OID 16474)
-- Name: seats_class; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seats_class (
    id integer NOT NULL,
    "Class" character varying NOT NULL
);


--
-- TOC entry 225 (class 1259 OID 16473)
-- Name: seats_class_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.seats_class ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.seats_class_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 240 (class 1259 OID 16792)
-- Name: seats_count; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seats_count (
    count bigint
);


--
-- TOC entry 237 (class 1259 OID 16583)
-- Name: ticket; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket (
    id integer NOT NULL,
    ticket_num character varying NOT NULL,
    ticket_flight_fk integer NOT NULL,
    ticket_passanger_fk integer NOT NULL,
    ticket_seats_class_fk integer NOT NULL
);


--
-- TOC entry 236 (class 1259 OID 16582)
-- Name: ticket_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.ticket ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.ticket_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 5024 (class 0 OID 16486)
-- Dependencies: 228
-- Data for Name: aircraft; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.aircraft OVERRIDING SYSTEM VALUE VALUES (1, 'AIRBUS A321');
INSERT INTO public.aircraft OVERRIDING SYSTEM VALUE VALUES (2, 'BOEING 737');


--
-- TOC entry 5026 (class 0 OID 16502)
-- Dependencies: 230
-- Data for Name: aircraft_seats_class; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (10, 1, 1, 1);
INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (10, 2, 1, 2);
INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (10, 5, 2, 1);
INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (10, 6, 2, 2);
INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (100, 7, 2, 3);
INSERT INTO public.aircraft_seats_class OVERRIDING SYSTEM VALUE VALUES (150, 4, 1, 3);


--
-- TOC entry 5035 (class 0 OID 16691)
-- Dependencies: 239
-- Data for Name: airline; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.airline OVERRIDING SYSTEM VALUE VALUES (1, 'Ural Airlines');
INSERT INTO public.airline OVERRIDING SYSTEM VALUE VALUES (2, 'Air China');


--
-- TOC entry 5020 (class 0 OID 16459)
-- Dependencies: 224
-- Data for Name: airport; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.airport OVERRIDING SYSTEM VALUE VALUES (1, 'DME', 2);
INSERT INTO public.airport OVERRIDING SYSTEM VALUE VALUES (2, 'NRT', 4);
INSERT INTO public.airport OVERRIDING SYSTEM VALUE VALUES (3, 'DWC', 3);
INSERT INTO public.airport OVERRIDING SYSTEM VALUE VALUES (4, 'PEK', 5);


--
-- TOC entry 5018 (class 0 OID 16444)
-- Dependencies: 222
-- Data for Name: city; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.city OVERRIDING SYSTEM VALUE VALUES (2, 'Moscow', 2);
INSERT INTO public.city OVERRIDING SYSTEM VALUE VALUES (3, 'Dubai', 4);
INSERT INTO public.city OVERRIDING SYSTEM VALUE VALUES (4, 'Tokyo', 3);
INSERT INTO public.city OVERRIDING SYSTEM VALUE VALUES (5, 'Beijing', 5);


--
-- TOC entry 5016 (class 0 OID 16432)
-- Dependencies: 220
-- Data for Name: country; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.country OVERRIDING SYSTEM VALUE VALUES (2, 'Russia');
INSERT INTO public.country OVERRIDING SYSTEM VALUE VALUES (3, 'Japan');
INSERT INTO public.country OVERRIDING SYSTEM VALUE VALUES (4, 'UAE');
INSERT INTO public.country OVERRIDING SYSTEM VALUE VALUES (5, 'China');


--
-- TOC entry 5028 (class 0 OID 16520)
-- Dependencies: 232
-- Data for Name: flight; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.flight OVERRIDING SYSTEM VALUE VALUES (1, '07:30:00', '2026-10-18', '14:00:00', '2026-10-18', 'U6-797', 3, 1, 1, 1);
INSERT INTO public.flight OVERRIDING SYSTEM VALUE VALUES (3, '18:45:00', '2026-04-03', '13:40:00', '2026-04-04', 'CA-910', 2, 1, 1, 2);


--
-- TOC entry 5031 (class 0 OID 16568)
-- Dependencies: 235
-- Data for Name: passanger; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.passanger OVERRIDING SYSTEM VALUE VALUES (4, 'Алексеев', 'Вячеслав', 'Николаевич', '1973-11-06', '4519565734');
INSERT INTO public.passanger OVERRIDING SYSTEM VALUE VALUES (5, 'Алексеева', 'Руслана', 'Вячеславовна', '2005-11-30', '4519876534');
INSERT INTO public.passanger OVERRIDING SYSTEM VALUE VALUES (7, 'Алексеева', 'Екатерина', 'Вячеславовна', '2005-11-30', '4519873461');
INSERT INTO public.passanger OVERRIDING SYSTEM VALUE VALUES (8, 'Чувилина', 'Марина', 'Олеговна', '1973-02-27', '4519878656');
INSERT INTO public.passanger OVERRIDING SYSTEM VALUE VALUES (9, 'Мазаев', 'Лев', 'Иванович', '2005-06-05', '45198765321');


--
-- TOC entry 5029 (class 0 OID 16550)
-- Dependencies: 233
-- Data for Name: price; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.price VALUES (100000.00, 1, 1);
INSERT INTO public.price VALUES (60000.00, 1, 2);
INSERT INTO public.price VALUES (20000.00, 1, 3);
INSERT INTO public.price VALUES (200000.00, 3, 1);
INSERT INTO public.price VALUES (120000.00, 3, 2);
INSERT INTO public.price VALUES (40000.00, 3, 3);


--
-- TOC entry 5022 (class 0 OID 16474)
-- Dependencies: 226
-- Data for Name: seats_class; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.seats_class OVERRIDING SYSTEM VALUE VALUES (1, 'First');
INSERT INTO public.seats_class OVERRIDING SYSTEM VALUE VALUES (2, 'Business');
INSERT INTO public.seats_class OVERRIDING SYSTEM VALUE VALUES (3, 'Economy');


--
-- TOC entry 5036 (class 0 OID 16792)
-- Dependencies: 240
-- Data for Name: seats_count; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.seats_count VALUES (1);


--
-- TOC entry 5033 (class 0 OID 16583)
-- Dependencies: 237
-- Data for Name: ticket; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.ticket OVERRIDING SYSTEM VALUE VALUES (4, 'ccc174837b4a4b65ba54', 3, 4, 2);
INSERT INTO public.ticket OVERRIDING SYSTEM VALUE VALUES (7, '660ef1d53ee19ce8b88a', 1, 7, 3);
INSERT INTO public.ticket OVERRIDING SYSTEM VALUE VALUES (8, 'd3a0e5b4dd42c62ac5f8', 3, 8, 1);
INSERT INTO public.ticket OVERRIDING SYSTEM VALUE VALUES (9, 'c5d541eff6e5aa5cc183', 3, 9, 1);


--
-- TOC entry 5043 (class 0 OID 0)
-- Dependencies: 227
-- Name: aircraft_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.aircraft_id_seq', 2, true);


--
-- TOC entry 5044 (class 0 OID 0)
-- Dependencies: 229
-- Name: aircraft_seats_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.aircraft_seats_class_id_seq', 7, true);


--
-- TOC entry 5045 (class 0 OID 0)
-- Dependencies: 238
-- Name: airline_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.airline_id_seq', 2, true);


--
-- TOC entry 5046 (class 0 OID 0)
-- Dependencies: 223
-- Name: airport_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.airport_id_seq', 4, true);


--
-- TOC entry 5047 (class 0 OID 0)
-- Dependencies: 221
-- Name: city_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.city_id_seq', 5, true);


--
-- TOC entry 5048 (class 0 OID 0)
-- Dependencies: 219
-- Name: country_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.country_id_seq', 5, true);


--
-- TOC entry 5049 (class 0 OID 0)
-- Dependencies: 231
-- Name: flight_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.flight_id_seq', 3, true);


--
-- TOC entry 5050 (class 0 OID 0)
-- Dependencies: 234
-- Name: passanger_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.passanger_id_seq', 9, true);


--
-- TOC entry 5051 (class 0 OID 0)
-- Dependencies: 225
-- Name: seats_class_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.seats_class_id_seq', 3, true);


--
-- TOC entry 5052 (class 0 OID 0)
-- Dependencies: 236
-- Name: ticket_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_id_seq', 9, true);


--
-- TOC entry 4827 (class 2606 OID 16494)
-- Name: aircraft aircraft_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft
    ADD CONSTRAINT aircraft_pk PRIMARY KEY (id);


--
-- TOC entry 4831 (class 2606 OID 16508)
-- Name: aircraft_seats_class aircraft_seats_class_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_seats_class
    ADD CONSTRAINT aircraft_seats_class_pk PRIMARY KEY (id);


--
-- TOC entry 4833 (class 2606 OID 16687)
-- Name: aircraft_seats_class aircraft_seats_class_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_seats_class
    ADD CONSTRAINT aircraft_seats_class_unique UNIQUE (aircraft_seats_class_seats_class_fk, aircraft_seats_class_aircraft_fk);


--
-- TOC entry 4829 (class 2606 OID 16496)
-- Name: aircraft aircraft_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft
    ADD CONSTRAINT aircraft_unique UNIQUE (model);


--
-- TOC entry 4851 (class 2606 OID 16699)
-- Name: airline airline_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airline
    ADD CONSTRAINT airline_pk PRIMARY KEY (id);


--
-- TOC entry 4853 (class 2606 OID 16701)
-- Name: airline airline_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airline
    ADD CONSTRAINT airline_unique UNIQUE (name);


--
-- TOC entry 4819 (class 2606 OID 16465)
-- Name: airport airport_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airport
    ADD CONSTRAINT airport_pk PRIMARY KEY (id);


--
-- TOC entry 4821 (class 2606 OID 16467)
-- Name: airport airport_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airport
    ADD CONSTRAINT airport_unique UNIQUE (code);


--
-- TOC entry 4817 (class 2606 OID 16452)
-- Name: city city_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_pk PRIMARY KEY (id);


--
-- TOC entry 4813 (class 2606 OID 16440)
-- Name: country country_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_pk PRIMARY KEY (id);


--
-- TOC entry 4815 (class 2606 OID 16442)
-- Name: country country_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.country
    ADD CONSTRAINT country_unique UNIQUE ("Name");


--
-- TOC entry 4835 (class 2606 OID 16532)
-- Name: flight flight_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT flight_pk PRIMARY KEY (id);


--
-- TOC entry 4837 (class 2606 OID 16534)
-- Name: flight flight_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT flight_unique UNIQUE (flight_num);


--
-- TOC entry 4841 (class 2606 OID 16579)
-- Name: passanger passanger_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.passanger
    ADD CONSTRAINT passanger_pk PRIMARY KEY (id);


--
-- TOC entry 4843 (class 2606 OID 16581)
-- Name: passanger passanger_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.passanger
    ADD CONSTRAINT passanger_unique UNIQUE (passport);


--
-- TOC entry 4839 (class 2606 OID 16683)
-- Name: price price_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_unique UNIQUE (price_flight_fk, price_seats_class_fk);


--
-- TOC entry 4823 (class 2606 OID 16482)
-- Name: seats_class seats_class_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats_class
    ADD CONSTRAINT seats_class_pk PRIMARY KEY (id);


--
-- TOC entry 4825 (class 2606 OID 16484)
-- Name: seats_class seats_class_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seats_class
    ADD CONSTRAINT seats_class_unique UNIQUE ("Class");


--
-- TOC entry 4845 (class 2606 OID 16685)
-- Name: ticket ticket_passanger_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_passanger_unique UNIQUE (ticket_flight_fk, ticket_passanger_fk);


--
-- TOC entry 4847 (class 2606 OID 16591)
-- Name: ticket ticket_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_pk PRIMARY KEY (id);


--
-- TOC entry 4849 (class 2606 OID 16593)
-- Name: ticket ticket_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_unique UNIQUE (ticket_num);


--
-- TOC entry 4867 (class 2620 OID 16799)
-- Name: ticket new_ticket_check; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER new_ticket_check BEFORE INSERT OR UPDATE ON public.ticket FOR EACH ROW EXECUTE FUNCTION public.trigger_new_ticket_check();


--
-- TOC entry 4856 (class 2606 OID 16660)
-- Name: aircraft_seats_class aircraft_seats_class_aircraft_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_seats_class
    ADD CONSTRAINT aircraft_seats_class_aircraft_fk FOREIGN KEY (aircraft_seats_class_aircraft_fk) REFERENCES public.aircraft(id) ON DELETE RESTRICT;


--
-- TOC entry 4857 (class 2606 OID 16665)
-- Name: aircraft_seats_class aircraft_seats_class_seats_class_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.aircraft_seats_class
    ADD CONSTRAINT aircraft_seats_class_seats_class_fk FOREIGN KEY (aircraft_seats_class_seats_class_fk) REFERENCES public.seats_class(id) ON DELETE RESTRICT;


--
-- TOC entry 4855 (class 2606 OID 16617)
-- Name: airport airport_city_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.airport
    ADD CONSTRAINT airport_city_fk FOREIGN KEY (airport_city_fk) REFERENCES public.city(id) ON DELETE RESTRICT;


--
-- TOC entry 4858 (class 2606 OID 16625)
-- Name: flight arrival_airport_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT arrival_airport_fk FOREIGN KEY (arrival_airport_fk) REFERENCES public.airport(id) ON DELETE RESTRICT;


--
-- TOC entry 4854 (class 2606 OID 16611)
-- Name: city city_country_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.city
    ADD CONSTRAINT city_country_fk FOREIGN KEY (country_fk) REFERENCES public.country(id) ON DELETE RESTRICT;


--
-- TOC entry 4859 (class 2606 OID 16630)
-- Name: flight depature_airport_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT depature_airport_fk FOREIGN KEY (departure_airport_fk) REFERENCES public.airport(id) ON DELETE RESTRICT;


--
-- TOC entry 4860 (class 2606 OID 16635)
-- Name: flight flight_aircraft_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT flight_aircraft_fk FOREIGN KEY (flight_aircraft_fk) REFERENCES public.aircraft(id) ON DELETE RESTRICT;


--
-- TOC entry 4861 (class 2606 OID 16703)
-- Name: flight flight_airline_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.flight
    ADD CONSTRAINT flight_airline_fk FOREIGN KEY (flight_airline_fk) REFERENCES public.airline(id) ON DELETE RESTRICT;


--
-- TOC entry 4862 (class 2606 OID 16672)
-- Name: price price_flight_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_flight_fk FOREIGN KEY (price_flight_fk) REFERENCES public.flight(id) ON DELETE RESTRICT;


--
-- TOC entry 4863 (class 2606 OID 16677)
-- Name: price price_seats_class_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.price
    ADD CONSTRAINT price_seats_class_fk FOREIGN KEY (price_seats_class_fk) REFERENCES public.seats_class(id) ON DELETE RESTRICT;


--
-- TOC entry 4864 (class 2606 OID 16653)
-- Name: ticket ticket_flight_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_flight_fk FOREIGN KEY (ticket_flight_fk) REFERENCES public.flight(id) ON DELETE RESTRICT;


--
-- TOC entry 4865 (class 2606 OID 16648)
-- Name: ticket ticket_passanger_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_passanger_fk FOREIGN KEY (ticket_passanger_fk) REFERENCES public.passanger(id) ON DELETE RESTRICT;


--
-- TOC entry 4866 (class 2606 OID 16643)
-- Name: ticket ticket_seats_class_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket
    ADD CONSTRAINT ticket_seats_class_fk FOREIGN KEY (ticket_seats_class_fk) REFERENCES public.seats_class(id) ON DELETE RESTRICT;


-- Completed on 2026-04-22 20:54:25

--
-- PostgreSQL database dump complete
--

\unrestrict M7EXCHBwIFcU0WyF0t84cS1yu10zbFhpBQwwPdDFyo8Jk4nNDyG0qx8ih9ayW0c

