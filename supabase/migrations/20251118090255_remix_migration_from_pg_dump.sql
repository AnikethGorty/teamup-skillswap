--
-- PostgreSQL database dump
--


-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.7

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
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--



SET default_table_access_method = heap;

--
-- Name: colleges; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.colleges (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    location text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.events (
    eventid uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    date timestamp with time zone,
    location text,
    created_by uuid NOT NULL,
    joined_by_individuals uuid[] DEFAULT '{}'::uuid[],
    joined_by_teams uuid[] DEFAULT '{}'::uuid[],
    max_participants integer,
    registration_deadline timestamp with time zone,
    status text DEFAULT 'open'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: friends; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.friends (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    friend_id uuid NOT NULL,
    status text DEFAULT 'pending'::text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: studentdetails; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.studentdetails (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    college_id uuid,
    year integer,
    branch text,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: teams; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.teams (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text NOT NULL,
    created_by uuid NOT NULL,
    members uuid[] DEFAULT '{}'::uuid[],
    description text,
    location text,
    deadline timestamp with time zone,
    skills text[] DEFAULT '{}'::text[],
    neededroles text[] DEFAULT '{}'::text[],
    tags text[] DEFAULT '{}'::text[],
    type text DEFAULT 'custom'::text,
    difficulty text DEFAULT 'medium'::text,
    event_id uuid,
    createdat timestamp with time zone DEFAULT now()
);


--
-- Name: colleges colleges_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.colleges
    ADD CONSTRAINT colleges_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (eventid);


--
-- Name: friends friends_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_pkey PRIMARY KEY (id);


--
-- Name: friends friends_user_id_friend_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.friends
    ADD CONSTRAINT friends_user_id_friend_id_key UNIQUE (user_id, friend_id);


--
-- Name: studentdetails studentdetails_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studentdetails
    ADD CONSTRAINT studentdetails_email_key UNIQUE (email);


--
-- Name: studentdetails studentdetails_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studentdetails
    ADD CONSTRAINT studentdetails_pkey PRIMARY KEY (id);


--
-- Name: studentdetails studentdetails_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studentdetails
    ADD CONSTRAINT studentdetails_user_id_key UNIQUE (user_id);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: studentdetails studentdetails_college_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.studentdetails
    ADD CONSTRAINT studentdetails_college_id_fkey FOREIGN KEY (college_id) REFERENCES public.colleges(id);


--
-- Name: colleges Anyone can view colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view colleges" ON public.colleges FOR SELECT USING (true);


--
-- Name: events Anyone can view events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view events" ON public.events FOR SELECT USING (true);


--
-- Name: teams Anyone can view teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Anyone can view teams" ON public.teams FOR SELECT USING (true);


--
-- Name: colleges Authenticated users can create colleges; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create colleges" ON public.colleges FOR INSERT WITH CHECK ((auth.uid() IS NOT NULL));


--
-- Name: events Authenticated users can create events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create events" ON public.events FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: teams Authenticated users can create teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT WITH CHECK ((auth.uid() = created_by));


--
-- Name: events Event creators can delete their events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Event creators can delete their events" ON public.events FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: events Event creators can update their events; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Event creators can update their events" ON public.events FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: teams Team creators can delete their teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team creators can delete their teams" ON public.teams FOR DELETE USING ((auth.uid() = created_by));


--
-- Name: teams Team creators can update their teams; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team creators can update their teams" ON public.teams FOR UPDATE USING ((auth.uid() = created_by));


--
-- Name: teams Team members can update team they belong to; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Team members can update team they belong to" ON public.teams FOR UPDATE USING ((auth.uid() = ANY (members)));


--
-- Name: friends Users can create friend requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can create friend requests" ON public.friends FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: friends Users can delete their friendships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can delete their friendships" ON public.friends FOR DELETE USING (((auth.uid() = user_id) OR (auth.uid() = friend_id)));


--
-- Name: studentdetails Users can insert their own details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can insert their own details" ON public.studentdetails FOR INSERT WITH CHECK ((auth.uid() = user_id));


--
-- Name: events Users can update events they join; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update events they join" ON public.events FOR UPDATE USING ((auth.uid() = ANY (joined_by_individuals)));


--
-- Name: friends Users can update their friend requests; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their friend requests" ON public.friends FOR UPDATE USING (((auth.uid() = user_id) OR (auth.uid() = friend_id)));


--
-- Name: studentdetails Users can update their own details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can update their own details" ON public.studentdetails FOR UPDATE USING ((auth.uid() = user_id));


--
-- Name: studentdetails Users can view their own details; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own details" ON public.studentdetails FOR SELECT USING ((auth.uid() = user_id));


--
-- Name: friends Users can view their own friendships; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "Users can view their own friendships" ON public.friends FOR SELECT USING (((auth.uid() = user_id) OR (auth.uid() = friend_id)));


--
-- Name: colleges; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.colleges ENABLE ROW LEVEL SECURITY;

--
-- Name: events; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

--
-- Name: friends; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

--
-- Name: studentdetails; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.studentdetails ENABLE ROW LEVEL SECURITY;

--
-- Name: teams; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

--
-- PostgreSQL database dump complete
--


