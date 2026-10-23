"""Hand-written exam overviews for the /exams/ pages.

Edit the text here, then run:
    python tools/sync_syllabus.py   # pulls latest subjects/topics from the live API
    python tools/build_pages.py     # regenerates /exams/*/index.html and sitemap.xml

Exam patterns change - always re-check against the latest official notification.
"""

EXAMS = [
    dict(
        slug="ssc-gd-constable", name="SSC GD Constable", short="SSC GD", group="SSC", accent="#2563eb",
        conducted_by="Staff Selection Commission (SSC)",
        official={"label": "ssc.gov.in", "url": "https://ssc.gov.in"},
        summary="SSC GD Constable recruits Constables (General Duty) for the Central Armed Police Forces such as BSF, CISF, CRPF, ITBP and SSB, Rifleman (GD) in Assam Rifles, and Sepoy in the NCB. Its computer-based exam tests reasoning, general awareness, elementary maths and English or Hindi at a 10th-pass level.",
        stages=[
            "Computer Based Examination (CBE)",
            "Physical Efficiency Test (PET) and Physical Standard Test (PST)",
            "Detailed Medical Examination and Document Verification",
        ],
        pattern={
            "caption": "Computer Based Examination (recent pattern)",
            "cols": ["Part", "Questions", "Marks"],
            "rows": [
                ["General Intelligence & Reasoning", "20", "40"],
                ["General Knowledge & General Awareness", "20", "40"],
                ["Elementary Mathematics", "20", "40"],
                ["English / Hindi", "20", "40"],
            ],
            "total": ["Total", "80", "160"],
            "notes": ["Duration: 60 minutes.", "0.25 marks are deducted for each wrong answer."],
        },
        tips=[
            "Reasoning and maths are scoring: practise topic-wise PYQs for coding-decoding, series and arithmetic until they feel routine.",
            "General awareness questions repeat themes across years, so solving several years of PYQs shows you which areas come up most.",
            "With 80 questions in 60 minutes, attempt full previous papers under time to build speed.",
        ],
    ),
    dict(
        slug="ssc-cgl", name="SSC CGL", short="SSC CGL", group="SSC", accent="#2563eb",
        conducted_by="Staff Selection Commission (SSC)",
        official={"label": "ssc.gov.in", "url": "https://ssc.gov.in"},
        summary="The SSC Combined Graduate Level (CGL) exam recruits graduates for Group B and Group C posts in central ministries, departments and organisations, including Assistant Section Officer, Inspector (Income Tax, Central Excise, Examiner), Auditor, Accountant and Junior Statistical Officer.",
        stages=[
            "Tier 1: computer-based qualifying exam",
            "Tier 2: computer-based exam (Paper I for all posts; Paper II Statistics for JSO and Statistical Investigator posts)",
            "Document verification and post-specific skill tests where applicable",
        ],
        pattern={
            "caption": "Tier 1 (recent pattern)",
            "cols": ["Section", "Questions", "Marks"],
            "rows": [
                ["General Intelligence & Reasoning", "25", "50"],
                ["General Awareness", "25", "50"],
                ["Quantitative Aptitude", "25", "50"],
                ["English Comprehension", "25", "50"],
            ],
            "total": ["Total", "100", "200"],
            "notes": [
                "Duration: 60 minutes.",
                "0.50 marks are deducted for each wrong answer.",
                "Tier 2 Paper I covers Mathematical Abilities, Reasoning, English, General Awareness, Computer Knowledge and a Data Entry Speed Test.",
            ],
        },
        tips=[
            "Quantitative aptitude decides most cut-offs: use topic-wise PYQs to master percentage, ratio, algebra, geometry and trigonometry.",
            "English and reasoning questions follow familiar formats, so PYQs are the fastest way to learn them.",
            "If you're targeting JSO or Statistical Investigator posts, practise the Statistics topics separately for Tier 2 Paper II.",
        ],
    ),
    dict(
        slug="rrb-ntpc", name="RRB NTPC", short="RRB NTPC", group="Railways", accent="#ea580c",
        conducted_by="Railway Recruitment Boards (RRBs)",
        official={"label": "rrbapply.gov.in", "url": "https://www.rrbapply.gov.in"},
        summary="RRB NTPC (Non-Technical Popular Categories) recruits for graduate and undergraduate posts in Indian Railways, such as Station Master, Goods Train Manager, Junior Account Assistant cum Typist, Senior Clerk, Commercial cum Ticket Clerk and Trains Clerk.",
        stages=[
            "CBT 1 (screening, common for all posts)",
            "CBT 2 (level-wise, for the posts you applied for)",
            "Typing Skill Test or Computer Based Aptitude Test, depending on the post",
            "Document verification and medical examination",
        ],
        pattern={
            "caption": "CBT 1 and CBT 2 (recent pattern)",
            "cols": ["Section", "CBT 1 questions", "CBT 2 questions"],
            "rows": [
                ["General Awareness", "40", "50"],
                ["Mathematics", "30", "35"],
                ["General Intelligence & Reasoning", "30", "35"],
            ],
            "total": ["Total", "100", "120"],
            "notes": [
                "Duration: 90 minutes for each CBT.",
                "One-third of the marks for a question is deducted for each wrong answer.",
            ],
        },
        tips=[
            "General Awareness carries the most questions: PYQs show the heavy focus on current affairs, history, polity, science and Indian Railways.",
            "Maths and reasoning are at a 10th-to-12th level, so topic-wise PYQ practice builds speed quickly.",
            "Practise full previous papers within 90 minutes to get used to the time pressure.",
        ],
    ),
    dict(
        slug="rrb-je", name="RRB JE", short="RRB JE", group="Railways", accent="#ea580c",
        conducted_by="Railway Recruitment Boards (RRBs)",
        official={"label": "rrbapply.gov.in", "url": "https://www.rrbapply.gov.in"},
        summary="RRB JE recruits Junior Engineers, Depot Material Superintendents and Chemical & Metallurgical Assistants for Indian Railways. CBT 1 is a common general paper; CBT 2 adds technical questions from your engineering branch.",
        stages=[
            "CBT 1 (screening)",
            "CBT 2 (general and technical)",
            "Document verification and medical examination",
        ],
        pattern={
            "caption": "CBT 1 (recent pattern)",
            "cols": ["Section", "Questions"],
            "rows": [
                ["Mathematics", "30"],
                ["General Intelligence & Reasoning", "25"],
                ["General Awareness", "15"],
                ["General Science", "30"],
            ],
            "total": ["Total", "100"],
            "notes": [
                "CBT 1 duration: 90 minutes.",
                "CBT 2: 150 questions in 120 minutes, with 100 technical questions from your branch plus general awareness, physics & chemistry, computers, and environment & pollution control.",
                "One-third of the marks for a question is deducted for each wrong answer.",
            ],
        },
        tips=[
            "CBT 2's technical section carries the most weight: practise your branch topic by topic with PYQs.",
            "Don't skip the smaller CBT 2 sections (computers, environment, physics & chemistry); they're quick marks.",
            "Use CBT 1 PYQs to learn the general science and maths level the exam expects.",
        ],
    ),
    dict(
        slug="jee-mains", name="JEE Main", short="JEE Main", group="Engineering", accent="#7c3aed",
        conducted_by="National Testing Agency (NTA)",
        official={"label": "nta.ac.in", "url": "https://nta.ac.in"},
        summary="JEE Main is the national engineering entrance exam for admission to B.E./B.Tech programmes at NITs, IIITs and other participating institutions. It's also the qualifying exam for JEE Advanced (for IIT admissions). It's held in two sessions each year.",
        stages=[
            "Session 1 (January) and Session 2 (April): you can attempt one or both",
            "Your best NTA score is used for ranking",
            "Top candidates qualify for JEE Advanced",
        ],
        pattern={
            "caption": "Paper 1 – B.E./B.Tech (recent pattern)",
            "cols": ["Subject", "Questions", "Marks"],
            "rows": [["Physics", "25", "100"], ["Chemistry", "25", "100"], ["Mathematics", "25", "100"]],
            "total": ["Total", "75", "300"],
            "notes": [
                "Duration: 3 hours, computer-based.",
                "Each subject has 20 multiple-choice and 5 numerical-value questions.",
                "+4 for a correct answer, −1 for a wrong answer.",
            ],
        },
        tips=[
            "JEE Main repeats concepts more than questions: PYQs from recent sessions show which chapters carry the most weight.",
            "Practise numerical-value questions separately; they need exact answers with no options to fall back on.",
            "Solve full papers in 3 hours and review every mistake by topic.",
        ],
    ),
    dict(
        slug="neet-ug", name="NEET UG", short="NEET", group="Medical", accent="#059669",
        conducted_by="National Testing Agency (NTA)",
        official={"label": "nta.ac.in", "url": "https://nta.ac.in"},
        summary="NEET UG is the national entrance exam for MBBS, BDS, AYUSH and other undergraduate medical courses in India. It's a single pen-and-paper exam in Physics, Chemistry and Biology, based on the Class 11 and 12 syllabus.",
        stages=[
            "Single pen-and-paper (OMR) exam",
            "Results are used for All India Quota and state counselling",
        ],
        pattern={
            "caption": "Exam pattern (recent)",
            "cols": ["Subject", "Questions", "Marks"],
            "rows": [["Physics", "45", "180"], ["Chemistry", "45", "180"], ["Biology (Botany + Zoology)", "90", "360"]],
            "total": ["Total", "180", "720"],
            "notes": [
                "Duration: 3 hours (180 minutes). All questions are compulsory.",
                "+4 for a correct answer, −1 for a wrong answer.",
            ],
        },
        tips=[
            "Biology is half the paper: NCERT-based PYQs show exactly how statements are turned into questions.",
            "Physics is where many students lose time, so practise numericals topic-wise until they're quick.",
            "Chemistry PYQs often repeat concepts, especially in inorganic and organic chemistry.",
        ],
    ),
    dict(
        slug="upsc-civil-services", name="UPSC Civil Services", short="UPSC CSE", group="UPSC", accent="#b45309",
        conducted_by="Union Public Service Commission (UPSC)",
        official={"label": "upsc.gov.in", "url": "https://upsc.gov.in"},
        summary="The UPSC Civil Services Examination selects candidates for the IAS, IPS, IFS and other Group A and Group B central services. It has three stages: an objective Preliminary exam, a descriptive Main exam, and a Personality Test (interview).",
        stages=[
            "Preliminary Examination (objective, screening)",
            "Main Examination (9 descriptive papers)",
            "Personality Test (interview)",
        ],
        pattern={
            "caption": "Preliminary Examination (recent pattern)",
            "cols": ["Paper", "Questions", "Marks"],
            "rows": [["General Studies Paper I", "100", "200"], ["General Studies Paper II (CSAT)", "80", "200"]],
            "total": None,
            "notes": [
                "Each paper is 2 hours. CSAT is qualifying (33% needed); merit is based on GS Paper I.",
                "One-third of the marks for a question is deducted for each wrong answer.",
                "Mains: two qualifying language papers, Essay, General Studies I–IV and two Optional papers, followed by the interview.",
            ],
        },
        tips=[
            "Prelims PYQs show UPSC's style: statement-based questions, elimination and deep conceptual understanding.",
            "Practise subject-wise PYQs for polity, economy, environment and history to find recurring themes.",
            "Don't ignore CSAT: practise reasoning and comprehension PYQs so the qualifying paper doesn't catch you out.",
        ],
    ),
    dict(
        slug="cuet-ug", name="CUET UG", short="CUET UG", group="University", accent="#db2777",
        conducted_by="National Testing Agency (NTA)",
        official={"label": "nta.ac.in", "url": "https://nta.ac.in"},
        summary="CUET UG (Common University Entrance Test) is used for undergraduate admissions to central universities and many state, deemed and private universities. Candidates choose language, domain-subject and General Test papers based on the courses they want.",
        stages=[
            "Computer-based tests in the subjects you choose",
            "Universities use your CUET scores in their own admission process",
        ],
        pattern={
            "caption": "Exam pattern (recent)",
            "cols": ["Paper type", "Examples"],
            "rows": [
                ["Languages", "English and other languages"],
                ["Domain subjects", "Physics, Chemistry, Mathematics, Biology and more"],
                ["General Test", "Reasoning, numerical ability, general knowledge"],
            ],
            "total": None,
            "notes": [
                "Each test has 50 compulsory questions in 60 minutes.",
                "+5 for a correct answer, −1 for a wrong answer.",
                "The number of subjects you can choose and other rules may change each year.",
            ],
        },
        tips=[
            "Domain papers follow the Class 12 syllabus, so topic-wise PYQs help you revise board and CUET together.",
            "Practise the General Test separately; it rewards speed in reasoning and numerical ability.",
            "With 50 questions per hour, time yourself on full papers.",
        ],
    ),
]
