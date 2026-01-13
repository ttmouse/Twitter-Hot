--
-- PostgreSQL database dump
--

\restrict bYje0PJVaCwONpIO4fsDB1AdI4TMrE5xele9ZybwV2t6DnBObqCeLiwrXIJHWMx

-- Dumped from database version 15.15
-- Dumped by pg_dump version 15.15

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

DROP INDEX IF EXISTS public.idx_tweets_publish_date;
ALTER TABLE IF EXISTS ONLY public.tweets DROP CONSTRAINT IF EXISTS tweets_tweet_id_key;
ALTER TABLE IF EXISTS ONLY public.tweets DROP CONSTRAINT IF EXISTS tweets_pkey;
ALTER TABLE IF EXISTS ONLY public.daily_tweets DROP CONSTRAINT IF EXISTS daily_tweets_pkey;
ALTER TABLE IF EXISTS public.tweets ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE IF EXISTS public.tweets_id_seq;
DROP TABLE IF EXISTS public.tweets;
DROP TABLE IF EXISTS public.daily_tweets;
SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: daily_tweets; Type: TABLE; Schema: public; Owner: twitteruser
--

CREATE TABLE public.daily_tweets (
    date character varying(10) NOT NULL,
    urls jsonb NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.daily_tweets OWNER TO twitteruser;

--
-- Name: tweets; Type: TABLE; Schema: public; Owner: twitteruser
--

CREATE TABLE public.tweets (
    id integer NOT NULL,
    tweet_id character varying(50) NOT NULL,
    publish_date date NOT NULL,
    content text,
    media_urls jsonb,
    author jsonb,
    tags text[],
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    hierarchical_categories jsonb,
    flat_tags jsonb
);


ALTER TABLE public.tweets OWNER TO twitteruser;

--
-- Name: tweets_id_seq; Type: SEQUENCE; Schema: public; Owner: twitteruser
--

CREATE SEQUENCE public.tweets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.tweets_id_seq OWNER TO twitteruser;

--
-- Name: tweets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: twitteruser
--

ALTER SEQUENCE public.tweets_id_seq OWNED BY public.tweets.id;


--
-- Name: tweets id; Type: DEFAULT; Schema: public; Owner: twitteruser
--

ALTER TABLE ONLY public.tweets ALTER COLUMN id SET DEFAULT nextval('public.tweets_id_seq'::regclass);


--
-- Data for Name: daily_tweets; Type: TABLE DATA; Schema: public; Owner: twitteruser
--

COPY public.daily_tweets (date, urls, created_at) FROM stdin;
\.


--
-- Data for Name: tweets; Type: TABLE DATA; Schema: public; Owner: twitteruser
--

COPY public.tweets (id, tweet_id, publish_date, content, media_urls, author, tags, created_at, hierarchical_categories, flat_tags) FROM stdin;
2542	2010739704451449124	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "mattiapomelli", "screen_name": "mattiapomelli"}	{}	2026-01-12 22:49:39.09613	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["golf app UI", "country club aesthetic", "forest green accents", "serif typography", "pill-shaped buttons", "minimalist design", "data visualizations", "premium look"]
2556	2010728821012705650	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-13 15:43:19.258364	\N	\N
2558	2010665188731785382	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-13 15:43:19.258364	\N	\N
2559	2010636571373191411	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-13 15:43:19.258364	\N	\N
2560	2010792659489579086	2026-01-13	Added via extension on 2026-01-13	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-13 15:43:19.258364	\N	\N
2561	2010757162591797304	2026-01-13	Added via extension on 2026-01-13	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-13 15:43:19.258364	\N	\N
2562	2010755954430578688	2026-01-13	Added via extension on 2026-01-13	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-13 15:43:19.258364	\N	\N
2563	2010742611301044478	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-13 15:43:19.258364	\N	\N
2564	2010731794820444198	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-13 15:43:19.258364	\N	\N
2565	2010718374905663779	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-13 15:43:19.258364	\N	\N
2566	2010699944714248591	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-13 15:43:19.258364	\N	\N
2567	2010682689633046534	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-13 15:43:19.258364	\N	\N
2568	2010667124713468103	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-13 15:43:19.258364	\N	\N
2569	2010646848055529850	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-13 15:43:19.258364	\N	\N
2571	2010584466268573907	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-13 15:43:19.258364	\N	\N
2572	2010569426119082336	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-13 15:43:19.258364	\N	\N
2573	2010524630994596088	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "AztecaAlpaca", "screen_name": "AztecaAlpaca"}	{}	2026-01-13 15:43:19.258364	\N	\N
2574	2010497574872940552	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-13 15:43:19.258364	\N	\N
2576	2010466698030363048	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-13 15:43:19.258364	\N	\N
2577	2010446114164744676	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-13 15:43:19.258364	\N	\N
2543	2010723494934507605	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 22:49:49.092721	{"人物肖像": ["现实主义"], "艺术与幻想": ["抽象/实验"]}	["marble sculpture", "Greco-Roman style", "chiseled features", "stone veins", "museum lighting", "timeless aesthetic", "cinematic realism", "shallow depth"]
2578	2010721038947266724	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Adam38363368936", "screen_name": "Adam38363368936"}	{}	2026-01-13 15:48:53.665934	\N	\N
2465	2010381897730339152	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 19:49:28.946569	{"产品与营销": ["包装设计", "食物广告", "成分可视化"]}	["juice boxes", "fruit flavors", "vibrant packaging", "splashes and cubes", "gradient backgrounds", "photorealistic texture", "commercial promotion", "appetizing scene"]
1337	2008071853928226867	2026-01-05	Migrated from 2026-01-05	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "可视化与分解": ["浮动构图"]}	["hand holding product", "close-up shot", "slender fingers", "nude pink nails", "minimalist background", "soft sidelight", "8K UHD", "professional photography"]
1332	2008225751238132144	2026-01-05	Migrated from 2026-01-06	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实", "抽象/实验"]}	["frosted crystal", "ice crystals", "sparkling snowflakes", "ethereal beauty", "winter scene", "cool shades", "magical atmosphere", "cinematic render"]
1333	2008319307667644815	2026-01-05	Migrated from 2026-01-06	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "视频与动态": ["动画效果"]}	["film still", "cinematic lighting", "shallow depth", "anamorphic glass", "volumetric light", "desaturated palette", "dramatic side lighting", "movie scene"]
1334	2008425387999801451	2026-01-06	Migrated from 2026-01-06	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["小红书风格"], "可视化与分解": ["教育图表"]}	["知识卡片", "汉字学习", "Apple美学", "玻璃拟态", "极简设计", "儿童教育", "打卡使用", "自定义形状"]
1335	2008064205925335435	2026-01-05	Migrated from 2026-01-06	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic"]}	["PPT生成", "Apple风格", "主题系统", "动态调整", "中文输出", "高端设计", "自适应颜色", "商用模板"]
1336	2008351247565476336	2026-01-06	Migrated from 2026-01-06	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["历史海报", "Apple美学", "玻璃拟态", "4K高清", "领域定制", "关键词高亮", "留白设计", "社交适配"]
1331	2008508944923213879	2026-01-06	Migrated from 2026-01-06	[]	{"name": "xiaojietongxue", "screen_name": "xiaojietongxue"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "艺术与幻想": ["Chibi风格"]}	["奶凶玩偶", "needle felted", "chubby body", "fluffy wool", "adorable tough", "toy weapon", "macro photography", "minimalist composition"]
2544	2010661146349756814	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-13 05:23:37.741395	{"人物肖像": ["性感/时尚", "工作室肖像"]}	["editorial portrait", "direct flash", "moody contrast", "wispy hair", "oversized t-shirt", "concrete wall", "natural sheen", "candid expression"]
2468	2010497572704501766	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 19:59:36.71558	{"产品与营销": ["小红书风格"], "艺术与幻想": ["信息图/Infographic", "卡通/插图"]}	["小红书风格", "infographic series", "AI prompt", "hand-drawn text", "cartoon elements", "educational visualization", "moody color palette"]
1373	2006748750329663751	2026-01-01	Migrated from 2026-01-03	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"可视化与分解": ["信息图/Infographic", "教育图表"]}	["restoration chronicle", "documentation board", "forensic annotations", "split view", "museum lighting", "archival amber", "linen texture", "conservation record"]
1372	2006771650805870768	2026-01-01	Migrated from 2026-01-03	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["治愈/梦幻"], "艺术与幻想": ["抽象/实验"]}	["moss terrarium", "miniature subject", "bioluminescent glow", "morning dew", "forest greens", "fairy-tale scale", "diffused daylight", "warm amber"]
1371	2007023177915126034	2026-01-02	Migrated from 2026-01-03	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	{"幽默与Meme": ["搞笑场景"], "艺术与幻想": ["动漫/Kawaii", "Chibi风格"]}	["bioluminescent animal", "kawaii chibi", "neon backlit", "3D cartoon", "big bright eyes", "high definition", "mood boosting", "cute creatures"]
1370	2006795197087207618	2026-01-01	Migrated from 2026-01-03	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计", "广告/海报"]}	["branded gifts", "Christmas tree boxes", "hand-drawn illustration", "marker sketch", "duotone palette", "minimalist design", "typography match", "holiday postcard"]
1366	2006921734092632261	2026-01-02	Migrated from 2026-01-03	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计"], "艺术与幻想": ["抽象/实验"]}	["wooden miniature", "hand-carved", "knife marks", "natural grain", "workshop table", "carving tools", "warm lighting", "3D figurine"]
1367	2006821478378123282	2026-01-01	Migrated from 2026-01-03	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["抽象/实验"], "可视化与分解": ["浮动构图"]}	["city brush", "impasto painting", "3D bas-relief", "flag colors", "top-down view", "textured paper", "hyper-realistic", "HDR poster"]
1368	2006940436401893752	2026-01-02	Migrated from 2026-01-03	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "产品摄影"]}	["conceptual ad", "visual metaphor", "unexpected scenario", "cinematic lighting", "dynamic composition", "premium aesthetic", "aspirational mood", "brand value"]
1369	2006983853542396412	2026-01-02	Migrated from 2026-01-03	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["抽象/实验"]}	["origami diorama", "folded paper", "textured colors", "miniature ecosystem", "depth dimension", "wildlife scene", "craft art", "ecosystem render"]
1380	2007158516289802568	2026-01-02	Migrated from 2026-01-03	[]	{"name": "avstudiosng", "screen_name": "avstudiosng"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"]}	["product mockup", "multiple angles", "different environments", "aesthetic reference", "4K resolution", "polished output", "logo editing", "AI workflow"]
2546	2010681413562155183	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-13 05:23:55.929344	{"产品与营销": ["产品摄影", "食物广告", "成分可视化"], "可视化与分解": ["成分环绕", "成分悬浮", "浮动构图"]}	["energy drink", "exploded view", "fruit splash", "motion blur", "volumetric light", "frozen action", "metallic can", "vibrant colors"]
2475	2010426555843871121	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"产品与营销": ["产品摄影", "时尚品牌", "广告/海报"], "可视化与分解": ["浮动构图"]}	["sport jersey", "floating garment", "high-end editorial", "studio photography", "brand identity", "textured fabric", "minimalist background", "dynamic angle"]
2476	2010381168810799353	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"产品与营销": ["产品摄影", "奢华护肤", "广告/海报"]}	["skincare serum", "amber bottle", "tropical flowers", "driftwood perch", "cinematic lighting", "condensation droplets", "warm tones", "moody editorial"]
2471	2010681777916919904	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"人物肖像": ["名人/现实主义", "工作室肖像", "性感/时尚"]}	["celebrity portraits", "black and white", "cinematic fashion", "moody intensity", "wet hair look", "leather jacket", "direct gaze", "high contrast"]
2477	2010561029164666960	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"人物肖像": ["个人品牌", "工作室肖像", "身份编辑"]}	["self portrait", "poster holding", "artistic reinterpretation", "neutral background", "confident smile", "studio lighting", "personal branding", "cinematic realism"]
2474	2010441065829171323	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"人物肖像": ["自定义角色"], "艺术与幻想": ["卡通/插图"]}	["real vs cartoon", "self-reflection", "urban portrait", "mixed media", "identity theme", "64K resolution", "cinematic realism", "Octane render"]
2478	2010360321500668088	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"自然与环境": ["治愈/梦幻"], "视频与动态": ["动画效果"]}	["relaxing Sunday", "bioluminescent vine", "kawaii style", "neon backlit", "3D cartoon", "big eyes", "high definition", "mood boosting"]
2472	2010352967623590154	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"人物肖像": ["自定义角色"], "艺术与幻想": ["科幻/超现实"]}	["miniature painting", "Cristiano Ronaldo", "football figurine", "hyper realistic", "cinematic scene", "soft lighting", "shallow DoF", "editorial mood"]
2470	2010395214087897489	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"产品与营销": ["产品摄影", "广告/海报"]}	["coffee branding", "lifestyle photo", "manual grinder", "morning sunlight", "realistic imperfections", "e-commerce style", "hard shadows", "shallow DoF"]
2479	2010403834699685983	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"产品与营销": ["产品摄影", "食物广告"]}	["cocktail visuals", "high-angle shot", "summery atmosphere", "palm shadows", "condensation droplets", "8K resolution", "professional garnish", "vacation vibe"]
2548	2010747296066224518	2026-01-13	Added via extension on 2026-01-13	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-13 05:24:25.246726	{"艺术与幻想": ["动漫/Kawaii"], "视频与动态": ["文本到视频", "动画效果"]}	["One Piece character", "Nico Robin", "anime style", "dynamic animation", "video generation", "face reference", "cinematic motion", "fantasy portrait"]
2480	2010615081491677185	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:02:45.455211	{"产品与营销": ["广告/海报"], "艺术与幻想": ["科幻/超现实"]}	["surreal Pepsi pour", "broken screen", "liquid splash", "JSON prompt", "photorealistic composite", "winter variant", "playful mood", "high realism"]
2549	2010331238083567964	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "joshesye", "screen_name": "joshesye"}	{}	2026-01-13 05:24:26.0286	{"人物肖像": ["性感/时尚"], "产品与营销": ["时尚品牌"]}	["韩系甜酷风", "pink coat", "crouching pose", "studio lighting", "high contrast", "black lace stockings", "airy bangs", "minimalist backdrop"]
2481	2010622680358412371	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 20:03:02.40598	{"艺术与幻想": ["Chibi风格", "卡通/插图", "动漫/Kawaii"]}	["chibi character", "3D cartoon", "Polaroid frame", "football jersey", "coffee cup", "cozy cafe", "Pixar quality", "playful premium"]
1523	2004012045143101808	2025-12-25	Migrated from 2025-12-26	[]	{"name": "yanhua1010", "screen_name": "yanhua1010"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "小红书风格"]}	["电商KV", "商品扩展", "极简系统", "中英双语", "细节特写", "玻璃拟态", "品牌调性", "AI生成"]
1527	2004201069669446019	2025-12-25	Migrated from 2025-12-26	[]	{"name": "FitzGPT", "screen_name": "FitzGPT"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "艺术与幻想": ["科幻/超现实"]}	["angel devil", "shoulder figures", "realistic copy", "discussion pose", "good vs evil", "single sentence prompt", "nano banana", "humorous contrast"]
1528	2003850692302086265	2025-12-24	Migrated from 2025-12-26	[]	{"name": "CharaspowerAI", "screen_name": "CharaspowerAI"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["卡通/插图"]}	["christmas art", "glowing lines", "digital illustration", "cartoon style", "high resolution", "studio lighting", "festive elements", "mysterious atmosphere"]
1529	2004219626897465419	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "时尚品牌"]}	["brand ad", "architectural frames", "fashion poses", "premium styling", "studio lighting", "photorealistic", "editorial alignment", "high contrast"]
1530	2004296341439262996	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	{"幽默与Meme": ["混合/编辑"], "艺术与幻想": ["抽象/实验"]}	["matchbox scene", "crime diorama", "miniature evidence", "weathered box", "rain-slicked street", "smoking gun", "blood-stained letter", "story relevant"]
1532	2003568395611238738	2025-12-23	Migrated from 2025-12-25	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"]}	["crystal ball", "t-rexes inside", "misty light", "ancient pedestal", "dark background", "golden glow", "intricate details", "high definition"]
1533	2003602912824717588	2025-12-23	Migrated from 2025-12-25	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["治愈/梦幻"], "艺术与幻想": ["科幻/超现实"]}	["reindeer character", "fantasy landscape", "light antlers", "dreamy scene", "AI generated", "story illustration", "ethereal lighting", "magical vibe"]
1534	2003826465054589261	2025-12-24	Migrated from 2025-12-25	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计"]}	["holographic logo", "iridescent colors", "prism reflections", "futuristic design", "minimal background", "high-tech identity", "light diffraction", "next-gen brand"]
1535	2004107115166908446	2025-12-25	Migrated from 2025-12-25	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["抽象/实验"]}	["nail art", "tiny painter", "masterpiece recreation", "hyper-realistic", "macro photography", "fingernail canvas", "intricate details", "blurred background"]
1537	2003960376766222356	2025-12-24	Migrated from 2025-12-25	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "可视化与分解": ["成分环绕", "浮动构图"]}	["sand particles swirl", "desert wind effect", "golden lighting", "gritty texture", "dynamic capture", "rugged durability", "elemental power", "studio photography"]
1538	2004015740329017641	2025-12-25	Migrated from 2025-12-25	[]	{"name": "itis_Jarvo33", "screen_name": "itis_Jarvo33"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "可视化与分解": ["成分悬浮", "浮动构图"]}	["AR music cards", "Spotify UI", "levitating interfaces", "3D spatial composition", "cinematic realism", "urban street background", "glowing borders", "depth variation"]
1539	2004015556777955380	2025-12-25	Migrated from 2025-12-25	[]	{"name": "ss_uulq09", "screen_name": "ss_uulq09"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚"]}	["relationship quote", "good morning greeting", "understanding theme", "romantic couple", "soft focus", "inspirational text", "heart emoji", "positive vibe"]
1540	2004041725074088251	2025-12-25	Migrated from 2025-12-25	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"], "可视化与分解": ["教育图表"]}	["miniature city", "object civilization", "tiny inhabitants", "photorealistic details", "cinematic perspective", "storytelling depth", "soft daylight", "lived-in texture"]
2550	2010633643946123477	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "drzubi01", "screen_name": "drzubi01"}	{}	2026-01-13 05:24:45.835699	{"人物肖像": ["现实主义", "工作室肖像", "个人品牌"]}	["studio portrait", "cinematic lighting", "black turtleneck", "confident expression", "deep maroon background", "ultra-sharp focus", "natural skin texture", "premium photography"]
2552	2010443344921432150	2026-01-13	\N	\N	{"id": "AllaAisling"}	\N	2026-01-13 12:40:44.750119	{"产品与营销": ["产品摄影"], "可视化与分解": ["成分环绕", "成分悬浮", "浮动构图"]}	["ingredient orbit", "solar system composition", "product showcase", "gradient background", "floating elements", "relationship visualization", "clean arrangement", "AI photography"]
2553	2010589443774964031	2026-01-13	\N	\N	{"id": "aleenaamiir"}	\N	2026-01-13 12:40:44.750119	{"产品与营销": ["食物广告", "产品摄影"], "可视化与分解": ["浮动构图"]}	["food hero shot", "floating composition", "high-key lighting", "minimalist layout", "garnishes suspended", "photorealistic macro", "luxury branding", "crisp shadows"]
2489	2010496742727500077	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"]}	["AI prompts", "photo upload", "surreal scenes", "hyper-realistic", "cinematic shots", "creative visuals", "prompt collection", "image generation"]
2485	2002016072405328107	2025-12-19	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["包装设计"]}	["wood carved packaging", "tea box design", "high-relief varnish", "detailed illustration", "macro photography", "natural texture", "premium branding", "AI generated"]
2491	2009106868191547477	2026-01-08	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["性感/时尚"]}	["low angle selfie", "kawaii bedroom", "Japanese student", "black camisole", "confident smile", "fairy lights", "pastel pink", "worm's-eye view"]
2484	2005287243750011091	2025-12-28	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["工作室肖像"]}	["portfolio images", "cinematic angles", "low angle power", "high angle introspective", "Dutch angle tension", "realistic lighting", "depth of field", "professional quality"]
2487	2007981154008478122	2026-01-05	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"]}	["infographic examples", "design prompts", "Nano Banana Pro", "visual styles", "prompt sharing", "AI design", "creative resources", "detailed specifications"]
2488	2010350005870276897	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"可视化与分解": ["成分环绕", "解剖/生物"]}	["exploded view", "inner mechanics", "product advertising", "white background", "macro photography", "ultra realistic", "soft shadow", "high-end commercial"]
2494	2008980993231999163	2026-01-08	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["广告/海报"]}	["poster design", "tribute layout", "photo grid", "creative composition", "minimalist style", "high resolution", "visual storytelling", "premium aesthetic"]
2495	2010305720764551520	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["食物广告"], "可视化与分解": ["成分悬浮", "教育图表"]}	["exploded infographic", "food composition", "levitating layers", "studio lighting", "macro detail", "premium photography", "text labels", "8K quality"]
2554	2010814666331869283	2026-01-13	Added via extension on 2026-01-13	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-13 13:31:49.399997	{"艺术与幻想": ["科幻/超现实", "抽象/实验"]}	["cinematic frames", "action energy", "sports dynamic", "motion blur", "dramatic backlight", "freeze frame", "intense expression", "explosive motion"]
2512	2005216602229506253	2025-12-28	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["名人/现实主义", "工作室肖像"]}	["Ana de Armas", "camera shots", "hyper-realistic", "wavy hair", "neutral background", "direct gaze", "soft lighting", "portrait photography"]
2519	2002320492548722766	2025-12-20	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["名人/现实主义"], "艺术与幻想": ["科幻/超现实"]}	["Cristiano Ronaldo", "stadium selfie", "crowd background", "yellow jersey", "confident smile", "photorealistic", "sports vibe", "night lighting"]
2521	2007738030455693597	2026-01-04	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "产品与营销": ["产品摄影", "广告/海报"]}	["AI workflow", "product visuals", "automated generation", "Airtable integration", "N8N automation", "scroll-stopping ads", "brand consistency", "performance tracking"]
2523	2003291471689187744	2025-12-23	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"艺术与幻想": ["抽象/实验"], "可视化与分解": ["信息图/Infographic"]}	["game sprites", "building assets", "isometric view", "pixel art style", "urban elements", "modular design", "AI generated", "development tool"]
2507	2006993215736655946	2026-01-02	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "可视化与分解": ["教育图表"]}	["whiteboard simulation", "handwritten notes", "iPhone photo", "lecture content", "erased remnants", "color hierarchy", "academic style", "photorealistic capture"]
2505	2010098987735671074	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["性感/时尚", "工作室肖像"]}	["late-night stretch", "French tips", "silver-grey bodysuit", "denim shorts", "blonde hair", "arms raised", "warm lighting", "cozy interior"]
2510	2010327295295385920	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"]}	["prompt site", "design prompts", "grid display", "full-text search", "AI generation", "smartphone compatible", "Veco prompts", "Kawai prompts"]
2511	2009552136657658125	2026-01-09	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["自定义角色"], "艺术与幻想": ["动漫/Kawaii"]}	["low-angle view", "kawaii bedroom", "Japanese student", "black camisole", "confident smile", "fairy lights", "pastel pink", "plush toy"]
2516	2007801456896925991	2026-01-04	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"可视化与分解": ["信息图/Infographic", "教育图表"]}	["sketchnotes prompt", "hand-drawn style", "visual summary", "colored markers", "doodles icons", "brainstorming layout", "A4 format", "learning aid"]
2518	2002008038178533653	2025-12-19	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["性感/时尚"]}	["bedroom selfie", "pink lounge set", "prone pose", "white socks", "rumpled sheets", "natural daylight", "gentle smile", "cozy domestic"]
2503	2003849723837616489	2025-12-24	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["包装设计"], "可视化与分解": ["成分悬浮"]}	["packaging dieline", "flattened template", "die-cut lines", "fold lines", "texture mapping", "print-ready", "orthographic view", "production quality"]
2509	2009280909506183453	2026-01-08	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报"]}	["AI content factory", "TikTok Shop", "automated profiles", "viral repurposing", "UGC visuals", "affiliate posting", "MPS approach", "GMV compounding"]
2500	2009720121695363166	2026-01-10	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报"]}	["AI automation", "content repurposing", "niche research", "shoppable videos", "phone posting", "tech stack", "viral scripts", "low CPM"]
2522	2010192511080276098	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["名人/现实主义"]}	["Ana de Armas", "outdoor terrace", "golden hour", "three-quarter turn", "voluminous hair", "vibrant greenery", "upscale setting", "hyper-realistic"]
2504	2001085961414041936	2025-12-17	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"艺术与幻想": ["Chibi风格", "卡通/插图"]}	["chibi transformation", "oversized head", "sparkling eyes", "cheerful expression", "pastel shading", "collectible mascot", "simplified details", "irresistibly charming"]
2530	2002329901022499040	2025-12-20	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"]}	["Nano Banana tutorial", "image to JSON", "prompt editing", "Gemini analysis", "custom modifications", "Homer Simpson", "money bed", "AI workflow"]
2536	2010370230158290975	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["工作室肖像", "个人品牌"]}	["business portrait", "professional attire", "gradient background", "facial consistency", "executive style", "soft lighting", "ultra realistic", "corporate headshot"]
1541	2003942668410241196	2025-12-24	Migrated from 2025-12-25	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic"]}	["AI revolution analysis", "historical analogies", "Notion founder article", "organizational transformation", "knowledge economy", "steam steel metaphor", "infinite brains", "Chinese translation"]
1542	2003993639715066249	2025-12-25	Migrated from 2025-12-25	[]	{"name": "Ibrahim56072637", "screen_name": "Ibrahim56072637"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["伦理/争议"]}	["good morning greeting", "happy Thursday", "positive message", "smile inspiration", "daily motivation", "X creator community", "festive vibe", "warm wishes"]
1543	2004088874684043595	2025-12-25	Migrated from 2025-12-25	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义", "工作室肖像"], "可视化与分解": ["成分环绕", "解剖/生物", "教育图表"]}	["character deconstruction", "Pixar style", "3D rendering", "knolling layout", "item explosion", "PBR materials", "fashion atelier", "beauty collection"]
1544	2004030710110408884	2025-12-25	Migrated from 2025-12-25	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "可视化与分解": ["成分悬浮"]}	["AR playlist", "floating music cards", "Indian street market", "night scene", "cinematic 8K", "cool palette", "depth field", "vibrant artwork"]
1556	2004110025313411479	2025-12-25	Migrated from 2025-12-25	[]	{"name": "JefferyTatsuya", "screen_name": "JefferyTatsuya"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["PPT templates", "design resources", "business slides", "Japanese examples", "high-level cases", "minimalist layouts", "data visualization", "professional decks"]
1557	2003836511565815965	2025-12-24	Migrated from 2025-12-25	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计", "产品摄影", "小红书风格"]}	["fruit skin packaging", "Japanese style", "kiwi texture", "minimalist poster", "wabi-sabi aesthetic", "photorealistic render", "natural materials", "editorial design"]
1238	2010290781819695350	2026-01-11	Migrated from 2026-01-11	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "食物广告"], "视频与动态": ["动画效果"]}	["bursting can", "ocean splash", "levitating fruits", "tropical flowers", "sun flare", "vibrant colors", "cinematic backlighting", "8K resolution"]
1536	2003935191610634704	2025-12-24	Migrated from 2025-12-25	[]	{"name": "sodaguyx", "screen_name": "sodaguyx"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "艺术与幻想": ["抽象/实验"]}	["noisy textures", "4K resolution", "design resources", "grainy patterns", "visual overlays", "creative assets", "high-quality backgrounds", "project enhancement"]
2497	2010399715951809003	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["自定义角色"]}	["portfolio figurines", "miniature realistic", "creative agency", "isometric style", "full-body pose", "white background", "custom actions", "high resolution"]
2528	2008434066706551014	2026-01-06	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["名人/现实主义", "工作室肖像"]}	["celebrity fusion", "hyper-realistic", "cinematic portrait", "natural makeup", "off-shoulder top", "diamond necklace", "soft lighting", "8K RAW"]
2520	2007523056822939698	2026-01-04	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"可视化与分解": ["信息图/Infographic", "教育图表"]}	["landmark infographic", "blueprint overlay", "technical annotations", "chalk sketches", "structural data", "cross-sections", "educational visual", "photograph base"]
2524	2008554218617962787	2026-01-06	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报"]}	["AI content factory", "TikTok Shop", "educational hooks", "UGC style", "automated posting", "viral scripts", "affiliate accounts", "low CPM"]
2526	2008305371606085887	2026-01-06	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"可视化与分解": ["教育图表"]}	["AI roadmap", "learning path", "fundamentals", "LLM integration", "portfolio projects", "agentic framework", "RAG techniques", "high-paying job"]
2539	2008922555374067799	2026-01-07	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报", "小红书风格"]}	["AI influencer", "TikTok girls", "content factory", "viral reels", "friendly vibe", "educational hooks", "sales generation", "ecom guide"]
2535	2003400004044751176	2025-12-23	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["UI design", "Gemini vs ChatGPT", "app interface", "minimalist UX", "prompt comparison", "premium aesthetic", "visual hierarchy", "serif typography"]
2533	2000215258011451664	2025-12-14	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "艺术与幻想": ["动漫/Kawaii", "Chibi风格"]}	["Midjourney + NBP", "real world recreation", "cartoon to realistic", "group portrait", "casual outfits", "playful expressions", "vibrant colors", "fun combo"]
2540	2010441664553259317	2026-01-12	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic"]}	["JSON prompt", "monk teaching", "surreal scene", "spiritual courtyard", "cinematic lighting", "iPhone shot", "serene mood", "detailed setting"]
2541	2009214427074318501	2026-01-08	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"其他/实验": ["工具比较"], "艺术与幻想": ["动漫/Kawaii"], "可视化与分解": ["解剖/生物"]}	["kigurumi head", "AI workflow", "standee to model", "hunyuan3d", "正面照", "head shell", "GLB file", "探索精神"]
2537	2008887656839864763	2026-01-07	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["自定义角色", "工作室肖像"], "其他/实验": ["工具比较"]}	["character consistency", "GMI Studio workflow", "Nano Banana Pro", "multiple scenes", "fashion outfits", "cinematic portraits", "自动化生成", "beta access"]
2532	2000845183257292883	2025-12-16	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["广告/海报", "产品摄影"], "可视化与分解": ["成分环绕", "浮动构图"]}	["ad campaign grid", "3x3 layout", "premium aesthetic", "hyperreal visuals", "product consistency", "editorial luxury", "sensory marketing", "cinematic polish"]
2531	2000614012422136108	2025-12-16	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["包装设计"], "可视化与分解": ["信息图/Infographic"]}	["dark metallic logos", "3D object", "cinematic bloom", "film grain", "shallow DoF", "chrome texture", "infinite void", "premium rendering"]
1553	2004123403008258550	2025-12-25	Migrated from 2025-12-25	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "小红书风格"], "视频与动态": ["动画效果", "产品旋转"]}	["Christmas edition", "AI studio tool", "festive poster", "UI elements tree", "gradient background", "bokeh effects", "cinematic lighting", "holiday magic"]
1554	2004102457086169278	2025-12-25	Migrated from 2025-12-25	[]	{"name": "yanhua1010", "screen_name": "yanhua1010"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic"]}	["JSON prompt", "Pixar deconstruction", "vector illustration", "monoline style", "sticker sheet", "brand identity", "PBR materials", "radar chart"]
1555	2004173247764656131	2025-12-25	Migrated from 2025-12-25	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"]}	["tiny workers", "object restoration", "miniature realism", "warm afternoon light", "construction site", "relaxed mood", "handcrafted details", "sense of completion"]
2498	2008868215334588808	2026-01-07	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["现实主义"]}	["ultra close-up", "smartphone selfie", "natural skin", "black fur hat", "red nails", "soft lighting", "kitchen background", "raw unretouched"]
1233	2010164626311557219	2026-01-11	Migrated from 2026-01-11	[]	{"name": "itis_Jarvo33", "screen_name": "itis_Jarvo33"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义"], "艺术与幻想": ["卡通/插图", "抽象/实验"]}	["ink sketch portrait", "mixed-media illustration", "cryptic symbols", "abstract jacket", "aged parchment", "expressive chaos", "moody intensity", "editorial art"]
1234	2010275488703381858	2026-01-11	Migrated from 2026-01-11	[]	{"name": "Kerroudjm", "screen_name": "Kerroudjm"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"]}	["tactile wax seal", "logo design", "premium branding", "vector illustration", "monoline style", "sticker sheet", "high contrast", "modern trendy"]
1235	2010077171524456594	2026-01-10	Migrated from 2026-01-11	[]	{"name": "TugserOkur", "screen_name": "TugserOkur"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["architectural blueprint", "3D construction", "rising structure", "tiny workers", "impossible angles", "construction phases", "photorealistic 8K", "drafting table"]
1236	2010070395974504565	2026-01-10	Migrated from 2026-01-11	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计"]}	["wax seal logos", "tactile texture", "brand identity", "vector design", "premium aesthetic", "high-end rendering", "embossed effect", "metallic sheen"]
1237	2010210489813680211	2026-01-11	Migrated from 2026-01-11	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"]}	["beverage can", "premium branding", "matte label", "human hand hold", "neutral background", "soft lighting", "minimalist aesthetic", "commercial shot"]
1265	2009316687330333039	2026-01-08	Migrated from 2026-01-09	[]	{"name": "CharaspowerAI", "screen_name": "CharaspowerAI"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "产品摄影"], "可视化与分解": ["成分悬浮", "浮动构图"]}	["food photography", "flying ingredients", "studio lighting", "vibrant colors", "high-resolution", "dessert explosion", "motion capture", "appetizing details"]
1266	2009284710862643206	2026-01-08	Migrated from 2026-01-09	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["vehicle biography", "archival document", "technical illustration", "vintage aesthetic", "provenance summary", "monochrome grading", "automotive photography", "title block"]
1240	2010116114668515553	2026-01-10	Migrated from 2026-01-11	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "工作室肖像"], "艺术与幻想": ["动漫/Kawaii"]}	["sailor uniform", "izakaya setting", "playful expression", "tongue out", "high-angle selfie", "dewy skin", "vibrant blush", "Japanese calligraphy"]
1241	2009722852010852444	2026-01-09	Migrated from 2026-01-10	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "可视化与分解": ["成分环绕", "浮动构图"]}	["soap foam logos", "exploded view", "bathroom tiles", "brand colors", "top-down composition", "glossy wet surface", "product styling", "vibrant lighting"]
1260	2009446363331973461	2026-01-09	Migrated from 2026-01-09	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "广告/海报", "成分可视化"], "可视化与分解": ["成分环绕", "成分悬浮"]}	["dessert slices", "hyper-realistic", "studio lighting", "layered cakes", "powdered sugar", "gourmet photography", "pastel colors", "edible garnishes"]
1261	2009580453083201822	2026-01-09	Migrated from 2026-01-09	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "工作室肖像"], "产品与营销": ["奢华护肤", "广告/海报"]}	["skincare routine", "photo collage", "serene atmosphere", "golden hour light", "luxury bathroom", "minimalist aesthetic", "dynamic poses", "bokeh effects"]
1262	2009362050888475052	2026-01-08	Migrated from 2026-01-09	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic"]}	["tribute poster", "photo mosaic", "mixed-media textures", "monochrome base", "selective color", "serif typography", "vintage paper", "celebrity homage"]
1263	2009335963672301968	2026-01-08	Migrated from 2026-01-09	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["季节/景观", "城市/氛围"], "可视化与分解": ["教育图表"]}	["country globes", "miniature diorama", "glass dome", "cultural figures", "iconic landmarks", "whimsical style", "collectible souvenir", "hyper-realistic"]
1264	2009310148867551358	2026-01-08	Migrated from 2026-01-09	[]	{"name": "SiboEsenkova", "screen_name": "SiboEsenkova"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "包装设计", "小红书风格"]}	["skincare product", "olive oil soap", "minimalist setup", "natural elements", "soft lighting", "premium branding", "Mediterranean aesthetic", "photorealistic"]
1267	2009324869100724348	2026-01-08	Migrated from 2026-01-09	[]	{"name": "Raylan89", "screen_name": "Raylan89"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["名人/现实主义", "工作室肖像"], "艺术与幻想": ["科幻/超现实"]}	["double exposure", "black-and-white", "side profile", "urban alleyway", "surreal composition", "cinematic mood", "minimalist aesthetic", "soft grain"]
1268	2009387135019680209	2026-01-08	Migrated from 2026-01-09	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["工作室肖像"], "艺术与幻想": ["科幻/超现实"]}	["cinematic frames", "volumetric lighting", "dramatic shadows", "moody atmosphere", "futuristic aesthetic", "color grading", "atmospheric location", "expressive poses"]
1269	2009341341226942853	2026-01-08	Migrated from 2026-01-09	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计", "广告/海报"], "艺术与幻想": ["抽象/实验"]}	["19th century style", "copperplate engraving", "fine line etching", "vintage illustration", "serif typography", "monochrome ink", "elegant kerning", "heritage logomark"]
1270	2009308365877596410	2026-01-08	Migrated from 2026-01-09	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "可视化与分解": ["解剖/生物", "成分悬浮"]}	["circuit glow", "internal visible", "LED emanation", "dark environment", "futuristic aesthetic", "dramatic photography", "technology heartbeat", "power visualization"]
1271	2009343111093227685	2026-01-08	Migrated from 2026-01-09	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["卡通/插图", "抽象/实验"]}	["African tribal art", "fine line art", "surrealism collage", "cultural motifs", "monochrome palette", "intricate patterns", "symbolic elements", "ethnic fusion"]
1272	2009546813712560147	2026-01-09	Migrated from 2026-01-09	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告"], "视频与动态": ["动画效果", "产品旋转"], "可视化与分解": ["成分环绕", "成分悬浮", "浮动构图", "教育图表"]}	["exploded breakdown", "gyros disassembly", "ingredient annotations", "vertical alignment", "color blocks", "instructional aesthetic", "motion prompt", "social feed optimized"]
1273	2009425516638687431	2026-01-09	Migrated from 2026-01-09	[]	{"name": "linxiaobei888", "screen_name": "linxiaobei888"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "工作室肖像"]}	["3x3 grid collage", "dynamic poses", "azure sky background", "high-key sunlight", "fashion lookbook", "hyper-realistic", "mixed focal lengths", "expressive gestures"]
1280	2008976968100790373	2026-01-07	Migrated from 2026-01-08	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "艺术与幻想": ["信息图/Infographic"]}	["tribute poster", "photo mosaic", "sports graphic", "dual exposure", "monochrome B&W", "selective color", "typography branding", "cinematic composition"]
1281	2008902190543610366	2026-01-07	Migrated from 2026-01-08	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"]}	["AI stock assets", "design workflow", "post-production edit", "layering technique", "color grading", "creative pivot", "real skills boost", "2026 trends"]
1282	2008912370551357865	2026-01-07	Migrated from 2026-01-08	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "产品摄影"], "视频与动态": ["文本到视频", "动画效果"]}	["teddy bear mascot", "soda can fridge", "neon lighting", "pastel reflections", "condensation droplets", "Pixar realism", "studio lighting", "whimsical mood"]
1283	2008937653694013753	2026-01-07	Migrated from 2026-01-08	[]	{"name": "Kerroudjm", "screen_name": "Kerroudjm"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["地图/3D视图"], "可视化与分解": ["教育图表"]}	["3D diorama map", "iconic landmarks", "geographic accuracy", "soft studio lighting", "macro photography", "realistic textures", "cinematic composition", "high detail"]
1291	2008981778061476256	2026-01-07	Migrated from 2026-01-08	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"]}	["bubbles release", "underwater depth", "effervescent energy", "deep blue gradient", "backlighting effects", "hyper-realistic", "sharp focus", "UHD image"]
1251	2009834337043394622	2026-01-10	Migrated from 2026-01-10	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义"], "艺术与幻想": ["科幻/超现实"]}	["giant scale woman", "forced perspective", "urban crosswalk", "top-down selfie", "holding camera", "city dwarfed", "natural daylight", "hyper-realistic anatomy"]
1295	2008852020002979937	2026-01-07	Migrated from 2026-01-07	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["Chibi风格"], "可视化与分解": ["教育图表"]}	["LEGO diorama", "landmark build", "country flag", "white background", "3D rendered", "high-resolution", "cute LEGO style", "subtle shadow"]
1296	2008852570589253780	2026-01-07	Migrated from 2026-01-07	[]	{"name": "0xbisc", "screen_name": "0xbisc"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "视频与动态": ["动画效果"], "可视化与分解": ["成分悬浮", "教育图表"]}	["chocolate coffee", "exploded infographic", "vertical deconstruction", "dark gradient background", "macro realism", "pointer labels", "studio lighting", "8K quality"]
1297	2008826083282686133	2026-01-07	Migrated from 2026-01-07	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告"], "艺术与幻想": ["信息图/Infographic"]}	["typography food", "sculptural letters", "traditional dishes", "dark background", "editorial style", "appetizing textures", "diffused lighting", "high contrast"]
1298	2008635332950888619	2026-01-06	Migrated from 2026-01-07	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "产品与营销": ["包装设计", "广告/海报"]}	["branded souvenirs", "recontextualized objects", "luxury materials", "studio photography", "graphic overlays", "Manrope font", "seamless background", "high-end editorial"]
1300	2008559432016286198	2026-01-06	Migrated from 2026-01-07	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["地图/3D视图", "城市/氛围"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["heritage survey", "site plan", "building dissection", "axonometric view", "golden-hour photo", "technical blue-line", "analytical greys", "iconic architecture"]
1301	2008857436069781592	2026-01-07	Migrated from 2026-01-07	[]	{"name": "MANISH1027512", "screen_name": "MANISH1027512"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "自定义角色", "工作室肖像"]}	["傲娇表情", "tsundere pose", "pink backdrop", "side-eye glance", "hands-on-hips", "pouty lips", "restrained smirk", "photorealistic edit"]
1302	2008738659760304444	2026-01-07	Migrated from 2026-01-07	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	{"幽默与Meme": ["混合/编辑"], "艺术与幻想": ["卡通/插图"]}	["angry banana", "cartoon illustration", "multi-style fusion", "caricature exaggeration", "cel-shaded graphic", "looney tunes energy", "vibrant colors", "white background"]
1303	2008753339966877924	2026-01-07	Migrated from 2026-01-07	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "艺术与幻想": ["抽象/实验"]}	["plush beverage can", "pop art style", "fluffy texture", "bright studio lighting", "signature colors", "premium aesthetic", "clean composition", "high saturation"]
1304	2008570138371477897	2026-01-06	Migrated from 2026-01-07	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "艺术与幻想": ["卡通/插图", "动漫/Kawaii"]}	["colored illustration", "style matrix", "caricature distortion", "kinetic ink", "cel-shaded", "doraemon aesthetic", "looney tunes energy", "clean white background"]
1305	2008635378434031642	2026-01-06	Migrated from 2026-01-07	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["名人/现实主义"], "艺术与幻想": ["卡通/插图"]}	["split portrait", "2D cartoon", "hyper-realistic", "torn edge transition", "signature outfit", "dramatic lighting", "film grain", "square format"]
1306	2008604547166728331	2026-01-06	Migrated from 2026-01-07	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"幽默与Meme": ["搞笑场景"], "艺术与幻想": ["卡通/插图", "Chibi风格"]}	["celebrity plush toys", "felt material", "cartoonish appearance", "soft textures", "friendly expression", "studio setting", "natural lighting", "collectible style"]
1242	2009717451710509473	2026-01-09	Migrated from 2026-01-10	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计", "广告/海报"], "可视化与分解": ["信息图/Infographic"]}	["sticker sheet design", "monoline vector", "brand deconstruction", "solid colors", "high contrast", "knolling layout", "playful mascots", "trend stickers"]
1243	2009695503664239086	2026-01-09	Migrated from 2026-01-10	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"], "可视化与分解": ["教育图表", "解剖/生物"]}	["mid-construction landmarks", "isometric view", "scaffolding details", "hyper-realistic render", "architectural precision", "soft lighting", "monumental mood", "frozen progress"]
1244	2009664369001627654	2026-01-09	Migrated from 2026-01-10	[]	{"name": "Adam38363368936", "screen_name": "Adam38363368936"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "艺术与幻想": ["卡通/插图"]}	["cartoon companion", "mixed media portrait", "urban street scene", "introspective pose", "earthy tones", "hand-drawn style", "self-reflection theme", "cinematic realism"]
1245	2009726118669234487	2026-01-09	Migrated from 2026-01-10	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["治愈/梦幻"], "艺术与幻想": ["科幻/超现实", "抽象/实验"]}	["bioluminescent creatures", "deep-sea glow", "cyan violet hues", "translucent membranes", "drifting particles", "alien stillness", "nature documentary", "underwater fantasy"]
1246	2009675315010809976	2026-01-09	Migrated from 2026-01-10	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["卡通/插图"]}	["Japanese watercolor", "woodblock print", "bold outlines", "flat colors", "natural beauty", "traditional scheme", "splash effects", "serene subjects"]
1247	2009836414431883366	2026-01-10	Migrated from 2026-01-10	[]	{"name": "Naiknelofar788", "screen_name": "Naiknelofar788"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义", "工作室肖像"], "产品与营销": ["奢华护肤"]}	["morning skincare", "hydrogel patch", "towel turban", "mirror selfie", "dewy glow", "Scandinavian minimalist", "quiet luxury", "natural hydration"]
1248	2009660363227152653	2026-01-09	Migrated from 2026-01-10	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["卡通/插图"], "可视化与分解": ["信息图/Infographic"]}	["3x3 icon grid", "colorful 3D style", "tactile textures", "white background", "themed collections", "no text", "playful designs", "emotional expressions"]
1249	2009946159532662792	2026-01-10	Migrated from 2026-01-10	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义"], "艺术与幻想": ["抽象/实验"]}	["expressive portrait", "oversized glasses", "newspaper background", "paint splashes", "abstract expressionism", "upward gaze", "vibrant strokes", "hopeful innocence"]
1320	2008488331903139874	2026-01-06	Migrated from 2026-01-06	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["城市/氛围"], "艺术与幻想": ["卡通/插图", "抽象/实验"]}	["clay landmarks", "whimsical miniatures", "vibrant colors", "hand-sculpted textures", "iconic structures", "playful composition", "fairy tale vibe", "organic curves"]
1319	2008421241091154115	2026-01-06	Migrated from 2026-01-06	[]	{"name": "wanerfu", "screen_name": "wanerfu"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["工作室肖像", "性感/时尚"]}	["新年红", "九宫格", "festive portrait", "red attire", "Chinese New Year", "hyper-realistic", "elegant pose", "warm lighting"]
1346	2007831277269840286	2026-01-04	Migrated from 2026-01-05	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1347	2007835913842495504	2026-01-04	Migrated from 2026-01-05	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1250	2009898474440142964	2026-01-10	Migrated from 2026-01-10	[]	{"name": "0x00_Krypt", "screen_name": "0x00_Krypt"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["地图/3D视图", "城市/氛围"], "可视化与分解": ["教育图表"]}	["miniature city model", "topographic map", "God's eye view", "rugged terrain", "urban integration", "natural sunlight", "tilt-shift focus", "hyper-realistic details"]
1252	2009656662127165484	2026-01-09	Migrated from 2026-01-10	[]	{"name": "techhalla", "screen_name": "techhalla"}	{}	2026-01-12 18:39:35.301442	{"可视化与分解": ["信息图/Infographic", "教育图表"]}	["historical moments grid", "3x3 timeline", "cinematic recreation", "era-specific details", "narrative consistency", "time-capsule aesthetic", "hyper-detailed scenes", "compressed history"]
1253	2009887009591226787	2026-01-10	Migrated from 2026-01-10	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "可视化与分解": ["成分悬浮", "浮动构图"]}	["flavor explosions", "suspended ingredients", "carbonated splashes", "hyper-real textures", "studio lighting", "vibrant colors", "commercial photography", "dynamic motion"]
1254	2009824684213448740	2026-01-10	Migrated from 2026-01-10	[]	{"name": "Maruo_AI", "screen_name": "Maruo_AI"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "产品与营销": ["广告/海报", "小红书风格"]}	["LP制作", "D2C通販", "ECショートLP", "無料オファー", "サービス紹介", "講座スクール", "SNS運用", "JV報酬"]
1255	2009693031084282279	2026-01-09	Migrated from 2026-01-10	[]	{"name": "youngcatwoman", "screen_name": "youngcatwoman"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚"], "艺术与幻想": ["动漫/Kawaii"]}	["low-angle view", "leather microdress", "playful smile", "pink kawaii room", "stuffed toy cover", "bare legs", "warm lighting", "confident pose"]
1256	2009832310112465120	2026-01-10	Migrated from 2026-01-10	[]	{"name": "0xInk_", "screen_name": "0xInk_"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "艺术与幻想": ["科幻/超现实"]}	["cinematic triptych", "image reference prompts", "multi-shot generation", "cyborg aesthetics", "universal prompt", "feedback creations", "AI designer", "curator tools"]
1257	2009664169331839410	2026-01-09	Migrated from 2026-01-10	[]	{"name": "aziz4ai", "screen_name": "aziz4ai"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告"], "可视化与分解": ["信息图/Infographic"]}	["edible letters", "candy text", "3D render", "ray tracing", "high-Kelvin lighting", "candy world", "glossy details", "hyper-real textures"]
1348	2007881212132803025	2026-01-04	Migrated from 2026-01-05	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1258	2009519057717088345	2026-01-09	Migrated from 2026-01-09	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "可视化与分解": ["成分悬浮"]}	["beverage explosions", "floating fruits", "condensation droplets", "gradient background", "cinematic lighting", "ultra-sharp focus", "premium ad", "dynamic splash"]
1239	2010191557228671470	2026-01-11	Migrated from 2026-01-11	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "成分可视化"], "视频与动态": ["产品旋转", "动画效果"]}	["perfume explosion", "spinning bottle", "levitating ingredients", "fragrance mist", "citrus peels", "floral petals", "smooth motion", "premium luxury"]
1349	2007890867626057901	2026-01-04	Migrated from 2026-01-05	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1350	2008009926682288215	2026-01-05	Migrated from 2026-01-05	[]	{"name": "EHuanglu", "screen_name": "EHuanglu"}	{}	2026-01-12 18:39:35.301442	\N	\N
1351	2007834304727101759	2026-01-04	Migrated from 2026-01-05	[]	{"name": "The_Sycomore", "screen_name": "The_Sycomore"}	{}	2026-01-12 18:39:35.301442	\N	\N
1352	2007893560280899941	2026-01-04	Migrated from 2026-01-05	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1353	2008016478315192836	2026-01-05	Migrated from 2026-01-05	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1354	2007863361359290482	2026-01-04	Migrated from 2026-01-05	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1355	2007535691157143563	2026-01-03	Migrated from 2026-01-04	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1356	2007661789023244505	2026-01-04	Migrated from 2026-01-04	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1357	2007495673784979734	2026-01-03	Migrated from 2026-01-04	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1358	2007616917327204584	2026-01-04	Migrated from 2026-01-04	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1359	2007490589504508338	2026-01-03	Migrated from 2026-01-04	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1360	2007515334350086153	2026-01-03	Migrated from 2026-01-04	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
1361	2007529647387353107	2026-01-03	Migrated from 2026-01-04	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1362	2007544730167501044	2026-01-03	Migrated from 2026-01-04	[]	{"name": "aziz4ai", "screen_name": "aziz4ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1363	2007722721967321132	2026-01-04	Migrated from 2026-01-04	[]	{"name": "harboriis", "screen_name": "harboriis"}	{}	2026-01-12 18:39:35.301442	\N	\N
1364	2007497261492920739	2026-01-03	Migrated from 2026-01-04	[]	{"name": "SiboEsenkova", "screen_name": "SiboEsenkova"}	{}	2026-01-12 18:39:35.301442	\N	\N
1365	2007673192991862861	2026-01-04	Migrated from 2026-01-04	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
1374	2007087774248439879	2026-01-02	Migrated from 2026-01-03	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1274	2008976966255337666	2026-01-07	Migrated from 2026-01-08	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "可视化与分解": ["信息图/Infographic"]}	["tribute poster", "dual exposure", "photo-grid composite", "mixed-media textures", "monochrome with accents", "serif typography", "vintage paper", "celebrity silhouette"]
1275	2008946387267015081	2026-01-07	Migrated from 2026-01-08	[]	{"name": "artisin_ai", "screen_name": "artisin_ai"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"], "视频与动态": ["动画效果", "文本到视频"]}	["surreal animation", "creature tracking", "plant growth", "moody forest", "dynamic motion", "ethereal atmosphere", "fantasy narrative", "cinematic effects"]
1276	2008944996091564518	2026-01-07	Migrated from 2026-01-08	[]	{"name": "astronomerozge1", "screen_name": "astronomerozge1"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "可视化与分解": ["成分悬浮", "解剖/生物"]}	["transparent machine", "internal mechanics", "glass enclosure", "circuit integration", "coffee pouring", "studio lighting", "high-key photography", "luxury artifact"]
1277	2008913659582681255	2026-01-07	Migrated from 2026-01-08	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "工作室肖像"], "艺术与幻想": ["卡通/插图"]}	["Japanese photobook", "9-grid layout", "matte art paper", "day to night narrative", "film stock emulation", "candid poses", "wet look effects", "typography overlay"]
1278	2009075082996641935	2026-01-08	Migrated from 2026-01-08	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计"], "艺术与幻想": ["Chibi风格", "卡通/插图"]}	["Q版人物", "京剧戏服", "凤冠头饰", "花枪道具", "戏台底座", "华丽配色", "国粹传承", "产品摄影"]
1259	2009348440774373551	2026-01-08	Migrated from 2026-01-09	[]	{"name": "Kerroudjm", "screen_name": "Kerroudjm"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "自然与环境": ["城市/氛围"], "可视化与分解": ["教育图表"]}	["enamel pin", "gold-plated", "iconic landmarks", "vector design", "denim fabric", "natural lighting", "glossy reflections", "collectible item"]
1375	2007134245328957539	2026-01-02	Migrated from 2026-01-03	[]	{"name": "maxescu", "screen_name": "maxescu"}	{}	2026-01-12 18:39:35.301442	\N	\N
1376	2007131884061397089	2026-01-02	Migrated from 2026-01-03	[]	{"name": "kaanakz", "screen_name": "kaanakz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1377	2007113351197770202	2026-01-02	Migrated from 2026-01-03	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1378	2007266399497138682	2026-01-03	Migrated from 2026-01-03	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1379	2007226649600029137	2026-01-02	Migrated from 2026-01-03	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1381	2007275324967698649	2026-01-03	Migrated from 2026-01-03	[]	{"name": "LZhou15365", "screen_name": "LZhou15365"}	{}	2026-01-12 18:39:35.301442	\N	\N
1382	2007148490120380484	2026-01-02	Migrated from 2026-01-03	[]	{"name": "Tz_2022", "screen_name": "Tz_2022"}	{}	2026-01-12 18:39:35.301442	\N	\N
1383	2007122463151534322	2026-01-02	Migrated from 2026-01-03	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1384	2007267921425240077	2026-01-03	Migrated from 2026-01-03	[]	{"name": "iamsofiaijaz", "screen_name": "iamsofiaijaz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1385	2007160966673527145	2026-01-02	Migrated from 2026-01-03	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1386	2007161169468108902	2026-01-02	Migrated from 2026-01-03	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1387	2007344971079463088	2026-01-03	Migrated from 2026-01-03	[]	{"name": "Just_sharon7", "screen_name": "Just_sharon7"}	{}	2026-01-12 18:39:35.301442	\N	\N
1388	2007089501416427844	2026-01-02	Migrated from 2026-01-03	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1397	2006679801256656925	2026-01-01	Migrated from 2026-01-01	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	\N	\N
1398	2006650007651537263	2026-01-01	Migrated from 2026-01-01	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1399	2006439339312476487	2025-12-31	Migrated from 2026-01-01	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1400	2006621506323816578	2026-01-01	Migrated from 2026-01-01	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1401	2006462352506663012	2025-12-31	Migrated from 2026-01-01	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1402	2006418381444898870	2025-12-31	Migrated from 2026-01-01	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2493	2009625733933736157	2026-01-09	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"产品与营销": ["食物广告", "成分可视化"]}	["premium advertising", "floating stacked", "levitating pieces", "scattered ingredients", "white background", "macro lens", "sharp focus", "editorial commercial"]
2496	2010024069874512106	2026-01-11	Added via extension on 2026-01-13	[]	{"name": "Unknown", "screen_name": "unknown"}	{}	2026-01-12 21:23:10.065327	{"人物肖像": ["自定义角色"], "艺术与幻想": ["Chibi风格"]}	["miniature figurine", "isometric view", "realistic style", "full-body", "white background", "custom outfit", "action pose", "4K resolution"]
1403	2006401714497130996	2025-12-31	Migrated from 2026-01-01	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1404	2006211567910805903	2025-12-31	Migrated from 2026-01-01	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	\N	\N
1405	2006392907939643892	2025-12-31	Migrated from 2026-01-01	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1406	2006409766621331963	2025-12-31	Migrated from 2026-01-01	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1407	2006036739098558741	2025-12-30	Migrated from 2025-12-31	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	\N	\N
1408	2006031630268522943	2025-12-30	Migrated from 2025-12-31	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	\N	\N
1409	2006095525271978336	2025-12-30	Migrated from 2025-12-31	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1410	2006030077499232439	2025-12-30	Migrated from 2025-12-31	[]	{"name": "Samann_ai", "screen_name": "Samann_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1411	2006020593553137995	2025-12-30	Migrated from 2025-12-31	[]	{"name": "rionaifantasy", "screen_name": "rionaifantasy"}	{}	2026-01-12 18:39:35.301442	\N	\N
1412	2006081619610734935	2025-12-30	Migrated from 2025-12-31	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1413	2006017485938778400	2025-12-30	Migrated from 2025-12-31	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1414	2006047127492067487	2025-12-30	Migrated from 2025-12-31	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1415	2006051406223139047	2025-12-30	Migrated from 2025-12-31	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1416	2006068721027002668	2025-12-30	Migrated from 2025-12-31	[]	{"name": "astronomerozge1", "screen_name": "astronomerozge1"}	{}	2026-01-12 18:39:35.301442	\N	\N
1417	2006184323628818654	2025-12-31	Migrated from 2025-12-31	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	\N	\N
1418	2006020799367442728	2025-12-30	Migrated from 2025-12-31	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1419	2005670356745322759	2025-12-29	Migrated from 2025-12-30	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1420	2005534268143931665	2025-12-29	Migrated from 2025-12-30	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1421	2005681873612165251	2025-12-29	Migrated from 2025-12-30	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1422	2005628752802517441	2025-12-29	Migrated from 2025-12-30	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1423	2005685514154958917	2025-12-29	Migrated from 2025-12-30	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
1424	2005877044584849773	2025-12-30	Migrated from 2025-12-30	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1284	2009163133810823368	2026-01-08	Migrated from 2026-01-08	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "奢华护肤", "广告/海报"]}	["skincare cleanser", "pink foam bubbles", "minimalist photography", "diffused lighting", "luminous glow", "realistic refraction", "luxury branding", "8K detail"]
1285	2009117120987320527	2026-01-08	Migrated from 2026-01-08	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["城市/氛围", "地图/3D视图"], "艺术与幻想": ["科幻/超现实"]}	["spherical panorama", "tiny-planet effect", "iconic landmarks", "natural daylight", "surreal atmosphere", "photorealistic style", "3D typography", "high fidelity"]
1286	2009054240287633604	2026-01-08	Migrated from 2026-01-08	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "艺术与幻想": ["Chibi风格"]}	["isometric figurine", "realistic human", "living skin texture", "perfect proportions", "Unreal Engine render", "deep depth field", "grey background", "detailed props"]
1287	2009157208240755151	2026-01-08	Migrated from 2026-01-08	[]	{"name": "meng_dagg695", "screen_name": "meng_dagg695"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "可视化与分解": ["成分悬浮", "浮动构图", "教育图表"]}	["exploded infographic", "food layers", "studio lighting", "hyper-realistic", "JSON prompt", "8K UHD", "motion effects", "seamless background"]
1288	2008933854338257205	2026-01-07	Migrated from 2026-01-08	[]	{"name": "OTFHD", "screen_name": "OTFHD"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "艺术与幻想": ["抽象/实验"]}	["hand-drawn style", "geometric precision", "logo design", "Arabic prompt", "Nano Banana Pro", "high-relief", "vector illustration", "minimalist lines"]
1289	2008986705962123774	2026-01-07	Migrated from 2026-01-08	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "可视化与分解": ["成分环绕", "成分悬浮", "教育图表"]}	["beverage deconstruction", "JSON format prompt", "vertical explosion", "premium dark background", "macro realism", "pointer labels", "8K infographic", "flavor layers"]
1290	2009118898864771537	2026-01-08	Migrated from 2026-01-08	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报", "食物广告"], "视频与动态": ["动画效果"]}	["beverage splash", "top-down angle", "fluid dynamics", "cinematic lighting", "hyper-realistic", "premium advertising", "8K realism", "energetic mood"]
1292	2008913329029263382	2026-01-07	Migrated from 2026-01-08	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["地图/3D视图"], "可视化与分解": ["教育图表"]}	["glass cube diorama", "mossy forest floor", "miniature landmarks", "dappled sunlight", "3D word display", "country flag", "high-resolution", "immersive scene"]
1293	2008952931484098637	2026-01-07	Migrated from 2026-01-08	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "艺术与幻想": ["Chibi风格"]}	["3D isometric view", "realistic human skin", "circular base", "Unreal Engine style", "raytracing", "deep depth field", "neutral grey background", "detailed props"]
1294	2008566612266483822	2026-01-06	Migrated from 2026-01-07	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "成分可视化"], "视频与动态": ["动画效果", "产品旋转"], "可视化与分解": ["成分悬浮", "浮动构图"]}	["coffee deconstruction", "round spin motion", "ingredient separation", "hyper-realistic", "white background", "studio lighting", "8K infographic", "premium aesthetic"]
1279	2009025387859464613	2026-01-07	Migrated from 2026-01-08	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "艺术与幻想": ["抽象/实验"]}	["bubbles stream", "underwater product", "deep blue gradient", "effervescent motion", "backlighting", "hyper-realistic", "sharp focus", "UHD photography"]
1425	2005620980891480567	2025-12-29	Migrated from 2025-12-30	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1426	2005698218043003199	2025-12-29	Migrated from 2025-12-30	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1427	2005816508602278010	2025-12-30	Migrated from 2025-12-30	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1428	2005793707027755335	2025-12-30	Migrated from 2025-12-30	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1429	2005717455323423170	2025-12-29	Migrated from 2025-12-30	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1430	2005719231367639377	2025-12-29	Migrated from 2025-12-30	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1431	2005984084141465609	2025-12-30	Migrated from 2025-12-30	[]	{"name": "xmiiru_", "screen_name": "xmiiru_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1432	2005793606737801347	2025-12-30	Migrated from 2025-12-30	[]	{"name": "0xInk_", "screen_name": "0xInk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1433	2005659825028649109	2025-12-29	Migrated from 2025-12-30	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1434	2005842515283583332	2025-12-30	Migrated from 2025-12-30	[]	{"name": "anandh_ks_", "screen_name": "anandh_ks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1435	2005842541141451133	2025-12-30	Migrated from 2025-12-30	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1436	2005299702015918358	2025-12-28	Migrated from 2025-12-29	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1437	2005324208608567325	2025-12-28	Migrated from 2025-12-29	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1438	2005372269426856164	2025-12-28	Migrated from 2025-12-29	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1439	2005288633839096050	2025-12-28	Migrated from 2025-12-29	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1440	2005276248789131773	2025-12-28	Migrated from 2025-12-29	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1441	2005232305175237003	2025-12-28	Migrated from 2025-12-29	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1442	2005484623032406057	2025-12-29	Migrated from 2025-12-29	[]	{"name": "0xInk_", "screen_name": "0xInk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1443	2005266319772684676	2025-12-28	Migrated from 2025-12-29	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1444	2005296968025944566	2025-12-28	Migrated from 2025-12-29	[]	{"name": "DrFonts", "screen_name": "DrFonts"}	{}	2026-01-12 18:39:35.301442	\N	\N
1307	2008566010073546764	2026-01-06	Migrated from 2026-01-07	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚"], "其他/实验": ["工具比较"]}	["AI makeup tutorial", "millimeter-level analysis", "light shadow adaptation", "professional beauty techniques", "one-click application", "prompt templates", "regional breakdown", "high-detail portrait"]
1308	2008618360435613728	2026-01-06	Migrated from 2026-01-07	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实"]}	["celestial dreamscape", "glowing edges", "surreal atmosphere", "limited palette", "fantastical elements", "dreamlike composition", "vibrant colors", "ethereal mood"]
1309	2008856432687665235	2026-01-07	Migrated from 2026-01-07	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["抽象/实验"], "可视化与分解": ["解剖/生物", "教育图表"]}	["renaissance anatomical study", "graphite ink cross-hatching", "tissue overlays", "latin calligraphy", "bone muscle layers", "fine details", "vintage illustration", "educational diagram"]
1310	2008606491096568297	2026-01-06	Migrated from 2026-01-07	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义", "工作室肖像"], "艺术与幻想": ["科幻/超现实"]}	["cinematic frames", "dramatic lighting", "moody atmosphere", "shallow depth", "color grading", "film grain", "time of day", "epic composition"]
1311	2008635341553758501	2026-01-06	Migrated from 2026-01-07	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "包装设计", "广告/海报"]}	["hi-end souvenirs", "recontextualized objects", "luxury materials", "studio photography", "minimalist text", "brand integration", "soft lighting", "eclectic collection"]
1312	2008588138193518630	2026-01-06	Migrated from 2026-01-07	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "艺术与幻想": ["卡通/插图"]}	["pop art saga", "bold outlines", "primary colors", "iconic symbols", "limited palette", "dynamic composition", "vibrant style", "eye-catching"]
1313	2008600010943025240	2026-01-06	Migrated from 2026-01-07	[]	{"name": "SiboEsenkova", "screen_name": "SiboEsenkova"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报", "成分可视化"]}	["e-commerce photography", "body spray bottle", "botanical elements", "water droplets", "top-down view", "natural lighting", "photorealistic", "premium cosmetic"]
1314	2008547919734186486	2026-01-06	Migrated from 2026-01-07	[]	{"name": "r4jjesh", "screen_name": "r4jjesh"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["现实主义", "工作室肖像"], "艺术与幻想": ["抽象/实验"]}	["black white red", "high-contrast poster", "three-quarter pose", "geometric shapes", "chiaroscuro lighting", "retro-futuristic", "minimalist palette", "hyper-realistic"]
1315	2008786351974740023	2026-01-07	Migrated from 2026-01-07	[]	{"name": "Bitturing", "screen_name": "Bitturing"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "产品与营销": ["产品摄影", "广告/海报"]}	["e-commerce images", "main image", "selling points", "detail shots", "scene graphs", "universal prompt", "natural soft light", "commercial ready"]
1316	2008559850968473671	2026-01-06	Migrated from 2026-01-07	[]	{"name": "Kerroudjm", "screen_name": "Kerroudjm"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"]}	["premium marketing", "top-down shot", "textured surface", "natural sunlight", "realistic shadows", "3D realism", "luxury aesthetic", "shallow depth"]
1317	2008903682612760944	2026-01-07	Migrated from 2026-01-07	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-12 18:39:35.301442	{"幽默与Meme": ["搞笑场景"], "艺术与幻想": ["动漫/Kawaii", "Chibi风格"]}	["萌化系列", "fluffy puff", "oversized head", "glossy eyes", "stubby paws", "soft pastels", "dreamy atmosphere", "heart-melting cute"]
1318	2008431391235862892	2026-01-06	Migrated from 2026-01-06	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["名人/现实主义"], "艺术与幻想": ["卡通/插图"]}	["ink noir portrait", "black ink strokes", "controlled splatter", "heavy shadows", "negative space", "paper grain", "moody atmosphere", "graphic novel"]
1445	2005293653510459750	2025-12-28	Migrated from 2025-12-29	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1299	2008853018792628733	2026-01-07	Migrated from 2026-01-07	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["自定义角色"], "艺术与幻想": ["抽象/实验"]}	["paperform portraits", "origami sculpture", "crisp folds", "paper fiber texture", "geometric intricate", "soft shadows", "minimalist aesthetic", "photorealistic rendering"]
1446	2005233594130972845	2025-12-28	Migrated from 2025-12-29	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1447	2005311875278606756	2025-12-28	Migrated from 2025-12-29	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1448	2005315176095244514	2025-12-28	Migrated from 2025-12-29	[]	{"name": "SiboEsenkova", "screen_name": "SiboEsenkova"}	{}	2026-01-12 18:39:35.301442	\N	\N
1449	2005356846710677597	2025-12-28	Migrated from 2025-12-29	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1450	2005398855852982441	2025-12-28	Migrated from 2025-12-29	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1451	2005507212320616648	2025-12-29	Migrated from 2025-12-29	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	\N	\N
1452	2005549816689091025	2025-12-29	Migrated from 2025-12-29	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
1453	2005487775597088895	2025-12-29	Migrated from 2025-12-29	[]	{"name": "Ok_shuai", "screen_name": "Ok_shuai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1454	2005482403301900567	2025-12-29	Migrated from 2025-12-29	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1455	2005387590372057491	2025-12-28	Migrated from 2025-12-29	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1456	2005449128625508384	2025-12-29	Migrated from 2025-12-29	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1457	2005282086324785534	2025-12-28	Migrated from 2025-12-29	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1458	2005190547133399118	2025-12-28	Migrated from 2025-12-28	[]	{"name": "qisi_ai", "screen_name": "qisi_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1460	2005071147537166598	2025-12-28	Migrated from 2025-12-28	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
1461	2004937062907039787	2025-12-27	Migrated from 2025-12-28	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1462	2005230789659939072	2025-12-28	Migrated from 2025-12-28	[]	{"name": "bozhou_ai", "screen_name": "bozhou_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1464	2005155984130367625	2025-12-28	Migrated from 2025-12-28	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
1465	2005185002884268231	2025-12-28	Migrated from 2025-12-28	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1466	2004986136335110526	2025-12-27	Migrated from 2025-12-28	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1467	2005041248915087825	2025-12-27	Migrated from 2025-12-28	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1468	2005215289286475889	2025-12-28	Migrated from 2025-12-28	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	\N	\N
1469	2005003170318352538	2025-12-27	Migrated from 2025-12-28	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1470	2005129744690675731	2025-12-28	Migrated from 2025-12-28	[]	{"name": "sundyme", "screen_name": "sundyme"}	{}	2026-01-12 18:39:35.301442	\N	\N
1471	2005115679415157035	2025-12-28	Migrated from 2025-12-28	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1472	2005103596044534069	2025-12-28	Migrated from 2025-12-28	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1473	2004964241925923186	2025-12-27	Migrated from 2025-12-28	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1474	2004994452784353499	2025-12-27	Migrated from 2025-12-28	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1475	2004894710729478277	2025-12-27	Migrated from 2025-12-27	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1476	2004635860000788840	2025-12-26	Migrated from 2025-12-27	[]	{"name": "i", "screen_name": "i"}	{}	2026-01-12 18:39:35.301442	\N	\N
1477	2004869913463415115	2025-12-27	Migrated from 2025-12-27	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1478	2004718876974624883	2025-12-27	Migrated from 2025-12-27	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1479	2004584489612460097	2025-12-26	Migrated from 2025-12-27	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1480	2004738067618468292	2025-12-27	Migrated from 2025-12-27	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1481	2004627569598234729	2025-12-26	Migrated from 2025-12-27	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1482	2004584112582222280	2025-12-26	Migrated from 2025-12-27	[]	{"name": "hx831126", "screen_name": "hx831126"}	{}	2026-01-12 18:39:35.301442	\N	\N
1483	2004637964626743396	2025-12-26	Migrated from 2025-12-27	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1484	2004825491350716624	2025-12-27	Migrated from 2025-12-27	[]	{"name": "itis_Jarvo33", "screen_name": "itis_Jarvo33"}	{}	2026-01-12 18:39:35.301442	\N	\N
1485	2004673828203467087	2025-12-26	Migrated from 2025-12-27	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1486	2004728009912168459	2025-12-27	Migrated from 2025-12-27	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1487	2004600707136057760	2025-12-26	Migrated from 2025-12-27	[]	{"name": "hx831126", "screen_name": "hx831126"}	{}	2026-01-12 18:39:35.301442	\N	\N
1488	2004632068718739658	2025-12-26	Migrated from 2025-12-27	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1489	2004601351146532917	2025-12-26	Migrated from 2025-12-27	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1490	2004611631985107345	2025-12-26	Migrated from 2025-12-27	[]	{"name": "David_eficaz", "screen_name": "David_eficaz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1491	2004930351584444801	2025-12-27	Migrated from 2025-12-27	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1492	2004598274171269272	2025-12-26	Migrated from 2025-12-27	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1329	2008229403914899923	2026-01-05	Migrated from 2026-01-06	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "艺术与幻想": ["科幻/超现实"]}	["metallic liquid", "mid-splash", "zero gravity", "droplets", "dramatic lighting", "hyper-crisp", "luxurious chaos", "editorial beauty"]
1330	2008255952701555068	2026-01-05	Migrated from 2026-01-06	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	{"自然与环境": ["治愈/梦幻"], "艺术与幻想": ["卡通/插图"]}	["botanical watercolor", "flora fauna", "serene setting", "pastel hues", "tranquility", "storybook charm", "delicate interplay", "natural balance"]
1338	2008098771381690572	2026-01-05	Migrated from 2026-01-05	[]	{"name": "0xbisc", "screen_name": "0xbisc"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "奢华护肤", "广告/海报"]}	["perfume ad", "scent elements", "crystal bottle", "tonal gradient", "museum lighting", "abstract symbolic", "luxury campaign", "refined composition"]
1339	2008127774750548155	2026-01-05	Migrated from 2026-01-05	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["食物广告", "产品摄影"], "艺术与幻想": ["抽象/实验"]}	["pixelized food", "3D cubes", "mid-transformation", "hyper-realistic", "studio lighting", "geometric abstraction", "motion blur", "cinematic close-up"]
1340	2007802711937270119	2026-01-04	Migrated from 2026-01-05	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["工作室肖像"], "可视化与分解": ["教育图表"]}	["watery lips", "extreme close-up", "sheer essence", "dewy hydration", "realistic texture", "soft lighting", "macro lens", "lifelike detail"]
1341	2008008497473147136	2026-01-05	Migrated from 2026-01-05	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	{"其他/实验": ["工具比较"], "可视化与分解": ["信息图/Infographic"]}	["visionOS interface", "spatial computing", "floating windows", "app icons", "first-person view", "photorealistic screenshot", "hand gestures", "immersive format"]
1342	2008186029820559468	2026-01-05	Migrated from 2026-01-05	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["工作室肖像"], "可视化与分解": ["教育图表"]}	["colored contacts", "eye makeup", "close-up shot", "rainbow sclera", "cinematic", "high detail", "shallow depth", "lifelike eyes"]
1343	2008131658852241768	2026-01-05	Migrated from 2026-01-05	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["卡通/插图", "抽象/实验"]}	["felted wool", "handcrafted figure", "miniature diorama", "tactile textures", "storybook charm", "stop-motion style", "cozy scene", "pastel props"]
1344	2008017541340565526	2026-01-05	Migrated from 2026-01-05	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "产品摄影"], "艺术与幻想": ["卡通/插图"]}	["miniature construction", "product assembly", "cranes scaffolding", "sparks flying", "hyper-real", "playful scene", "brand campaign", "detailed workers"]
1321	2008434033701879836	2026-01-06	Migrated from 2026-01-06	[]	{"name": "iamsofiaijaz", "screen_name": "iamsofiaijaz"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报"], "艺术与幻想": ["科幻/超现实"]}	["powder explosion", "athletic motion", "pastel outfit", "cinematic lighting", "frozen action", "fashion ad", "vibrant contrast", "hyper-realistic"]
1322	2008174532285350353	2026-01-05	Migrated from 2026-01-06	[]	{"name": "LZhou15365", "screen_name": "LZhou15365"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["成分可视化"], "可视化与分解": ["信息图/Infographic", "教育图表"]}	["fruit tree guide", "agricultural infographic", "growth timeline", "pest identification", "color-coded data", "museum style", "detailed illustrations", "horticulture info"]
1493	2004747766657155276	2025-12-27	Migrated from 2025-12-27	[]	{"name": "anandh_ks_", "screen_name": "anandh_ks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1494	2004594822351650974	2025-12-26	Migrated from 2025-12-27	[]	{"name": "mattiapomelli", "screen_name": "mattiapomelli"}	{}	2026-01-12 18:39:35.301442	\N	\N
1495	2004568038692311394	2025-12-26	Migrated from 2025-12-27	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1496	2004241867085406717	2025-12-25	Migrated from 2025-12-26	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1497	2004220210111566073	2025-12-25	Migrated from 2025-12-26	[]	{"name": "design_with_ayo", "screen_name": "design_with_ayo"}	{}	2026-01-12 18:39:35.301442	\N	\N
1498	2004298915001389518	2025-12-25	Migrated from 2025-12-26	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1499	2004239718121161201	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1500	2004259040491409514	2025-12-25	Migrated from 2025-12-26	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1501	2004184179303764392	2025-12-25	Migrated from 2025-12-26	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1502	2004371587412426916	2025-12-26	Migrated from 2025-12-26	[]	{"name": "iamsofiaijaz", "screen_name": "iamsofiaijaz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1503	2004375828306804904	2025-12-26	Migrated from 2025-12-26	[]	{"name": "higgsfield_ai", "screen_name": "higgsfield_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1504	2004209266899444004	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Dari_Designs", "screen_name": "Dari_Designs"}	{}	2026-01-12 18:39:35.301442	\N	\N
1505	2004334970056413335	2025-12-25	Migrated from 2025-12-26	[]	{"name": "eveningbtc", "screen_name": "eveningbtc"}	{}	2026-01-12 18:39:35.301442	\N	\N
1506	2004241988632088852	2025-12-25	Migrated from 2025-12-26	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1507	2004239480501231896	2025-12-25	Migrated from 2025-12-26	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1508	2004249099445670218	2025-12-25	Migrated from 2025-12-26	[]	{"name": "ducktheaff", "screen_name": "ducktheaff"}	{}	2026-01-12 18:39:35.301442	\N	\N
1509	2004200827557470230	2025-12-25	Migrated from 2025-12-26	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1510	2004329307687002559	2025-12-25	Migrated from 2025-12-26	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1511	2004349943956279525	2025-12-26	Migrated from 2025-12-26	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1512	2004392418288783366	2025-12-26	Migrated from 2025-12-26	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1513	2004334491414958506	2025-12-25	Migrated from 2025-12-26	[]	{"name": "bindureddy", "screen_name": "bindureddy"}	{}	2026-01-12 18:39:35.301442	\N	\N
1514	2004212035333365763	2025-12-25	Migrated from 2025-12-26	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1515	2004408308850217043	2025-12-26	Migrated from 2025-12-26	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
1516	2004193839142342792	2025-12-25	Migrated from 2025-12-26	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1517	2004258690954608686	2025-12-25	Migrated from 2025-12-26	[]	{"name": "astronomerozge1", "screen_name": "astronomerozge1"}	{}	2026-01-12 18:39:35.301442	\N	\N
1518	2004247009210126810	2025-12-25	Migrated from 2025-12-26	[]	{"name": "JasonBud", "screen_name": "JasonBud"}	{}	2026-01-12 18:39:35.301442	\N	\N
1519	2004390027179315659	2025-12-26	Migrated from 2025-12-26	[]	{"name": "Strength04_X", "screen_name": "Strength04_X"}	{}	2026-01-12 18:39:35.301442	\N	\N
1520	2004178587654778928	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1521	2004388771396309137	2025-12-26	Migrated from 2025-12-26	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1522	2004083165833711998	2025-12-25	Migrated from 2025-12-26	[]	{"name": "youraipulse", "screen_name": "youraipulse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1524	2004447203645923535	2025-12-26	Migrated from 2025-12-26	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1525	2004217443049222582	2025-12-25	Migrated from 2025-12-26	[]	{"name": "Samann_ai", "screen_name": "Samann_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1526	2004208501137330537	2025-12-25	Migrated from 2025-12-26	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1531	2003743839505535309	2025-12-24	Migrated from 2025-12-25	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1545	2003864634973880430	2025-12-24	Migrated from 2025-12-25	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
1547	2004145878723150289	2025-12-25	Migrated from 2025-12-25	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1548	2004084798633943206	2025-12-25	Migrated from 2025-12-25	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1549	2004027570254414241	2025-12-25	Migrated from 2025-12-25	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1550	2003895952223207891	2025-12-24	Migrated from 2025-12-25	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1551	2004036691879743733	2025-12-25	Migrated from 2025-12-25	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
1552	2003849647392247864	2025-12-24	Migrated from 2025-12-25	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1558	2002937974993088841	2025-12-22	Migrated from 2025-12-24	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1559	2002793794975273279	2025-12-21	Migrated from 2025-12-24	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1560	2002841670992502880	2025-12-21	Migrated from 2025-12-24	[]	{"name": "The_Sycomore", "screen_name": "The_Sycomore"}	{}	2026-01-12 18:39:35.301442	\N	\N
1561	2002998654282678771	2025-12-22	Migrated from 2025-12-24	[]	{"name": "gisellaesthetic", "screen_name": "gisellaesthetic"}	{}	2026-01-12 18:39:35.301442	\N	\N
1562	2002831713970602064	2025-12-21	Migrated from 2025-12-24	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1563	2002737842624311413	2025-12-21	Migrated from 2025-12-24	[]	{"name": "excel_niisan", "screen_name": "excel_niisan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1564	2002963262812585990	2025-12-22	Migrated from 2025-12-24	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1565	2002734410689347944	2025-12-21	Migrated from 2025-12-24	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1566	2002833954680762665	2025-12-21	Migrated from 2025-12-24	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1567	2002943114512826729	2025-12-22	Migrated from 2025-12-24	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1568	2002840320694992997	2025-12-21	Migrated from 2025-12-24	[]	{"name": "gizakdag", "screen_name": "gizakdag"}	{}	2026-01-12 18:39:35.301442	\N	\N
1569	2002944939362288011	2025-12-22	Migrated from 2025-12-24	[]	{"name": "anandh_ks_", "screen_name": "anandh_ks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1570	2002785901123117087	2025-12-21	Migrated from 2025-12-24	[]	{"name": "hckmstrrahul", "screen_name": "hckmstrrahul"}	{}	2026-01-12 18:39:35.301442	\N	\N
1571	2002982457621319714	2025-12-22	Migrated from 2025-12-24	[]	{"name": "shota7180", "screen_name": "shota7180"}	{}	2026-01-12 18:39:35.301442	\N	\N
1572	2002850340312412487	2025-12-21	Migrated from 2025-12-24	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1573	2002865460300460166	2025-12-21	Migrated from 2025-12-24	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1574	2002803581498560915	2025-12-21	Migrated from 2025-12-24	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1575	2002953995653144589	2025-12-22	Migrated from 2025-12-24	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1576	2002773947658760312	2025-12-21	Migrated from 2025-12-24	[]	{"name": "artisin_ai", "screen_name": "artisin_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1577	2002816605378457648	2025-12-21	Migrated from 2025-12-24	[]	{"name": "archi_reum", "screen_name": "archi_reum"}	{}	2026-01-12 18:39:35.301442	\N	\N
1578	2002736599612993663	2025-12-21	Migrated from 2025-12-24	[]	{"name": "Noguma_Morino", "screen_name": "Noguma_Morino"}	{}	2026-01-12 18:39:35.301442	\N	\N
1579	2002883935618130024	2025-12-21	Migrated from 2025-12-24	[]	{"name": "sudharps", "screen_name": "sudharps"}	{}	2026-01-12 18:39:35.301442	\N	\N
1580	2002824697013297266	2025-12-21	Migrated from 2025-12-24	[]	{"name": "elCarlosVega", "screen_name": "elCarlosVega"}	{}	2026-01-12 18:39:35.301442	\N	\N
1581	2002903228485165425	2025-12-22	Migrated from 2025-12-24	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1582	2002854097494687964	2025-12-21	Migrated from 2025-12-24	[]	{"name": "serena_ailab", "screen_name": "serena_ailab"}	{}	2026-01-12 18:39:35.301442	\N	\N
1583	2002968038157725969	2025-12-22	Migrated from 2025-12-24	[]	{"name": "itis_Jarvo33", "screen_name": "itis_Jarvo33"}	{}	2026-01-12 18:39:35.301442	\N	\N
1584	2002892122643665307	2025-12-22	Migrated from 2025-12-24	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
1585	2003064127221272647	2025-12-22	Migrated from 2025-12-24	[]	{"name": "Naiknelofar788", "screen_name": "Naiknelofar788"}	{}	2026-01-12 18:39:35.301442	\N	\N
1586	2003492885879226643	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
1587	2003657283830710686	2025-12-24	Migrated from 2025-12-24	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1588	2003495815571275826	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Dari_Designs", "screen_name": "Dari_Designs"}	{}	2026-01-12 18:39:35.301442	\N	\N
1589	2003669822857707527	2025-12-24	Migrated from 2025-12-24	[]	{"name": "Naiknelofar788", "screen_name": "Naiknelofar788"}	{}	2026-01-12 18:39:35.301442	\N	\N
1590	2003577573620785624	2025-12-23	Migrated from 2025-12-24	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
1591	2003670227452661814	2025-12-24	Migrated from 2025-12-24	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1592	2003605790603514100	2025-12-23	Migrated from 2025-12-24	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1593	2003544906166423603	2025-12-23	Migrated from 2025-12-24	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1594	2003472951681950139	2025-12-23	Migrated from 2025-12-24	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1595	2003513309878763529	2025-12-23	Migrated from 2025-12-24	[]	{"name": "madebygoogle", "screen_name": "madebygoogle"}	{}	2026-01-12 18:39:35.301442	\N	\N
1596	2003514212849496407	2025-12-23	Migrated from 2025-12-24	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1597	2003636275103023601	2025-12-24	Migrated from 2025-12-24	[]	{"name": "treydtw", "screen_name": "treydtw"}	{}	2026-01-12 18:39:35.301442	\N	\N
1598	2003466876115177544	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1599	2003675751372169359	2025-12-24	Migrated from 2025-12-24	[]	{"name": "notoro_ai", "screen_name": "notoro_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1600	2003515485506375757	2025-12-23	Migrated from 2025-12-24	[]	{"name": "SDT_side", "screen_name": "SDT_side"}	{}	2026-01-12 18:39:35.301442	\N	\N
1601	2003630089515188498	2025-12-24	Migrated from 2025-12-24	[]	{"name": "yyyole", "screen_name": "yyyole"}	{}	2026-01-12 18:39:35.301442	\N	\N
1602	2003673235142115757	2025-12-24	Migrated from 2025-12-24	[]	{"name": "iamsofiaijaz", "screen_name": "iamsofiaijaz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1603	2003797928767295636	2025-12-24	Migrated from 2025-12-24	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1604	2003553245499916501	2025-12-23	Migrated from 2025-12-24	[]	{"name": "firatbilal", "screen_name": "firatbilal"}	{}	2026-01-12 18:39:35.301442	\N	\N
1606	2003482443115004252	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1607	2003586938113232928	2025-12-23	Migrated from 2025-12-24	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1608	2003645804079141286	2025-12-24	Migrated from 2025-12-24	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
1609	2003512745619022070	2025-12-23	Migrated from 2025-12-24	[]	{"name": "RobotCleopatra", "screen_name": "RobotCleopatra"}	{}	2026-01-12 18:39:35.301442	\N	\N
1610	2003682425168363556	2025-12-24	Migrated from 2025-12-24	[]	{"name": "ChillaiKalan__", "screen_name": "ChillaiKalan__"}	{}	2026-01-12 18:39:35.301442	\N	\N
1611	2003522391654146544	2025-12-23	Migrated from 2025-12-24	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
1612	2003485705306247638	2025-12-23	Migrated from 2025-12-24	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1613	2003357322505257323	2025-12-23	Migrated from 2025-12-24	[]	{"name": "AdemVessell", "screen_name": "AdemVessell"}	{}	2026-01-12 18:39:35.301442	\N	\N
1614	2003388609651454417	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1615	2003351337925595555	2025-12-23	Migrated from 2025-12-24	[]	{"name": "yyyole", "screen_name": "yyyole"}	{}	2026-01-12 18:39:35.301442	\N	\N
1616	2003190555094786470	2025-12-22	Migrated from 2025-12-24	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1617	2003450046948548897	2025-12-23	Migrated from 2025-12-24	[]	{"name": "BeanieBlossom", "screen_name": "BeanieBlossom"}	{}	2026-01-12 18:39:35.301442	\N	\N
1618	2003419014018793838	2025-12-23	Migrated from 2025-12-24	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1619	2003286940288975016	2025-12-23	Migrated from 2025-12-24	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1620	2003152709713821811	2025-12-22	Migrated from 2025-12-24	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
1621	2003346545635364869	2025-12-23	Migrated from 2025-12-24	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1622	2003171679837782526	2025-12-22	Migrated from 2025-12-24	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1623	2003237826331378093	2025-12-22	Migrated from 2025-12-23	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1624	2003115097116602560	2025-12-22	Migrated from 2025-12-23	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1625	2003238450888343979	2025-12-22	Migrated from 2025-12-23	[]	{"name": "kabu_st0ck", "screen_name": "kabu_st0ck"}	{}	2026-01-12 18:39:35.301442	\N	\N
1626	2003121488950362263	2025-12-22	Migrated from 2025-12-23	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1627	2003265568082956498	2025-12-23	Migrated from 2025-12-23	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1628	2003278312068780283	2025-12-23	Migrated from 2025-12-23	[]	{"name": "kashmir_ki_lark", "screen_name": "kashmir_ki_lark"}	{}	2026-01-12 18:39:35.301442	\N	\N
1629	2003144371995345375	2025-12-22	Migrated from 2025-12-23	[]	{"name": "GammaApp", "screen_name": "GammaApp"}	{}	2026-01-12 18:39:35.301442	\N	\N
1630	2003146989060710828	2025-12-22	Migrated from 2025-12-23	[]	{"name": "fofrAI", "screen_name": "fofrAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
1631	2003300924283089325	2025-12-23	Migrated from 2025-12-23	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1632	2003212717448974417	2025-12-22	Migrated from 2025-12-23	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1633	2003282409316651022	2025-12-23	Migrated from 2025-12-23	[]	{"name": "nabe1975", "screen_name": "nabe1975"}	{}	2026-01-12 18:39:35.301442	\N	\N
1634	2003192691346276430	2025-12-22	Migrated from 2025-12-23	[]	{"name": "firemadeher", "screen_name": "firemadeher"}	{}	2026-01-12 18:39:35.301442	\N	\N
1635	2003127204247392375	2025-12-22	Migrated from 2025-12-23	[]	{"name": "anzedetn", "screen_name": "anzedetn"}	{}	2026-01-12 18:39:35.301442	\N	\N
1636	2003263283432763771	2025-12-23	Migrated from 2025-12-23	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1637	2003291111478182285	2025-12-23	Migrated from 2025-12-23	[]	{"name": "oreno_musume", "screen_name": "oreno_musume"}	{}	2026-01-12 18:39:35.301442	\N	\N
1638	2003145004219322716	2025-12-22	Migrated from 2025-12-23	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1639	2003122606527205436	2025-12-22	Migrated from 2025-12-23	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1640	2003139206944883080	2025-12-22	Migrated from 2025-12-23	[]	{"name": "iam_vampire_0", "screen_name": "iam_vampire_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1641	2003156101718581386	2025-12-22	Migrated from 2025-12-23	[]	{"name": "CharaspowerAI", "screen_name": "CharaspowerAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
1642	2003340602193379443	2025-12-23	Migrated from 2025-12-23	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1643	2003207787501764896	2025-12-22	Migrated from 2025-12-23	[]	{"name": "VibeMarketer_", "screen_name": "VibeMarketer_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1644	2003122267589325119	2025-12-22	Migrated from 2025-12-23	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
1645	2002977008738054335	2025-12-22	Migrated from 2025-12-23	[]	{"name": "minchoi", "screen_name": "minchoi"}	{}	2026-01-12 18:39:35.301442	\N	\N
1646	2003102928576364721	2025-12-22	Migrated from 2025-12-23	[]	{"name": "firatbilal", "screen_name": "firatbilal"}	{}	2026-01-12 18:39:35.301442	\N	\N
1647	2003091240997540275	2025-12-22	Migrated from 2025-12-23	[]	{"name": "sudharps", "screen_name": "sudharps"}	{}	2026-01-12 18:39:35.301442	\N	\N
1648	2003003721827987592	2025-12-22	Migrated from 2025-12-23	[]	{"name": "linxiaobei888", "screen_name": "linxiaobei888"}	{}	2026-01-12 18:39:35.301442	\N	\N
1649	2002878783511019665	2025-12-21	Migrated from 2025-12-23	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
1650	2003292603073339465	2025-12-23	Migrated from 2025-12-23	[]	{"name": "anandh_ks_", "screen_name": "anandh_ks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1651	2002967881085317532	2025-12-22	Migrated from 2025-12-23	[]	{"name": "Zar_xplorer", "screen_name": "Zar_xplorer"}	{}	2026-01-12 18:39:35.301442	\N	\N
1652	2002826415939682584	2025-12-21	Migrated from 2025-12-23	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1653	2003025725675204789	2025-12-22	Migrated from 2025-12-23	[]	{"name": "Adam38363368936", "screen_name": "Adam38363368936"}	{}	2026-01-12 18:39:35.301442	\N	\N
1654	2002784908847050941	2025-12-21	Migrated from 2025-12-23	[]	{"name": "David_eficaz", "screen_name": "David_eficaz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1683	2002293540299420050	2025-12-20	Migrated from 2025-12-21	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1684	2002574077043568841	2025-12-21	Migrated from 2025-12-21	[]	{"name": "yachimat_manga", "screen_name": "yachimat_manga"}	{}	2026-01-12 18:39:35.301442	\N	\N
1685	2002029348132721016	2025-12-19	Migrated from 2025-12-21	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1686	2002499177427988745	2025-12-20	Migrated from 2025-12-21	[]	{"name": "goo_vision", "screen_name": "goo_vision"}	{}	2026-01-12 18:39:35.301442	\N	\N
1687	2002013476370444766	2025-12-19	Migrated from 2025-12-21	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1688	2002102662293250378	2025-12-19	Migrated from 2025-12-21	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
1689	2002274024408191033	2025-12-20	Migrated from 2025-12-21	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1690	2002094285660020776	2025-12-19	Migrated from 2025-12-21	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1691	2002037335161217483	2025-12-19	Migrated from 2025-12-21	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1692	2002331770428272764	2025-12-20	Migrated from 2025-12-21	[]	{"name": "sergeantsref", "screen_name": "sergeantsref"}	{}	2026-01-12 18:39:35.301442	\N	\N
1693	2002334187177849245	2025-12-20	Migrated from 2025-12-21	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1694	2002371531272552636	2025-12-20	Migrated from 2025-12-21	[]	{"name": "LiEvanna85716", "screen_name": "LiEvanna85716"}	{}	2026-01-12 18:39:35.301442	\N	\N
1695	2002348716552823065	2025-12-20	Migrated from 2025-12-21	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
1696	2002582724280975530	2025-12-21	Migrated from 2025-12-21	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
1697	2002326764371038373	2025-12-20	Migrated from 2025-12-21	[]	{"name": "sundyme", "screen_name": "sundyme"}	{}	2026-01-12 18:39:35.301442	\N	\N
1698	2002324758558347586	2025-12-20	Migrated from 2025-12-21	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
1699	2002318771114160571	2025-12-20	Migrated from 2025-12-21	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1700	2002424619232588218	2025-12-20	Migrated from 2025-12-21	[]	{"name": "firatbilal", "screen_name": "firatbilal"}	{}	2026-01-12 18:39:35.301442	\N	\N
1701	2002294045213929785	2025-12-20	Migrated from 2025-12-21	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1702	2002263911413031260	2025-12-20	Migrated from 2025-12-21	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	\N	\N
1703	2002382591823896676	2025-12-20	Migrated from 2025-12-21	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
1704	2002114484903800832	2025-12-19	Migrated from 2025-12-21	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
1705	2002620048117293449	2025-12-21	Migrated from 2025-12-21	[]	{"name": "mimi_aiart", "screen_name": "mimi_aiart"}	{}	2026-01-12 18:39:35.301442	\N	\N
1706	2002055101780009380	2025-12-19	Migrated from 2025-12-21	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1707	2002032552245371164	2025-12-19	Migrated from 2025-12-21	[]	{"name": "jamesyeung18", "screen_name": "jamesyeung18"}	{}	2026-01-12 18:39:35.301442	\N	\N
1708	2002374559992066309	2025-12-20	Migrated from 2025-12-21	[]	{"name": "rionaifantasy", "screen_name": "rionaifantasy"}	{}	2026-01-12 18:39:35.301442	\N	\N
1709	2002116477307044203	2025-12-19	Migrated from 2025-12-21	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1710	2002209881122893887	2025-12-20	Migrated from 2025-12-21	[]	{"name": "ChillaiKalan__", "screen_name": "ChillaiKalan__"}	{}	2026-01-12 18:39:35.301442	\N	\N
1711	2002465235391967688	2025-12-20	Migrated from 2025-12-21	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
1712	2002457740543750561	2025-12-20	Migrated from 2025-12-21	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1713	2002307108050776474	2025-12-20	Migrated from 2025-12-21	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1714	2002272769485000968	2025-12-20	Migrated from 2025-12-21	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1715	2002054066319573287	2025-12-19	Migrated from 2025-12-21	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1716	2002167065755447661	2025-12-20	Migrated from 2025-12-21	[]	{"name": "tisch_eins", "screen_name": "tisch_eins"}	{}	2026-01-12 18:39:35.301442	\N	\N
1717	2002359398220640289	2025-12-20	Migrated from 2025-12-21	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1718	2002404581590831564	2025-12-20	Migrated from 2025-12-21	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1719	2002639331501224005	2025-12-21	Migrated from 2025-12-21	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1720	2002582470567604295	2025-12-21	Migrated from 2025-12-21	[]	{"name": "SimplyAnnisa", "screen_name": "SimplyAnnisa"}	{}	2026-01-12 18:39:35.301442	\N	\N
1721	2002567761151864933	2025-12-21	Migrated from 2025-12-21	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1722	2001678061662531590	2025-12-18	Migrated from 2025-12-19	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
1723	2001774497607667760	2025-12-18	Migrated from 2025-12-19	[]	{"name": "The_Sycomore", "screen_name": "The_Sycomore"}	{}	2026-01-12 18:39:35.301442	\N	\N
1724	2001653710745739419	2025-12-18	Migrated from 2025-12-19	[]	{"name": "lexx_aura", "screen_name": "lexx_aura"}	{}	2026-01-12 18:39:35.301442	\N	\N
1725	2001680146252669084	2025-12-18	Migrated from 2025-12-19	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1726	2001886993836343775	2025-12-19	Migrated from 2025-12-19	[]	{"name": "lexx_aura", "screen_name": "lexx_aura"}	{}	2026-01-12 18:39:35.301442	\N	\N
1727	2001663784402755832	2025-12-18	Migrated from 2025-12-19	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1728	2001828831615946768	2025-12-19	Migrated from 2025-12-19	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
1729	2001665608711049358	2025-12-18	Migrated from 2025-12-19	[]	{"name": "Samann_ai", "screen_name": "Samann_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1730	2001780049096376515	2025-12-18	Migrated from 2025-12-19	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1731	2001656897699733967	2025-12-18	Migrated from 2025-12-19	[]	{"name": "Taaruk_", "screen_name": "Taaruk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1732	2001734583830626635	2025-12-18	Migrated from 2025-12-19	[]	{"name": "miilesus", "screen_name": "miilesus"}	{}	2026-01-12 18:39:35.301442	\N	\N
1733	2001689993778249952	2025-12-18	Migrated from 2025-12-19	[]	{"name": "ecommartinez", "screen_name": "ecommartinez"}	{}	2026-01-12 18:39:35.301442	\N	\N
1734	2001685648768680052	2025-12-18	Migrated from 2025-12-19	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1735	2001695202600456576	2025-12-18	Migrated from 2025-12-19	[]	{"name": "FitzGPT", "screen_name": "FitzGPT"}	{}	2026-01-12 18:39:35.301442	\N	\N
1736	2001847957390549090	2025-12-19	Migrated from 2025-12-19	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
1737	2001932788023595077	2025-12-19	Migrated from 2025-12-19	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1738	2001944607714673042	2025-12-19	Migrated from 2025-12-19	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1739	2001719789937447400	2025-12-18	Migrated from 2025-12-19	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1740	2001687682922254670	2025-12-18	Migrated from 2025-12-19	[]	{"name": "nimentrix", "screen_name": "nimentrix"}	{}	2026-01-12 18:39:35.301442	\N	\N
1741	2001860294105272392	2025-12-19	Migrated from 2025-12-19	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1742	2001926457443135528	2025-12-19	Migrated from 2025-12-19	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1743	2001765272257204316	2025-12-18	Migrated from 2025-12-19	[]	{"name": "cfryant", "screen_name": "cfryant"}	{}	2026-01-12 18:39:35.301442	\N	\N
1744	2001903804233789545	2025-12-19	Migrated from 2025-12-19	[]	{"name": "Naiknelofar788", "screen_name": "Naiknelofar788"}	{}	2026-01-12 18:39:35.301442	\N	\N
1745	2001649477137109083	2025-12-18	Migrated from 2025-12-19	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1746	2001876716910972956	2025-12-19	Migrated from 2025-12-19	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1747	2001671041907855817	2025-12-18	Migrated from 2025-12-19	[]	{"name": "FuSheng_0306", "screen_name": "FuSheng_0306"}	{}	2026-01-12 18:39:35.301442	\N	\N
1748	2001865200765747349	2025-12-19	Migrated from 2025-12-19	[]	{"name": "bobbykun_banana", "screen_name": "bobbykun_banana"}	{}	2026-01-12 18:39:35.301442	\N	\N
1749	2001691201439707336	2025-12-18	Migrated from 2025-12-19	[]	{"name": "Ror_Fly", "screen_name": "Ror_Fly"}	{}	2026-01-12 18:39:35.301442	\N	\N
1750	2001909488790704447	2025-12-19	Migrated from 2025-12-19	[]	{"name": "Harboris_27", "screen_name": "Harboris_27"}	{}	2026-01-12 18:39:35.301442	\N	\N
1751	2001669259282313514	2025-12-18	Migrated from 2025-12-19	[]	{"name": "aziz4ai", "screen_name": "aziz4ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1752	2001591561302483267	2025-12-18	Migrated from 2025-12-19	[]	{"name": "linxiaobei888", "screen_name": "linxiaobei888"}	{}	2026-01-12 18:39:35.301442	\N	\N
1753	2001496988253147379	2025-12-18	Migrated from 2025-12-18	[]	{"name": "Tz_2022", "screen_name": "Tz_2022"}	{}	2026-01-12 18:39:35.301442	\N	\N
1754	2001254201611964524	2025-12-17	Migrated from 2025-12-18	[]	{"name": "xmliisu", "screen_name": "xmliisu"}	{}	2026-01-12 18:39:35.301442	\N	\N
1755	2001302056456339569	2025-12-17	Migrated from 2025-12-18	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1756	2001337146905690519	2025-12-17	Migrated from 2025-12-18	[]	{"name": "henrydaubrez", "screen_name": "henrydaubrez"}	{}	2026-01-12 18:39:35.301442	\N	\N
1757	2001232399368380637	2025-12-17	Migrated from 2025-12-18	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1758	2001359237956686318	2025-12-17	Migrated from 2025-12-18	[]	{"name": "bananababydoll", "screen_name": "bananababydoll"}	{}	2026-01-12 18:39:35.301442	\N	\N
1759	2001357165328797846	2025-12-17	Migrated from 2025-12-18	[]	{"name": "KeorUnreal", "screen_name": "KeorUnreal"}	{}	2026-01-12 18:39:35.301442	\N	\N
1760	2001356375226749254	2025-12-17	Migrated from 2025-12-18	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
1761	2001258985358606605	2025-12-17	Migrated from 2025-12-18	[]	{"name": "Gorden_Sun", "screen_name": "Gorden_Sun"}	{}	2026-01-12 18:39:35.301442	\N	\N
1762	2001461574226346054	2025-12-18	Migrated from 2025-12-18	[]	{"name": "msjiaozhu", "screen_name": "msjiaozhu"}	{}	2026-01-12 18:39:35.301442	\N	\N
1763	2001371445939814798	2025-12-17	Migrated from 2025-12-18	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1764	2001497637124739363	2025-12-18	Migrated from 2025-12-18	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1765	2001295116242137501	2025-12-17	Migrated from 2025-12-18	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1766	2001265620449444251	2025-12-17	Migrated from 2025-12-18	[]	{"name": "gokayfem", "screen_name": "gokayfem"}	{}	2026-01-12 18:39:35.301442	\N	\N
1767	2001504388108685376	2025-12-18	Migrated from 2025-12-18	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1768	2001538350642008147	2025-12-18	Migrated from 2025-12-18	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1769	2001575999805235246	2025-12-18	Migrated from 2025-12-18	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1770	2001566101508128839	2025-12-18	Migrated from 2025-12-18	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1771	2001635511153365355	2025-12-18	Migrated from 2025-12-18	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1772	2001562159499870510	2025-12-18	Migrated from 2025-12-18	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	\N	\N
1773	2001609137290187054	2025-12-18	Migrated from 2025-12-18	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1774	2001465758375985251	2025-12-18	Migrated from 2025-12-18	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
1775	2001632722939449829	2025-12-18	Migrated from 2025-12-18	[]	{"name": "ninohut", "screen_name": "ninohut"}	{}	2026-01-12 18:39:35.301442	\N	\N
1776	2001428766921208194	2025-12-17	Migrated from 2025-12-18	[]	{"name": "369labsx", "screen_name": "369labsx"}	{}	2026-01-12 18:39:35.301442	\N	\N
1777	2001357979312898252	2025-12-17	Migrated from 2025-12-18	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1778	2001548086389145909	2025-12-18	Migrated from 2025-12-18	[]	{"name": "LudovicCreator", "screen_name": "LudovicCreator"}	{}	2026-01-12 18:39:35.301442	\N	\N
1779	2001314921250771261	2025-12-17	Migrated from 2025-12-18	[]	{"name": "aiwarts", "screen_name": "aiwarts"}	{}	2026-01-12 18:39:35.301442	\N	\N
1780	2001181398774726784	2025-12-17	Migrated from 2025-12-18	[]	{"name": "s_tiva", "screen_name": "s_tiva"}	{}	2026-01-12 18:39:35.301442	\N	\N
1781	2001238094457266531	2025-12-17	Migrated from 2025-12-18	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
1782	2001234210409857077	2025-12-17	Migrated from 2025-12-18	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
1783	2001026408538050733	2025-12-16	Migrated from 2025-12-18	[]	{"name": "AleRVG", "screen_name": "AleRVG"}	{}	2026-01-12 18:39:35.301442	\N	\N
1784	2001560723173052612	2025-12-18	Migrated from 2025-12-18	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
1785	2001435741675536629	2025-12-17	Migrated from 2025-12-18	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1786	2000924143768994060	2025-12-16	Migrated from 2025-12-17	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1787	2001016550132998332	2025-12-16	Migrated from 2025-12-17	[]	{"name": "ZHO_ZHO_ZHO", "screen_name": "ZHO_ZHO_ZHO"}	{}	2026-01-12 18:39:35.301442	\N	\N
1788	2001006412428927325	2025-12-16	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1789	2001021119441330425	2025-12-16	Migrated from 2025-12-17	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1790	2001099339557728610	2025-12-17	Migrated from 2025-12-17	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1791	2001213277695828260	2025-12-17	Migrated from 2025-12-17	[]	{"name": "loveko28516", "screen_name": "loveko28516"}	{}	2026-01-12 18:39:35.301442	\N	\N
1792	2001170333697532092	2025-12-17	Migrated from 2025-12-17	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1793	2001121663409131997	2025-12-17	Migrated from 2025-12-17	[]	{"name": "Citrini7", "screen_name": "Citrini7"}	{}	2026-01-12 18:39:35.301442	\N	\N
1794	2001099080013885897	2025-12-17	Migrated from 2025-12-17	[]	{"name": "condzxyz", "screen_name": "condzxyz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1795	2001198742998016062	2025-12-17	Migrated from 2025-12-17	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
1796	2001140411134566560	2025-12-17	Migrated from 2025-12-17	[]	{"name": "john_my07", "screen_name": "john_my07"}	{}	2026-01-12 18:39:35.301442	\N	\N
1797	2001195029243806072	2025-12-17	Migrated from 2025-12-17	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1798	2001145459436609681	2025-12-17	Migrated from 2025-12-17	[]	{"name": "MissMi1973", "screen_name": "MissMi1973"}	{}	2026-01-12 18:39:35.301442	\N	\N
1799	2001173440661999755	2025-12-17	Migrated from 2025-12-17	[]	{"name": "AIwithSynthia", "screen_name": "AIwithSynthia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1800	2001208017828622547	2025-12-17	Migrated from 2025-12-17	[]	{"name": "AIwithkhan", "screen_name": "AIwithkhan"}	{}	2026-01-12 18:39:35.301442	\N	\N
1801	2001119658863460468	2025-12-17	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1802	2001132241746059418	2025-12-17	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1803	2000937161361908002	2025-12-16	Migrated from 2025-12-17	[]	{"name": "helinvision", "screen_name": "helinvision"}	{}	2026-01-12 18:39:35.301442	\N	\N
1804	2000875793279271105	2025-12-16	Migrated from 2025-12-17	[]	{"name": "linxiaobei888", "screen_name": "linxiaobei888"}	{}	2026-01-12 18:39:35.301442	\N	\N
1805	2001003373336912147	2025-12-16	Migrated from 2025-12-17	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1807	2001054439453393220	2025-12-16	Migrated from 2025-12-17	[]	{"name": "techhalla", "screen_name": "techhalla"}	{}	2026-01-12 18:39:35.301442	\N	\N
1808	2000794831212449909	2025-12-16	Migrated from 2025-12-17	[]	{"name": "linxiaobei888", "screen_name": "linxiaobei888"}	{}	2026-01-12 18:39:35.301442	\N	\N
1809	2000870769690083586	2025-12-16	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1810	2000976213637259621	2025-12-16	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1811	2000795774628847894	2025-12-16	Migrated from 2025-12-17	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1812	2000922964011712945	2025-12-16	Migrated from 2025-12-17	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1813	2000972445285802114	2025-12-16	Migrated from 2025-12-17	[]	{"name": "venturetwins", "screen_name": "venturetwins"}	{}	2026-01-12 18:39:35.301442	\N	\N
1814	2001229482556805340	2025-12-17	Migrated from 2025-12-17	[]	{"name": "xiaojietongxue", "screen_name": "xiaojietongxue"}	{}	2026-01-12 18:39:35.301442	\N	\N
1815	2001131680657236398	2025-12-17	Migrated from 2025-12-17	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1816	2001095643901911426	2025-12-17	Migrated from 2025-12-17	[]	{"name": "berryxia", "screen_name": "berryxia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1817	2001074969397350640	2025-12-16	Migrated from 2025-12-17	[]	{"name": "SSSS_CRYPTOMAN", "screen_name": "SSSS_CRYPTOMAN"}	{}	2026-01-12 18:39:35.301442	\N	\N
1818	2001041553243168827	2025-12-16	Migrated from 2025-12-17	[]	{"name": "miilesus", "screen_name": "miilesus"}	{}	2026-01-12 18:39:35.301442	\N	\N
1819	2000772380034060296	2025-12-16	Migrated from 2025-12-16	[]	{"name": "imxiaohu", "screen_name": "imxiaohu"}	{}	2026-01-12 18:39:35.301442	\N	\N
1820	2000884207028179418	2025-12-16	Migrated from 2025-12-16	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1821	2000768697905066412	2025-12-16	Migrated from 2025-12-16	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1822	2000879410308899138	2025-12-16	Migrated from 2025-12-16	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1823	2000858454580404608	2025-12-16	Migrated from 2025-12-16	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1824	2000852751463670215	2025-12-16	Migrated from 2025-12-16	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1825	2000769215989489837	2025-12-16	Migrated from 2025-12-16	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1826	2000553282767597705	2025-12-15	Migrated from 2025-12-16	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1827	2000760405921292406	2025-12-16	Migrated from 2025-12-16	[]	{"name": "94vanAI", "screen_name": "94vanAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
1828	2000510998059594194	2025-12-15	Migrated from 2025-12-16	[]	{"name": "cheese_ai07", "screen_name": "cheese_ai07"}	{}	2026-01-12 18:39:35.301442	\N	\N
1829	2000901950767030306	2025-12-16	Migrated from 2025-12-16	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1830	2000254730849648772	2025-12-14	Migrated from 2025-12-16	[]	{"name": "AltugAkgul", "screen_name": "AltugAkgul"}	{}	2026-01-12 18:39:35.301442	\N	\N
1831	2000637372594352557	2025-12-15	Migrated from 2025-12-16	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
1832	2000610680500785532	2025-12-15	Migrated from 2025-12-16	[]	{"name": "DilumSanjaya", "screen_name": "DilumSanjaya"}	{}	2026-01-12 18:39:35.301442	\N	\N
1833	2000375992519397793	2025-12-15	Migrated from 2025-12-16	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1867	1999428719510016329	2025-12-12	Migrated from 2025-12-15	[]	{"name": "eviljer", "screen_name": "eviljer"}	{}	2026-01-12 18:39:35.301442	\N	\N
1868	1999899621351628819	2025-12-13	Migrated from 2025-12-15	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1869	2000111848377774098	2025-12-14	Migrated from 2025-12-15	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1870	1999897733931712531	2025-12-13	Migrated from 2025-12-15	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1871	2000065593920131226	2025-12-14	Migrated from 2025-12-15	[]	{"name": "minchoi", "screen_name": "minchoi"}	{}	2026-01-12 18:39:35.301442	\N	\N
1872	2000163216559673368	2025-12-14	Migrated from 2025-12-15	[]	{"name": "Samann_ai", "screen_name": "Samann_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1873	2000055154415182214	2025-12-14	Migrated from 2025-12-15	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
1874	1999792195818148245	2025-12-13	Migrated from 2025-12-15	[]	{"name": "ghumare64", "screen_name": "ghumare64"}	{}	2026-01-12 18:39:35.301442	\N	\N
1875	2000072345852252581	2025-12-14	Migrated from 2025-12-15	[]	{"name": "SimplyAnnisa", "screen_name": "SimplyAnnisa"}	{}	2026-01-12 18:39:35.301442	\N	\N
1876	1999863955930612197	2025-12-13	Migrated from 2025-12-15	[]	{"name": "ChillaiKalan__", "screen_name": "ChillaiKalan__"}	{}	2026-01-12 18:39:35.301442	\N	\N
1877	2000043275873554443	2025-12-14	Migrated from 2025-12-15	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
1878	1999836271829483573	2025-12-13	Migrated from 2025-12-15	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1879	1999851240872903083	2025-12-13	Migrated from 2025-12-15	[]	{"name": "Zar_xplorer", "screen_name": "Zar_xplorer"}	{}	2026-01-12 18:39:35.301442	\N	\N
1880	1999851244010270742	2025-12-13	Migrated from 2025-12-15	[]	{"name": "yuanzhe68949664", "screen_name": "yuanzhe68949664"}	{}	2026-01-12 18:39:35.301442	\N	\N
1881	1999679436791378186	2025-12-13	Migrated from 2025-12-15	[]	{"name": "canghecode", "screen_name": "canghecode"}	{}	2026-01-12 18:39:35.301442	\N	\N
1882	2000192249041396023	2025-12-14	Migrated from 2025-12-15	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1883	1999790488300421289	2025-12-13	Migrated from 2025-12-15	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
1884	1999892192790495237	2025-12-13	Migrated from 2025-12-15	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1885	2000203440413085967	2025-12-14	Migrated from 2025-12-15	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1886	1999623882568008136	2025-12-12	Migrated from 2025-12-15	[]	{"name": "LufzzLiz", "screen_name": "LufzzLiz"}	{}	2026-01-12 18:39:35.301442	\N	\N
1887	1999811065933410795	2025-12-13	Migrated from 2025-12-15	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1943	1999844681723838939	2025-12-13	Migrated from 2025-12-13	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
1944	1999470440008339551	2025-12-12	Migrated from 2025-12-13	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1945	1999785618197602736	2025-12-13	Migrated from 2025-12-13	[]	{"name": "Gdgtify", "screen_name": "Gdgtify"}	{}	2026-01-12 18:39:35.301442	\N	\N
1946	1999804272696029616	2025-12-13	Migrated from 2025-12-13	[]	{"name": "techhalla", "screen_name": "techhalla"}	{}	2026-01-12 18:39:35.301442	\N	\N
1947	1999810957829419218	2025-12-13	Migrated from 2025-12-13	[]	{"name": "SimplyAnnisa", "screen_name": "SimplyAnnisa"}	{}	2026-01-12 18:39:35.301442	\N	\N
1948	1999781038177063373	2025-12-13	Migrated from 2025-12-13	[]	{"name": "NanoBanana_labs", "screen_name": "NanoBanana_labs"}	{}	2026-01-12 18:39:35.301442	\N	\N
1949	1999784969363681297	2025-12-13	Migrated from 2025-12-13	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1950	1999807671156056526	2025-12-13	Migrated from 2025-12-13	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1951	1999796326855266780	2025-12-13	Migrated from 2025-12-13	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1952	1999793209711767869	2025-12-13	Migrated from 2025-12-13	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
1953	1999171087314112585	2025-12-11	Migrated from 2025-12-13	[]	{"name": "CharaspowerAI", "screen_name": "CharaspowerAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
1954	1999132126600429673	2025-12-11	Migrated from 2025-12-13	[]	{"name": "michaelrabone", "screen_name": "michaelrabone"}	{}	2026-01-12 18:39:35.301442	\N	\N
1955	1999283860589122025	2025-12-12	Migrated from 2025-12-13	[]	{"name": "cartunmafia", "screen_name": "cartunmafia"}	{}	2026-01-12 18:39:35.301442	\N	\N
1973	1999148326948647111	2025-12-11	Migrated from 2025-12-12	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1974	1998983028824223774	2025-12-11	Migrated from 2025-12-12	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1975	1999149732967428590	2025-12-11	Migrated from 2025-12-12	[]	{"name": "HBCoop_", "screen_name": "HBCoop_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1976	1999126004581970001	2025-12-11	Migrated from 2025-12-12	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
1978	1999451413362233356	2025-12-12	Migrated from 2025-12-12	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1979	1999412984809128039	2025-12-12	Migrated from 2025-12-12	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1980	1999365925125161263	2025-12-12	Migrated from 2025-12-12	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
1981	1999412526099140816	2025-12-12	Migrated from 2025-12-12	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
1982	1999359967091134925	2025-12-12	Migrated from 2025-12-12	[]	{"name": "ratman_aiillust", "screen_name": "ratman_aiillust"}	{}	2026-01-12 18:39:35.301442	\N	\N
1983	1999420450527674604	2025-12-12	Migrated from 2025-12-12	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
1984	1999381066076029372	2025-12-12	Migrated from 2025-12-12	[]	{"name": "IamEmily2050", "screen_name": "IamEmily2050"}	{}	2026-01-12 18:39:35.301442	\N	\N
1985	1999296679355224068	2025-12-12	Migrated from 2025-12-12	[]	{"name": "gaucheai", "screen_name": "gaucheai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1986	1999410735890182457	2025-12-12	Migrated from 2025-12-12	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
1987	1999400673503510668	2025-12-12	Migrated from 2025-12-12	[]	{"name": "studio_veco", "screen_name": "studio_veco"}	{}	2026-01-12 18:39:35.301442	\N	\N
1988	1999315512287986006	2025-12-12	Migrated from 2025-12-12	[]	{"name": "ChillaiKalan__", "screen_name": "ChillaiKalan__"}	{}	2026-01-12 18:39:35.301442	\N	\N
1989	1999327332100915615	2025-12-12	Migrated from 2025-12-12	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
1990	1999327489123057785	2025-12-12	Migrated from 2025-12-12	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
1991	1999329206698979483	2025-12-12	Migrated from 2025-12-12	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
1992	1999330075465162974	2025-12-12	Migrated from 2025-12-12	[]	{"name": "moshimoshi_ai", "screen_name": "moshimoshi_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
1993	1999334788319314229	2025-12-12	Migrated from 2025-12-12	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
1994	1999344734595350744	2025-12-12	Migrated from 2025-12-12	[]	{"name": "0xbisc", "screen_name": "0xbisc"}	{}	2026-01-12 18:39:35.301442	\N	\N
1995	1999350454980067595	2025-12-12	Migrated from 2025-12-12	[]	{"name": "KanaWorks_AI", "screen_name": "KanaWorks_AI"}	{}	2026-01-12 18:39:35.301442	\N	\N
1996	1999326915564556296	2025-12-12	Migrated from 2025-12-12	[]	{"name": "Naiknelofar788", "screen_name": "Naiknelofar788"}	{}	2026-01-12 18:39:35.301442	\N	\N
1997	1999362297614205280	2025-12-12	Migrated from 2025-12-12	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
1998	1999352638677352886	2025-12-12	Migrated from 2025-12-12	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
1999	1999336496357343569	2025-12-12	Migrated from 2025-12-12	[]	{"name": "KanaWorks_AI", "screen_name": "KanaWorks_AI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2000	1999345384850939994	2025-12-12	Migrated from 2025-12-12	[]	{"name": "SSSS_CRYPTOMAN", "screen_name": "SSSS_CRYPTOMAN"}	{}	2026-01-12 18:39:35.301442	\N	\N
2001	1999347995343749556	2025-12-12	Migrated from 2025-12-12	[]	{"name": "so_ainsight", "screen_name": "so_ainsight"}	{}	2026-01-12 18:39:35.301442	\N	\N
2002	1999351093814554701	2025-12-12	Migrated from 2025-12-12	[]	{"name": "langzihan", "screen_name": "langzihan"}	{}	2026-01-12 18:39:35.301442	\N	\N
2003	1999319848640479667	2025-12-12	Migrated from 2025-12-12	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2022	1999055240394350857	2025-12-11	Migrated from 2025-12-11	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
2023	1999110884879221052	2025-12-11	Migrated from 2025-12-11	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2024	1999106224663691749	2025-12-11	Migrated from 2025-12-11	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2025	1998796120386920915	2025-12-10	Migrated from 2025-12-11	[]	{"name": "Mr_AllenT", "screen_name": "Mr_AllenT"}	{}	2026-01-12 18:39:35.301442	\N	\N
2026	1999010596101173683	2025-12-11	Migrated from 2025-12-11	[]	{"name": "Taaruk_", "screen_name": "Taaruk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2027	1998672791823081648	2025-12-10	Migrated from 2025-12-11	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
2028	1998854511092445209	2025-12-10	Migrated from 2025-12-11	[]	{"name": "dhumann", "screen_name": "dhumann"}	{}	2026-01-12 18:39:35.301442	\N	\N
2029	1998674412271448083	2025-12-10	Migrated from 2025-12-11	[]	{"name": "BeautyVerse_Lab", "screen_name": "BeautyVerse_Lab"}	{}	2026-01-12 18:39:35.301442	\N	\N
2030	1999092732745376122	2025-12-11	Migrated from 2025-12-11	[]	{"name": "yammmy_hedgehog", "screen_name": "yammmy_hedgehog"}	{}	2026-01-12 18:39:35.301442	\N	\N
2032	1999015185265418443	2025-12-11	Migrated from 2025-12-11	[]	{"name": "Whizz_ai", "screen_name": "Whizz_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2033	1998742687441211628	2025-12-10	Migrated from 2025-12-11	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2034	1998699298935157036	2025-12-10	Migrated from 2025-12-11	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2035	1998779213911036413	2025-12-10	Migrated from 2025-12-11	[]	{"name": "ai_for_success", "screen_name": "ai_for_success"}	{}	2026-01-12 18:39:35.301442	\N	\N
2036	1998788553199759852	2025-12-10	Migrated from 2025-12-11	[]	{"name": "anvishapai", "screen_name": "anvishapai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2037	1998763602304741437	2025-12-10	Migrated from 2025-12-11	[]	{"name": "underwoodxie96", "screen_name": "underwoodxie96"}	{}	2026-01-12 18:39:35.301442	\N	\N
2038	1998641973943742577	2025-12-10	Migrated from 2025-12-11	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2039	1998692829934113159	2025-12-10	Migrated from 2025-12-11	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
2040	1999042753250955381	2025-12-11	Migrated from 2025-12-11	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
2041	1998546985889182079	2025-12-10	Migrated from 2025-12-11	[]	{"name": "kei31", "screen_name": "kei31"}	{}	2026-01-12 18:39:35.301442	\N	\N
2042	1998720751806066916	2025-12-10	Migrated from 2025-12-11	[]	{"name": "ReflctWillie", "screen_name": "ReflctWillie"}	{}	2026-01-12 18:39:35.301442	\N	\N
2043	1999056218040803704	2025-12-11	Migrated from 2025-12-11	[]	{"name": "Limorio_", "screen_name": "Limorio_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2044	1998536836248121654	2025-12-09	Migrated from 2025-12-11	[]	{"name": "stitchbygoogle", "screen_name": "stitchbygoogle"}	{}	2026-01-12 18:39:35.301442	\N	\N
2062	1998696103198257266	2025-12-10	Migrated from 2025-12-10	[]	{"name": "Just_sharon7", "screen_name": "Just_sharon7"}	{}	2026-01-12 18:39:35.301442	\N	\N
2063	1998731131605164500	2025-12-10	Migrated from 2025-12-10	[]	{"name": "sonucnc2", "screen_name": "sonucnc2"}	{}	2026-01-12 18:39:35.301442	\N	\N
2064	1998578920929796116	2025-12-10	Migrated from 2025-12-10	[]	{"name": "berryxia_ai", "screen_name": "berryxia_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2065	1998295854977798310	2025-12-09	Migrated from 2025-12-10	[]	{"name": "guicastellanos1", "screen_name": "guicastellanos1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2067	1998288112313852049	2025-12-09	Migrated from 2025-12-10	[]	{"name": "hAru_mAki_ch", "screen_name": "hAru_mAki_ch"}	{}	2026-01-12 18:39:35.301442	\N	\N
2068	1998415308197961980	2025-12-09	Migrated from 2025-12-10	[]	{"name": "TheMattBerman", "screen_name": "TheMattBerman"}	{}	2026-01-12 18:39:35.301442	\N	\N
2069	1998425357066633672	2025-12-09	Migrated from 2025-12-10	[]	{"name": "xmliisu", "screen_name": "xmliisu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2072	1998701627872628962	2025-12-10	Migrated from 2025-12-10	[]	{"name": "gizakdag", "screen_name": "gizakdag"}	{}	2026-01-12 18:39:35.301442	\N	\N
2073	1998355915456790916	2025-12-09	Migrated from 2025-12-10	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2074	1998205632210514154	2025-12-09	Migrated from 2025-12-10	[]	{"name": "Ror_Fly", "screen_name": "Ror_Fly"}	{}	2026-01-12 18:39:35.301442	\N	\N
2075	1998432410749243785	2025-12-09	Migrated from 2025-12-10	[]	{"name": "ClaireSilver12", "screen_name": "ClaireSilver12"}	{}	2026-01-12 18:39:35.301442	\N	\N
2076	1998322749635453433	2025-12-09	Migrated from 2025-12-10	[]	{"name": "SSSS_CRYPTOMAN", "screen_name": "SSSS_CRYPTOMAN"}	{}	2026-01-12 18:39:35.301442	\N	\N
2077	1998532837159612560	2025-12-09	Migrated from 2025-12-10	[]	{"name": "_smcf", "screen_name": "_smcf"}	{}	2026-01-12 18:39:35.301442	\N	\N
2078	1998524802458620126	2025-12-09	Migrated from 2025-12-10	[]	{"name": "ksmhope", "screen_name": "ksmhope"}	{}	2026-01-12 18:39:35.301442	\N	\N
2079	1998500668307550717	2025-12-09	Migrated from 2025-12-10	[]	{"name": "karim_yourself", "screen_name": "karim_yourself"}	{}	2026-01-12 18:39:35.301442	\N	\N
2080	1998528333991289233	2025-12-09	Migrated from 2025-12-10	[]	{"name": "so_ainsight", "screen_name": "so_ainsight"}	{}	2026-01-12 18:39:35.301442	\N	\N
2081	1998531548698591377	2025-12-09	Migrated from 2025-12-10	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2082	1998507691191447857	2025-12-09	Migrated from 2025-12-10	[]	{"name": "ratman_aiillust", "screen_name": "ratman_aiillust"}	{}	2026-01-12 18:39:35.301442	\N	\N
2083	1998530853882704339	2025-12-09	Migrated from 2025-12-10	[]	{"name": "sasakitoshinao", "screen_name": "sasakitoshinao"}	{}	2026-01-12 18:39:35.301442	\N	\N
2084	1998531645767561717	2025-12-09	Migrated from 2025-12-10	[]	{"name": "paularambles", "screen_name": "paularambles"}	{}	2026-01-12 18:39:35.301442	\N	\N
2085	1998519906594361798	2025-12-09	Migrated from 2025-12-10	[]	{"name": "testingcatalog", "screen_name": "testingcatalog"}	{}	2026-01-12 18:39:35.301442	\N	\N
2086	1998515878682657010	2025-12-09	Migrated from 2025-12-10	[]	{"name": "Angaisb_", "screen_name": "Angaisb_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2087	1998506135951946116	2025-12-09	Migrated from 2025-12-10	[]	{"name": "minchoi", "screen_name": "minchoi"}	{}	2026-01-12 18:39:35.301442	\N	\N
2088	1998512488804135227	2025-12-09	Migrated from 2025-12-10	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
2089	1998501408098668983	2025-12-09	Migrated from 2025-12-10	[]	{"name": "gizakdag", "screen_name": "gizakdag"}	{}	2026-01-12 18:39:35.301442	\N	\N
2091	1998520025951752278	2025-12-09	Migrated from 2025-12-10	[]	{"name": "emollick", "screen_name": "emollick"}	{}	2026-01-12 18:39:35.301442	\N	\N
2092	1998436448589209888	2025-12-09	Migrated from 2025-12-10	[]	{"name": "DilumSanjaya", "screen_name": "DilumSanjaya"}	{}	2026-01-12 18:39:35.301442	\N	\N
2093	1998345919557976570	2025-12-09	Migrated from 2025-12-10	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2094	1998604652817039633	2025-12-10	Migrated from 2025-12-10	[]	{"name": "rionaifantasy", "screen_name": "rionaifantasy"}	{}	2026-01-12 18:39:35.301442	\N	\N
2095	1998411514722804219	2025-12-09	Migrated from 2025-12-10	[]	{"name": "berryxia_ai", "screen_name": "berryxia_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2096	1998342042762797067	2025-12-09	Migrated from 2025-12-10	[]	{"name": "langzihan", "screen_name": "langzihan"}	{}	2026-01-12 18:39:35.301442	\N	\N
2097	1998397446628806709	2025-12-09	Migrated from 2025-12-10	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2098	1998434974186586128	2025-12-09	Migrated from 2025-12-10	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2099	1998381912923275296	2025-12-09	Migrated from 2025-12-10	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2100	1998095424394007000	2025-12-08	Migrated from 2025-12-10	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2101	1998528702150488069	2025-12-09	Migrated from 2025-12-10	[]	{"name": "mmmiyama_D", "screen_name": "mmmiyama_D"}	{}	2026-01-12 18:39:35.301442	\N	\N
2102	1998276476832227755	2025-12-09	Migrated from 2025-12-10	[]	{"name": "rovvmut_", "screen_name": "rovvmut_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2103	1998467773714886818	2025-12-09	Migrated from 2025-12-10	[]	{"name": "HBCoop_", "screen_name": "HBCoop_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2104	1998299295586693397	2025-12-09	Migrated from 2025-12-10	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
2105	1998379017171513605	2025-12-09	Migrated from 2025-12-10	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
2106	1998395439998194144	2025-12-09	Migrated from 2025-12-10	[]	{"name": "iX00AI", "screen_name": "iX00AI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2107	1998558284874133774	2025-12-10	Migrated from 2025-12-10	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2108	1998392470464503963	2025-12-09	Migrated from 2025-12-10	[]	{"name": "azed_ai", "screen_name": "azed_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2109	1998557707247431784	2025-12-10	Migrated from 2025-12-10	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
2128	1998073730887717331	2025-12-08	Migrated from 2025-12-09	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
2129	1997994131193581787	2025-12-08	Migrated from 2025-12-09	[]	{"name": "Just_sharon7", "screen_name": "Just_sharon7"}	{}	2026-01-12 18:39:35.301442	\N	\N
2130	1998007374901314009	2025-12-08	Migrated from 2025-12-09	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2131	1998135786059759944	2025-12-08	Migrated from 2025-12-09	[]	{"name": "NanoBanana_labs", "screen_name": "NanoBanana_labs"}	{}	2026-01-12 18:39:35.301442	\N	\N
2132	1997989447514915269	2025-12-08	Migrated from 2025-12-09	[]	{"name": "genspark_ai", "screen_name": "genspark_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2133	1997914731097788777	2025-12-08	Migrated from 2025-12-09	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
2134	1998151360446181626	2025-12-08	Migrated from 2025-12-09	[]	{"name": "stitchbygoogle", "screen_name": "stitchbygoogle"}	{}	2026-01-12 18:39:35.301442	\N	\N
2135	1997930530130866415	2025-12-08	Migrated from 2025-12-09	[]	{"name": "sidharthgehlot", "screen_name": "sidharthgehlot"}	{}	2026-01-12 18:39:35.301442	\N	\N
2136	1998079742495662208	2025-12-08	Migrated from 2025-12-09	[]	{"name": "GeminiApp", "screen_name": "GeminiApp"}	{}	2026-01-12 18:39:35.301442	\N	\N
2137	1997969417897189392	2025-12-08	Migrated from 2025-12-09	[]	{"name": "ChatgptAIskill", "screen_name": "ChatgptAIskill"}	{}	2026-01-12 18:39:35.301442	\N	\N
2138	1997969497656103080	2025-12-08	Migrated from 2025-12-09	[]	{"name": "wad0427", "screen_name": "wad0427"}	{}	2026-01-12 18:39:35.301442	\N	\N
2139	1997971252858982531	2025-12-08	Migrated from 2025-12-09	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2140	1998085942201163905	2025-12-08	Migrated from 2025-12-09	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2141	1998108703598489975	2025-12-08	Migrated from 2025-12-09	[]	{"name": "GoogleLabs", "screen_name": "GoogleLabs"}	{}	2026-01-12 18:39:35.301442	\N	\N
2142	1998125863867646449	2025-12-08	Migrated from 2025-12-09	[]	{"name": "3DVR3", "screen_name": "3DVR3"}	{}	2026-01-12 18:39:35.301442	\N	\N
2143	1995542490049290680	2025-12-01	Migrated from 2025-12-09	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	\N	\N
2144	1998013173123686795	2025-12-08	Migrated from 2025-12-09	[]	{"name": "Samann_ai", "screen_name": "Samann_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2145	1998041013890240989	2025-12-08	Migrated from 2025-12-09	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2146	1998073768472895778	2025-12-08	Migrated from 2025-12-09	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2147	1998081129384214575	2025-12-08	Migrated from 2025-12-09	[]	{"name": "showheyohtaki", "screen_name": "showheyohtaki"}	{}	2026-01-12 18:39:35.301442	\N	\N
2148	1998083664731901976	2025-12-08	Migrated from 2025-12-09	[]	{"name": "Cydiar404", "screen_name": "Cydiar404"}	{}	2026-01-12 18:39:35.301442	\N	\N
2150	1998216948963012952	2025-12-09	Migrated from 2025-12-09	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2151	1997891381147091420	2025-12-08	Migrated from 2025-12-09	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2152	1997968243286241546	2025-12-08	Migrated from 2025-12-09	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2153	1997992786474459442	2025-12-08	Migrated from 2025-12-09	[]	{"name": "SDT_side", "screen_name": "SDT_side"}	{}	2026-01-12 18:39:35.301442	\N	\N
2154	1997925279948534056	2025-12-08	Migrated from 2025-12-09	[]	{"name": "qisi_ai", "screen_name": "qisi_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2155	1997908793573978587	2025-12-08	Migrated from 2025-12-09	[]	{"name": "SDT_side", "screen_name": "SDT_side"}	{}	2026-01-12 18:39:35.301442	\N	\N
2156	1998019669593055372	2025-12-08	Migrated from 2025-12-09	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2157	1997824265215684761	2025-12-08	Migrated from 2025-12-09	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2158	1997819640874205685	2025-12-08	Migrated from 2025-12-09	[]	{"name": "ReflctWillie", "screen_name": "ReflctWillie"}	{}	2026-01-12 18:39:35.301442	\N	\N
2176	1998024889530216629	2025-12-08	Migrated from 2025-12-08	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2177	1997943993943134554	2025-12-08	Migrated from 2025-12-08	[]	{"name": "brad_zhang2024", "screen_name": "brad_zhang2024"}	{}	2026-01-12 18:39:35.301442	\N	\N
2179	1997901519643983935	2025-12-08	Migrated from 2025-12-08	[]	{"name": "xmliisu", "screen_name": "xmliisu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2180	1997909307682079051	2025-12-08	Migrated from 2025-12-08	[]	{"name": "lexx_aura", "screen_name": "lexx_aura"}	{}	2026-01-12 18:39:35.301442	\N	\N
2181	1997961046552985910	2025-12-08	Migrated from 2025-12-08	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2182	1997902145912520989	2025-12-08	Migrated from 2025-12-08	[]	{"name": "SimplyAnnisa", "screen_name": "SimplyAnnisa"}	{}	2026-01-12 18:39:35.301442	\N	\N
2184	1997676205139501129	2025-12-07	Migrated from 2025-12-08	[]	{"name": "YZOkulu", "screen_name": "YZOkulu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2185	1997561720139907329	2025-12-07	Migrated from 2025-12-08	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
2186	1997504385761329330	2025-12-07	Migrated from 2025-12-08	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2187	1997605299448856749	2025-12-07	Migrated from 2025-12-08	[]	{"name": "hAru_mAki_ch", "screen_name": "hAru_mAki_ch"}	{}	2026-01-12 18:39:35.301442	\N	\N
2188	1997593320030388698	2025-12-07	Migrated from 2025-12-08	[]	{"name": "msjiaozhu", "screen_name": "msjiaozhu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2189	1997599929980637445	2025-12-07	Migrated from 2025-12-08	[]	{"name": "KusoPhoto", "screen_name": "KusoPhoto"}	{}	2026-01-12 18:39:35.301442	\N	\N
2190	1997594366500573521	2025-12-07	Migrated from 2025-12-08	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2191	1997355007679852601	2025-12-06	Migrated from 2025-12-08	[]	{"name": "D_studioproject", "screen_name": "D_studioproject"}	{}	2026-01-12 18:39:35.301442	\N	\N
2192	1997532390131183638	2025-12-07	Migrated from 2025-12-08	[]	{"name": "D_studioproject", "screen_name": "D_studioproject"}	{}	2026-01-12 18:39:35.301442	\N	\N
2193	1997789514526564650	2025-12-07	Migrated from 2025-12-08	[]	{"name": "SDT_side", "screen_name": "SDT_side"}	{}	2026-01-12 18:39:35.301442	\N	\N
2194	1997461558130356494	2025-12-07	Migrated from 2025-12-08	[]	{"name": "KanaWorks_AI", "screen_name": "KanaWorks_AI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2195	1997685526217064488	2025-12-07	Migrated from 2025-12-08	[]	{"name": "Adam38363368936", "screen_name": "Adam38363368936"}	{}	2026-01-12 18:39:35.301442	\N	\N
2196	1997528999115853928	2025-12-07	Migrated from 2025-12-08	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2197	1997664853792567564	2025-12-07	Migrated from 2025-12-08	[]	{"name": "craftian_keskin", "screen_name": "craftian_keskin"}	{}	2026-01-12 18:39:35.301442	\N	\N
2198	1997510560309711238	2025-12-07	Migrated from 2025-12-08	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
2199	1997517458195042554	2025-12-07	Migrated from 2025-12-08	[]	{"name": "ChillaiKalan__", "screen_name": "ChillaiKalan__"}	{}	2026-01-12 18:39:35.301442	\N	\N
2200	1997636224555638959	2025-12-07	Migrated from 2025-12-08	[]	{"name": "0xInk_", "screen_name": "0xInk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2201	1997787952110239874	2025-12-07	Migrated from 2025-12-08	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2202	1997683512820768826	2025-12-07	Migrated from 2025-12-08	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
2203	1997796651667251640	2025-12-07	Migrated from 2025-12-08	[]	{"name": "gaucheai", "screen_name": "gaucheai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2204	1997574511705657772	2025-12-07	Migrated from 2025-12-08	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2205	1997757264518680728	2025-12-07	Migrated from 2025-12-08	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2206	1997578886566285567	2025-12-07	Migrated from 2025-12-08	[]	{"name": "trxuanxw", "screen_name": "trxuanxw"}	{}	2026-01-12 18:39:35.301442	\N	\N
2224	1997428572038844578	2025-12-06	Migrated from 2025-12-07	[]	{"name": "PolymarketMoney", "screen_name": "PolymarketMoney"}	{}	2026-01-12 18:39:35.301442	\N	\N
2225	1997595615229059430	2025-12-07	Migrated from 2025-12-07	[]	{"name": "JZhen72937", "screen_name": "JZhen72937"}	{}	2026-01-12 18:39:35.301442	\N	\N
2227	1997580570566746462	2025-12-07	Migrated from 2025-12-07	[]	{"name": "Taaruk_", "screen_name": "Taaruk_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2228	1997616191272370598	2025-12-07	Migrated from 2025-12-07	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2229	1997299560046018899	2025-12-06	Migrated from 2025-12-07	[]	{"name": "NahFlo2n", "screen_name": "NahFlo2n"}	{}	2026-01-12 18:39:35.301442	\N	\N
2230	1997417597223264320	2025-12-06	Migrated from 2025-12-07	[]	{"name": "icreatelife", "screen_name": "icreatelife"}	{}	2026-01-12 18:39:35.301442	\N	\N
2231	1997621423310057725	2025-12-07	Migrated from 2025-12-07	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2232	1997607350430294462	2025-12-07	Migrated from 2025-12-07	[]	{"name": "lexx_aura", "screen_name": "lexx_aura"}	{}	2026-01-12 18:39:35.301442	\N	\N
2233	1997619606186283445	2025-12-07	Migrated from 2025-12-07	[]	{"name": "xmliisu", "screen_name": "xmliisu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2234	1997512262891008315	2025-12-07	Migrated from 2025-12-07	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
2237	1997328217112453385	2025-12-06	Migrated from 2025-12-07	[]	{"name": "Mho_23", "screen_name": "Mho_23"}	{}	2026-01-12 18:39:35.301442	\N	\N
2238	1997616475277033799	2025-12-07	Migrated from 2025-12-07	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
2239	1997265335494595040	2025-12-06	Migrated from 2025-12-07	[]	{"name": "umesh_ai", "screen_name": "umesh_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2242	1997528830441832501	2025-12-07	Migrated from 2025-12-07	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
2243	1997568792499798019	2025-12-07	Migrated from 2025-12-07	[]	{"name": "ai_for_success", "screen_name": "ai_for_success"}	{}	2026-01-12 18:39:35.301442	\N	\N
2244	1997460283669831973	2025-12-07	Migrated from 2025-12-07	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2245	1997373810082033853	2025-12-06	Migrated from 2025-12-07	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2246	1997583354321891518	2025-12-07	Migrated from 2025-12-07	[]	{"name": "ozan_sihay", "screen_name": "ozan_sihay"}	{}	2026-01-12 18:39:35.301442	\N	\N
2247	1997298656429367700	2025-12-06	Migrated from 2025-12-07	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2248	1997303209111535773	2025-12-06	Migrated from 2025-12-07	[]	{"name": "kaanakz", "screen_name": "kaanakz"}	{}	2026-01-12 18:39:35.301442	\N	\N
2249	1997266221998428639	2025-12-06	Migrated from 2025-12-07	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2250	1997219720916095303	2025-12-06	Migrated from 2025-12-07	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2251	1997217542742675775	2025-12-06	Migrated from 2025-12-07	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
2252	1997340541764161950	2025-12-06	Migrated from 2025-12-07	[]	{"name": "fofrAI", "screen_name": "fofrAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2253	1997283261064925190	2025-12-06	Migrated from 2025-12-07	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2254	1997489903362244991	2025-12-07	Migrated from 2025-12-07	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
2255	1997347674794954859	2025-12-06	Migrated from 2025-12-07	[]	{"name": "SDT_side", "screen_name": "SDT_side"}	{}	2026-01-12 18:39:35.301442	\N	\N
2256	1997231238885912690	2025-12-06	Migrated from 2025-12-07	[]	{"name": "tuzi_ai", "screen_name": "tuzi_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2257	1997405140723323255	2025-12-06	Migrated from 2025-12-07	[]	{"name": "gaucheai", "screen_name": "gaucheai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2258	1997581641892446293	2025-12-07	Migrated from 2025-12-07	[]	{"name": "MrDavids1", "screen_name": "MrDavids1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2276	1996580659096387725	2025-12-04	Migrated from 2025-12-06	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
2278	1997248676272771223	2025-12-06	Migrated from 2025-12-06	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2279	1996955607656812714	2025-12-05	Migrated from 2025-12-06	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2280	1996878448288321638	2025-12-05	Migrated from 2025-12-06	[]	{"name": "eviljer", "screen_name": "eviljer"}	{}	2026-01-12 18:39:35.301442	\N	\N
2281	1996929968685863135	2025-12-05	Migrated from 2025-12-06	[]	{"name": "op7418", "screen_name": "op7418"}	{}	2026-01-12 18:39:35.301442	\N	\N
2282	1996738955207938207	2025-12-05	Migrated from 2025-12-06	[]	{"name": "LiEvanna85716", "screen_name": "LiEvanna85716"}	{}	2026-01-12 18:39:35.301442	\N	\N
2283	1996868141784486231	2025-12-05	Migrated from 2025-12-06	[]	{"name": "threeaus", "screen_name": "threeaus"}	{}	2026-01-12 18:39:35.301442	\N	\N
2284	1992749018531959070	2025-11-24	Migrated from 2025-12-06	[]	{"name": "iamtonyzhu", "screen_name": "iamtonyzhu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2286	1991730551531925570	2025-11-21	Migrated from 2025-12-06	[]	{"name": "Jimmy_JingLv", "screen_name": "Jimmy_JingLv"}	{}	2026-01-12 18:39:35.301442	\N	\N
2287	1996469120913883356	2025-12-04	Migrated from 2025-12-06	[]	{"name": "aleenaamiir", "screen_name": "aleenaamiir"}	{}	2026-01-12 18:39:35.301442	\N	\N
2288	1995603848510271611	2025-12-01	Migrated from 2025-12-06	[]	{"name": "IqraSaifiii", "screen_name": "IqraSaifiii"}	{}	2026-01-12 18:39:35.301442	\N	\N
2289	1997261014677787104	2025-12-06	Migrated from 2025-12-06	[]	{"name": "IamEmily2050", "screen_name": "IamEmily2050"}	{}	2026-01-12 18:39:35.301442	\N	\N
2290	1997191891553534399	2025-12-06	Migrated from 2025-12-06	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2291	1997253400585793975	2025-12-06	Migrated from 2025-12-06	[]	{"name": "beginnersblog1", "screen_name": "beginnersblog1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2292	1997237942386053422	2025-12-06	Migrated from 2025-12-06	[]	{"name": "ZaraIrahh", "screen_name": "ZaraIrahh"}	{}	2026-01-12 18:39:35.301442	\N	\N
2293	1997138942424907884	2025-12-06	Migrated from 2025-12-06	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
2294	1996912450931957808	2025-12-05	Migrated from 2025-12-06	[]	{"name": "wad0427", "screen_name": "wad0427"}	{}	2026-01-12 18:39:35.301442	\N	\N
2295	1997246647219454206	2025-12-06	Migrated from 2025-12-06	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
2296	1996953434583716123	2025-12-05	Migrated from 2025-12-06	[]	{"name": "beechinour", "screen_name": "beechinour"}	{}	2026-01-12 18:39:35.301442	\N	\N
2297	1996931461321257339	2025-12-05	Migrated from 2025-12-06	[]	{"name": "genspark_japan", "screen_name": "genspark_japan"}	{}	2026-01-12 18:39:35.301442	\N	\N
2298	1997168653607850184	2025-12-06	Migrated from 2025-12-06	[]	{"name": "Saccc_c", "screen_name": "Saccc_c"}	{}	2026-01-12 18:39:35.301442	\N	\N
2299	1996788359319159204	2025-12-05	Migrated from 2025-12-06	[]	{"name": "learn2vibe", "screen_name": "learn2vibe"}	{}	2026-01-12 18:39:35.301442	\N	\N
2300	1996783899943620967	2025-12-05	Migrated from 2025-12-06	[]	{"name": "sundarpichai", "screen_name": "sundarpichai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2301	1996829515939754170	2025-12-05	Migrated from 2025-12-06	[]	{"name": "chengzi_95330", "screen_name": "chengzi_95330"}	{}	2026-01-12 18:39:35.301442	\N	\N
2302	1992877077570453712	2025-11-24	Migrated from 2025-12-06	[]	{"name": "cheerselflin", "screen_name": "cheerselflin"}	{}	2026-01-12 18:39:35.301442	\N	\N
2303	1996889833894232209	2025-12-05	Migrated from 2025-12-06	[]	{"name": "ninohut", "screen_name": "ninohut"}	{}	2026-01-12 18:39:35.301442	\N	\N
2304	1996919230961226095	2025-12-05	Migrated from 2025-12-06	[]	{"name": "_MehdiSharifi_", "screen_name": "_MehdiSharifi_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2305	1994762837240287645	2025-11-29	Migrated from 2025-12-06	[]	{"name": "msjiaozhu", "screen_name": "msjiaozhu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2306	1997020968225525791	2025-12-05	Migrated from 2025-12-06	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2307	1996935337546076316	2025-12-05	Migrated from 2025-12-06	[]	{"name": "songguoxiansen", "screen_name": "songguoxiansen"}	{}	2026-01-12 18:39:35.301442	\N	\N
2308	1996285140893622391	2025-12-03	Migrated from 2025-12-06	[]	{"name": "Arminn_Ai", "screen_name": "Arminn_Ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2309	1997009961654870363	2025-12-05	Migrated from 2025-12-06	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2310	1996281855503372510	2025-12-03	Migrated from 2025-12-06	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2311	1995847027054534775	2025-12-02	Migrated from 2025-12-06	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2312	1996529688395833453	2025-12-04	Migrated from 2025-12-06	[]	{"name": "LinusEkenstam", "screen_name": "LinusEkenstam"}	{}	2026-01-12 18:39:35.301442	\N	\N
2313	1996982927427596680	2025-12-05	Migrated from 2025-12-06	[]	{"name": "CharaspowerAI", "screen_name": "CharaspowerAI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2314	1996952141890834948	2025-12-05	Migrated from 2025-12-06	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2315	1996769465632227787	2025-12-05	Migrated from 2025-12-06	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	\N	\N
2333	1996893269138317607	2025-12-05	Migrated from 2025-12-05	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2334	1996678914580635971	2025-12-04	Migrated from 2025-12-05	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
2335	1996992785669673265	2025-12-05	Migrated from 2025-12-05	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	\N	\N
2336	1995592442511589573	2025-12-01	Migrated from 2025-12-05	[]	{"name": "egeberkina", "screen_name": "egeberkina"}	{}	2026-01-12 18:39:35.301442	\N	\N
2337	1996836039772483717	2025-12-05	Migrated from 2025-12-05	[]	{"name": "AleRVG", "screen_name": "AleRVG"}	{}	2026-01-12 18:39:35.301442	\N	\N
2338	1996389985973571908	2025-12-04	Migrated from 2025-12-05	[]	{"name": "asdfghdevv", "screen_name": "asdfghdevv"}	{}	2026-01-12 18:39:35.301442	\N	\N
2339	1996678202849161415	2025-12-04	Migrated from 2025-12-05	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	\N	\N
2340	1996507246113837118	2025-12-04	Migrated from 2025-12-05	[]	{"name": "nagano_yoh", "screen_name": "nagano_yoh"}	{}	2026-01-12 18:39:35.301442	\N	\N
2341	1996490849799274597	2025-12-04	Migrated from 2025-12-05	[]	{"name": "4on_yon_x", "screen_name": "4on_yon_x"}	{}	2026-01-12 18:39:35.301442	\N	\N
2342	1996526274714726471	2025-12-04	Migrated from 2025-12-05	[]	{"name": "felo_ai", "screen_name": "felo_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2343	1996596440890540053	2025-12-04	Migrated from 2025-12-05	[]	{"name": "old_pgmrs_will", "screen_name": "old_pgmrs_will"}	{}	2026-01-12 18:39:35.301442	\N	\N
2344	1996498327723036749	2025-12-04	Migrated from 2025-12-05	[]	{"name": "beginnersblog1", "screen_name": "beginnersblog1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2345	1996566573205913936	2025-12-04	Migrated from 2025-12-05	[]	{"name": "glennwrites1", "screen_name": "glennwrites1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2346	1996566276060377294	2025-12-04	Migrated from 2025-12-05	[]	{"name": "RAVIKUMARSAHU78", "screen_name": "RAVIKUMARSAHU78"}	{}	2026-01-12 18:39:35.301442	\N	\N
2347	1996589194412544172	2025-12-04	Migrated from 2025-12-05	[]	{"name": "DmitryLepisov", "screen_name": "DmitryLepisov"}	{}	2026-01-12 18:39:35.301442	\N	\N
2348	1996686891819892775	2025-12-04	Migrated from 2025-12-05	[]	{"name": "monicamoonx", "screen_name": "monicamoonx"}	{}	2026-01-12 18:39:35.301442	\N	\N
2349	1996556247601225850	2025-12-04	Migrated from 2025-12-05	[]	{"name": "aaliya_va", "screen_name": "aaliya_va"}	{}	2026-01-12 18:39:35.301442	\N	\N
2350	1996625243461570798	2025-12-04	Migrated from 2025-12-05	[]	{"name": "VibeMarketer_", "screen_name": "VibeMarketer_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2351	1996446404487835861	2025-12-04	Migrated from 2025-12-05	[]	{"name": "guicastellanos1", "screen_name": "guicastellanos1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2352	1996524358253379867	2025-12-04	Migrated from 2025-12-05	[]	{"name": "cnyzgkc", "screen_name": "cnyzgkc"}	{}	2026-01-12 18:39:35.301442	\N	\N
2353	1996717035066425712	2025-12-04	Migrated from 2025-12-05	[]	{"name": "FlowbyGoogle", "screen_name": "FlowbyGoogle"}	{}	2026-01-12 18:39:35.301442	\N	\N
2354	1996679998443602171	2025-12-04	Migrated from 2025-12-05	[]	{"name": "stitchbygoogle", "screen_name": "stitchbygoogle"}	{}	2026-01-12 18:39:35.301442	\N	\N
2355	1996660420279742503	2025-12-04	Migrated from 2025-12-05	[]	{"name": "Creatify_AI", "screen_name": "Creatify_AI"}	{}	2026-01-12 18:39:35.301442	\N	\N
2356	1996518068235751487	2025-12-04	Migrated from 2025-12-05	[]	{"name": "gaucheai", "screen_name": "gaucheai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2357	1996664332617498906	2025-12-04	Migrated from 2025-12-05	[]	{"name": "fAIkout", "screen_name": "fAIkout"}	{}	2026-01-12 18:39:35.301442	\N	\N
2358	1996571047366099064	2025-12-04	Migrated from 2025-12-05	[]	{"name": "CaptainHaHaa", "screen_name": "CaptainHaHaa"}	{}	2026-01-12 18:39:35.301442	\N	\N
2359	1996391371670966332	2025-12-04	Migrated from 2025-12-05	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
2360	1996590948193816668	2025-12-04	Migrated from 2025-12-05	[]	{"name": "TechByMarkandey", "screen_name": "TechByMarkandey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2361	1996402409405596131	2025-12-04	Migrated from 2025-12-05	[]	{"name": "chillhousedev", "screen_name": "chillhousedev"}	{}	2026-01-12 18:39:35.301442	\N	\N
2362	1996608825789493515	2025-12-04	Migrated from 2025-12-05	[]	{"name": "AIFrontliner", "screen_name": "AIFrontliner"}	{}	2026-01-12 18:39:35.301442	\N	\N
2363	1996602278044656098	2025-12-04	Migrated from 2025-12-05	[]	{"name": "maxescu", "screen_name": "maxescu"}	{}	2026-01-12 18:39:35.301442	\N	\N
2364	1996445591099044242	2025-12-04	Migrated from 2025-12-05	[]	{"name": "genel_ai", "screen_name": "genel_ai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2365	1996560857166414246	2025-12-04	Migrated from 2025-12-05	[]	{"name": "AllarHaltsonen", "screen_name": "AllarHaltsonen"}	{}	2026-01-12 18:39:35.301442	\N	\N
2366	1996450418424176968	2025-12-04	Migrated from 2025-12-05	[]	{"name": "WuxiaRocks", "screen_name": "WuxiaRocks"}	{}	2026-01-12 18:39:35.301442	\N	\N
2367	1996385227204096018	2025-12-04	Migrated from 2025-12-05	[]	{"name": "GlitterPixely", "screen_name": "GlitterPixely"}	{}	2026-01-12 18:39:35.301442	\N	\N
2369	1996561195424260299	2025-12-04	Migrated from 2025-12-05	[]	{"name": "lexx_aura", "screen_name": "lexx_aura"}	{}	2026-01-12 18:39:35.301442	\N	\N
2370	1996661634748850353	2025-12-04	Migrated from 2025-12-05	[]	{"name": "BrettFromDJ", "screen_name": "BrettFromDJ"}	{}	2026-01-12 18:39:35.301442	\N	\N
2371	1996683967861608839	2025-12-04	Migrated from 2025-12-05	[]	{"name": "OdinLovis", "screen_name": "OdinLovis"}	{}	2026-01-12 18:39:35.301442	\N	\N
2372	1996571161652773078	2025-12-04	Migrated from 2025-12-05	[]	{"name": "Shimayus", "screen_name": "Shimayus"}	{}	2026-01-12 18:39:35.301442	\N	\N
2373	1996421042961859036	2025-12-04	Migrated from 2025-12-05	[]	{"name": "tsyn18", "screen_name": "tsyn18"}	{}	2026-01-12 18:39:35.301442	\N	\N
2374	1996494402483871890	2025-12-04	Migrated from 2025-12-05	[]	{"name": "develogon0", "screen_name": "develogon0"}	{}	2026-01-12 18:39:35.301442	\N	\N
2375	1996487398486888725	2025-12-04	Migrated from 2025-12-05	[]	{"name": "ayami_marketing", "screen_name": "ayami_marketing"}	{}	2026-01-12 18:39:35.301442	\N	\N
2376	1996494969310220454	2025-12-04	Migrated from 2025-12-05	[]	{"name": "Ankit_patel211", "screen_name": "Ankit_patel211"}	{}	2026-01-12 18:39:35.301442	\N	\N
2377	1996402159555149838	2025-12-04	Migrated from 2025-12-05	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2378	1996689829002985662	2025-12-04	Migrated from 2025-12-05	[]	{"name": "Me_Rock369", "screen_name": "Me_Rock369"}	{}	2026-01-12 18:39:35.301442	\N	\N
2379	1996544171184898267	2025-12-04	Migrated from 2025-12-05	[]	{"name": "futamen_0308", "screen_name": "futamen_0308"}	{}	2026-01-12 18:39:35.301442	\N	\N
2380	1996129537806213597	2025-12-03	Migrated from 2025-12-05	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
2381	1996529160567808091	2025-12-04	Migrated from 2025-12-05	[]	{"name": "schnapoon", "screen_name": "schnapoon"}	{}	2026-01-12 18:39:35.301442	\N	\N
2382	1996487470708629919	2025-12-04	Migrated from 2025-12-05	[]	{"name": "_3912657840", "screen_name": "_3912657840"}	{}	2026-01-12 18:39:35.301442	\N	\N
2383	1996685943512748351	2025-12-04	Migrated from 2025-12-05	[]	{"name": "manerun_", "screen_name": "manerun_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2384	1996689440450740493	2025-12-04	Migrated from 2025-12-05	[]	{"name": "guicastellanos1", "screen_name": "guicastellanos1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2385	1996500814031200294	2025-12-04	Migrated from 2025-12-05	[]	{"name": "tegnike", "screen_name": "tegnike"}	{}	2026-01-12 18:39:35.301442	\N	\N
2386	1996604581313220931	2025-12-04	Migrated from 2025-12-05	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2387	1996540963083481385	2025-12-04	Migrated from 2025-12-05	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
2388	1996620150934851714	2025-12-04	Migrated from 2025-12-05	[]	{"name": "dr_cintas", "screen_name": "dr_cintas"}	{}	2026-01-12 18:39:35.301442	\N	\N
2389	1996559154240967144	2025-12-04	Migrated from 2025-12-05	[]	{"name": "YaseenK7212", "screen_name": "YaseenK7212"}	{}	2026-01-12 18:39:35.301442	\N	\N
2390	1996447627744071802	2025-12-04	Migrated from 2025-12-05	[]	{"name": "milbon_", "screen_name": "milbon_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2408	1996478713207419168	2025-12-04	Migrated from 2025-12-04	[]	{"name": "kingofdairyque", "screen_name": "kingofdairyque"}	{}	2026-01-12 18:39:35.301442	\N	\N
2409	1996537753434243181	2025-12-04	Migrated from 2025-12-04	[]	{"name": "TechieBySA", "screen_name": "TechieBySA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2411	1996416718873444749	2025-12-04	Migrated from 2025-12-04	[]	{"name": "saniaspeaks_", "screen_name": "saniaspeaks_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2414	1996417811556483380	2025-12-04	Migrated from 2025-12-04	[]	{"name": "oggii_0", "screen_name": "oggii_0"}	{}	2026-01-12 18:39:35.301442	\N	\N
2418	1996554636166049928	2025-12-04	Migrated from 2025-12-04	[]	{"name": "NanoBanana", "screen_name": "NanoBanana"}	{}	2026-01-12 18:39:35.301442	\N	\N
2421	1996404415742537955	2025-12-04	Migrated from 2025-12-04	[]	{"name": "mmmiyama_D", "screen_name": "mmmiyama_D"}	{}	2026-01-12 18:39:35.301442	\N	\N
2422	1996371434323529778	2025-12-04	Migrated from 2025-12-04	[]	{"name": "freddier", "screen_name": "freddier"}	{}	2026-01-12 18:39:35.301442	\N	\N
2423	1996401847360471176	2025-12-04	Migrated from 2025-12-04	[]	{"name": "Tz_2022", "screen_name": "Tz_2022"}	{}	2026-01-12 18:39:35.301442	\N	\N
2424	1996450377181671907	2025-12-04	Migrated from 2025-12-04	[]	{"name": "ShreyaYadav___", "screen_name": "ShreyaYadav___"}	{}	2026-01-12 18:39:35.301442	\N	\N
2425	1996523510769054123	2025-12-04	Migrated from 2025-12-04	[]	{"name": "kohaku_00", "screen_name": "kohaku_00"}	{}	2026-01-12 18:39:35.301442	\N	\N
2445	1996140954844029074	2025-12-03	Migrated from 2025-12-03	[]	{"name": "osanseviero", "screen_name": "osanseviero"}	{}	2026-01-12 18:39:35.301442	\N	\N
2446	1996357374417027357	2025-12-03	Migrated from 2025-12-03	[]	{"name": "ryosan1904", "screen_name": "ryosan1904"}	{}	2026-01-12 18:39:35.301442	\N	\N
2447	1996010865322049661	2025-12-03	Migrated from 2025-12-03	[]	{"name": "guicastellanos1", "screen_name": "guicastellanos1"}	{}	2026-01-12 18:39:35.301442	\N	\N
2448	1996037744305570235	2025-12-03	Migrated from 2025-12-03	[]	{"name": "tkm_hmng8", "screen_name": "tkm_hmng8"}	{}	2026-01-12 18:39:35.301442	\N	\N
2449	1996228874611392557	2025-12-03	Migrated from 2025-12-03	[]	{"name": "VibeMarketer_", "screen_name": "VibeMarketer_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2450	1996260420471173511	2025-12-03	Migrated from 2025-12-03	[]	{"name": "canghecode", "screen_name": "canghecode"}	{}	2026-01-12 18:39:35.301442	\N	\N
2452	1996344184840868264	2025-12-03	Migrated from 2025-12-03	[]	{"name": "dotey", "screen_name": "dotey"}	{}	2026-01-12 18:39:35.301442	\N	\N
2453	1996170597269971249	2025-12-03	Migrated from 2025-12-03	[]	{"name": "taiyo_ai_gakuse", "screen_name": "taiyo_ai_gakuse"}	{}	2026-01-12 18:39:35.301442	\N	\N
2454	1996233512089981195	2025-12-03	Migrated from 2025-12-03	[]	{"name": "miyabi_foxx", "screen_name": "miyabi_foxx"}	{}	2026-01-12 18:39:35.301442	\N	\N
2455	1996207810099781767	2025-12-03	Migrated from 2025-12-03	[]	{"name": "munou_ac", "screen_name": "munou_ac"}	{}	2026-01-12 18:39:35.301442	\N	\N
2456	1996216514408796233	2025-12-03	Migrated from 2025-12-03	[]	{"name": "kei31", "screen_name": "kei31"}	{}	2026-01-12 18:39:35.301442	\N	\N
2457	1996033217795903655	2025-12-03	Migrated from 2025-12-03	[]	{"name": "kingofdairyque", "screen_name": "kingofdairyque"}	{}	2026-01-12 18:39:35.301442	\N	\N
2458	1996267229701128316	2025-12-03	Migrated from 2025-12-03	[]	{"name": "OkunevUA", "screen_name": "OkunevUA"}	{}	2026-01-12 18:39:35.301442	\N	\N
2460	1996063445868048820	2025-12-03	Migrated from 2025-12-03	[]	{"name": "Saboo_Shubham_", "screen_name": "Saboo_Shubham_"}	{}	2026-01-12 18:39:35.301442	\N	\N
2461	1996252061651042751	2025-12-03	Migrated from 2025-12-03	[]	{"name": "GeminiApp", "screen_name": "GeminiApp"}	{}	2026-01-12 18:39:35.301442	\N	\N
2462	1996288172624634336	2025-12-03	Migrated from 2025-12-03	[]	{"name": "gizakdag", "screen_name": "gizakdag"}	{}	2026-01-12 18:39:35.301442	\N	\N
2463	1996184483343520186	2025-12-03	Migrated from 2025-12-03	[]	{"name": "gaucheai", "screen_name": "gaucheai"}	{}	2026-01-12 18:39:35.301442	\N	\N
2464	1996142801117983033	2025-12-03	Migrated from 2025-12-03	[]	{"name": "AIMevzulari", "screen_name": "AIMevzulari"}	{}	2026-01-12 18:39:35.301442	\N	\N
1323	2008248159815036942	2026-01-05	Migrated from 2026-01-06	[]	{"name": "aziz4ai", "screen_name": "aziz4ai"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["广告/海报", "产品摄影"], "艺术与幻想": ["科幻/超现实"]}	["surreal ad", "brand integration", "cinematic composition", "premium materials", "3-word slogan", "luxury vibe", "realistic surrealism", "clean background"]
1324	2008176822551216467	2026-01-05	Migrated from 2026-01-06	[]	{"name": "AmirMushich", "screen_name": "AmirMushich"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["包装设计", "广告/海报"]}	["retro lettering", "baseball script", "block shadow", "vintage Americana", "brand typography", "vector design", "punchy colors", "dynamic slant"]
1325	2008209545412419746	2026-01-05	Migrated from 2026-01-06	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["名人/现实主义", "工作室肖像"], "艺术与幻想": ["抽象/实验"]}	["celebrity portrait", "paint splashes", "profile view", "electric blue", "dramatic contrast", "hyper-realistic", "cinematic lighting", "motion energy"]
1326	2008188288025473061	2026-01-05	Migrated from 2026-01-06	[]	{"name": "ttmouse", "screen_name": "ttmouse"}	{}	2026-01-12 18:39:35.301442	{"人物肖像": ["性感/时尚", "工作室肖像"]}	["new Chinese style", "red cheongsam", "pearl necklace", "paper-cut art", "side profile", "warm lighting", "festive atmosphere", "hyper-realistic skin"]
1327	2008274042248458615	2026-01-05	Migrated from 2026-01-06	[]	{"name": "med3bbas", "screen_name": "med3bbas"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影", "广告/海报"], "可视化与分解": ["成分悬浮", "浮动构图"]}	["cookie dunk", "milk splash", "frozen motion", "vibrant colors", "close-up photo", "snack ad", "hyper-realistic", "dynamic energy"]
1328	2008268262623121817	2026-01-05	Migrated from 2026-01-06	[]	{"name": "AllaAisling", "screen_name": "AllaAisling"}	{}	2026-01-12 18:39:35.301442	{"产品与营销": ["产品摄影"], "自然与环境": ["治愈/梦幻"]}	["moss bed", "forest aesthetic", "dewdrops", "soft lighting", "fairy tale", "organic luxury", "miniature scene", "cozy vibe"]
1345	2008011848566841812	2026-01-05	Migrated from 2026-01-05	[]	{"name": "Sheldon056", "screen_name": "Sheldon056"}	{}	2026-01-12 18:39:35.301442	{"艺术与幻想": ["科幻/超现实", "抽象/实验"]}	["miniature artist", "fingernail canvas", "hyper-realistic", "tiny painter", "masterpiece recreation", "close-up photo", "glossy surface", "blurred background"]
\.


--
-- Name: tweets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: twitteruser
--

SELECT pg_catalog.setval('public.tweets_id_seq', 2578, true);


--
-- Name: daily_tweets daily_tweets_pkey; Type: CONSTRAINT; Schema: public; Owner: twitteruser
--

ALTER TABLE ONLY public.daily_tweets
    ADD CONSTRAINT daily_tweets_pkey PRIMARY KEY (date);


--
-- Name: tweets tweets_pkey; Type: CONSTRAINT; Schema: public; Owner: twitteruser
--

ALTER TABLE ONLY public.tweets
    ADD CONSTRAINT tweets_pkey PRIMARY KEY (id);


--
-- Name: tweets tweets_tweet_id_key; Type: CONSTRAINT; Schema: public; Owner: twitteruser
--

ALTER TABLE ONLY public.tweets
    ADD CONSTRAINT tweets_tweet_id_key UNIQUE (tweet_id);


--
-- Name: idx_tweets_publish_date; Type: INDEX; Schema: public; Owner: twitteruser
--

CREATE INDEX idx_tweets_publish_date ON public.tweets USING btree (publish_date);


--
-- PostgreSQL database dump complete
--

\unrestrict bYje0PJVaCwONpIO4fsDB1AdI4TMrE5xele9ZybwV2t6DnBObqCeLiwrXIJHWMx

