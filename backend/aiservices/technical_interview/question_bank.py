import random
from .skill_detector import detect_skills


# =========================================================
# QUESTION BANK
# =========================================================

QUESTION_BANK = {

    # =========================
    # PYTHON
    # =========================
    "python": {
        "easy": [
            "What is a list in Python?",
            "What is the difference between a list and a tuple?",
            "What is the purpose of self in Python?",
            "What are mutable and immutable objects in Python?",
            "What is the difference between == and is in Python?"
        ],
        "medium": [
            "What are *args and **kwargs in Python?",
            "Explain decorators in Python.",
            "What is the difference between shallow copy and deep copy?",
            "How does exception handling work in Python?",
            "What are lambda functions and when would you use them?"
        ],
        "hard": [
            "Explain generators in Python and when you would use them.",
            "Explain Python's garbage collection mechanism.",
            "What is the difference between multiprocessing and multithreading?",
            "Explain how Python closures work.",
            "How does Python manage memory internally?"
        ]
    },

    # =========================
    # PANDAS
    # =========================
    "pandas": {
        "easy": [
            "What is a Pandas DataFrame?",
            "What is the difference between loc and iloc?",
            "How do you find missing values in a DataFrame?",
            "How do you select a column from a DataFrame?",
            "How do you remove duplicate rows in Pandas?"
        ],
        "medium": [
            "How do you handle missing values in Pandas?",
            "Explain the difference between merge, join and concat.",
            "How does groupby work in Pandas?",
            "How would you detect duplicate records in a DataFrame?",
            "How would you filter rows based on a condition in Pandas?"
        ],
        "hard": [
            "How would you optimize a Pandas pipeline for millions of rows?",
            "How would you handle a merge that unexpectedly multiplies rows?",
            "How would you process a DataFrame that does not fit into memory?",
            "How would you detect and treat outliers in a large DataFrame?",
            "How would you improve the performance of a slow Pandas operation?"
        ]
    },

    # =========================
    # NUMPY
    # =========================
    "numpy": {
        "easy": [
            "What is NumPy?",
            "What is a NumPy array?",
            "How is a NumPy array different from a Python list?",
            "How do you find the shape of a NumPy array?",
            "How do you create an array in NumPy?"
        ],
        "medium": [
            "What is vectorization in NumPy?",
            "Explain broadcasting in NumPy.",
            "What is the difference between reshape and resize?",
            "How would you calculate mean and standard deviation using NumPy?",
            "What is array slicing in NumPy?"
        ],
        "hard": [
            "Why are NumPy operations generally faster than Python loops?",
            "What is the difference between a NumPy view and a copy?",
            "How would you reduce memory usage with large NumPy arrays?",
            "Explain NumPy broadcasting in detail.",
            "How does NumPy achieve efficient numerical computation?"
        ]
    },

    # =========================
    # SQL
    # =========================
    "sql": {
        "easy": [
            "What is a primary key?",
            "What is a SQL JOIN?",
            "What is the difference between WHERE and HAVING?",
            "What is the difference between DELETE and DROP?",
            "What is a foreign key?"
        ],
        "medium": [
            "Explain INNER JOIN versus LEFT JOIN.",
            "How would you find duplicate records in SQL?",
            "What is normalization?",
            "What is a subquery and when would you use one?",
            "What is the difference between GROUP BY and ORDER BY?"
        ],
        "hard": [
            "How would you optimize a slow SQL query?",
            "What is a database index and why does it improve performance?",
            "What are window functions and when would you use them?",
            "How would you find the second-highest salary in SQL?",
            "Explain query optimization in a relational database."
        ]
    },

    # =========================
    # STATISTICS
    # =========================
    "statistics": {
        "easy": [
            "What is the difference between mean, median and mode?",
            "What is variance?",
            "What is standard deviation?",
            "What is the difference between population and sample?",
            "What is a percentile?"
        ],
        "medium": [
            "What is a p-value?",
            "What is a confidence interval?",
            "Explain Type I and Type II errors.",
            "When would you use a t-test?",
            "What is the difference between correlation and covariance?"
        ],
        "hard": [
            "Explain the Central Limit Theorem.",
            "How would you choose a statistical test for two groups?",
            "What assumptions should be checked before a t-test?",
            "Explain correlation versus causation.",
            "How would you handle outliers before performing statistical analysis?"
        ]
    },

    # =========================
    # MACHINE LEARNING
    # =========================
    "machine learning": {
        "easy": [
            "What is supervised learning?",
            "What is the difference between classification and regression?",
            "What is overfitting?",
            "Why do we split data into training and testing sets?",
            "What is a feature in machine learning?"
        ],
        "medium": [
            "Explain the bias-variance tradeoff.",
            "What is cross-validation?",
            "Why is feature scaling important?",
            "How would you handle missing values before training a model?",
            "What is the difference between precision and recall?"
        ],
        "hard": [
            "How would you handle an imbalanced classification dataset?",
            "Explain L1 and L2 regularization.",
            "How would you diagnose and reduce overfitting?",
            "How would you select an evaluation metric for a classification problem?",
            "How would you improve a machine learning model with poor validation performance?"
        ]
    },

    # =========================
    # DEEP LEARNING
    # =========================
    "deep learning": {
        "easy": [
            "What is deep learning?",
            "What is a neural network?",
            "What is an activation function?",
            "What is an epoch?",
            "What is a neuron in a neural network?"
        ],
        "medium": [
            "What is backpropagation?",
            "What is the difference between CNNs and RNNs?",
            "Why are activation functions needed?",
            "What is dropout?",
            "What is the purpose of an optimizer?"
        ],
        "hard": [
            "Explain how backpropagation works.",
            "How would you diagnose vanishing gradients?",
            "How would you prevent overfitting in a deep neural network?",
            "When would you choose CNN, RNN or Transformer architecture?",
            "How would you tune a deep learning model?"
        ]
    },

    # =========================
    # NLP
    # =========================
    "nlp": {
        "easy": [
            "What is Natural Language Processing?",
            "What is tokenization?",
            "What are stop words?",
            "What is stemming?",
            "What is text preprocessing?"
        ],
        "medium": [
            "What is TF-IDF?",
            "What is word embedding?",
            "What is the difference between stemming and lemmatization?",
            "What is sentiment analysis?",
            "How would you convert text into numerical features?"
        ],
        "hard": [
            "How do Transformer models improve NLP tasks?",
            "Explain attention in NLP.",
            "How would you build an NLP text classification system?",
            "What problems can occur when preprocessing natural language data?",
            "How would you evaluate an NLP model?"
        ]
    },

    # =========================
    # LLM
    # =========================
    "llm": {
        "easy": [
            "What is a Large Language Model?",
            "What is a token in an LLM?",
            "What is prompt engineering?",
            "What is generative AI?",
            "What is an embedding?"
        ],
        "medium": [
            "What is the difference between fine-tuning and prompting?",
            "What is RAG?",
            "Why are embeddings used with LLM applications?",
            "What is hallucination in an LLM?",
            "What is the difference between an LLM and a traditional machine learning model?"
        ],
        "hard": [
            "Explain how a Transformer-based LLM processes a prompt.",
            "How would you design a RAG system?",
            "How would you evaluate the quality of an LLM application?",
            "How would you reduce hallucinations in an LLM-powered application?",
            "How would you optimize an LLM application for cost and latency?"
        ]
    },

    # =========================
    # REST API
    # =========================
    "rest api": {
        "easy": [
            "What is a REST API?",
            "What is the difference between GET and POST?",
            "What is an HTTP status code?",
            "What is JSON and why is it commonly used in APIs?",
            "What is an endpoint?"
        ],
        "medium": [
            "Explain the difference between PUT and PATCH.",
            "What is the difference between authentication and authorization?",
            "How would you handle errors in a REST API?",
            "What makes an API RESTful?",
            "What is the difference between 401 and 403 HTTP status codes?"
        ],
        "hard": [
            "How would you design a REST API for a scalable application?",
            "How would you implement authentication and authorization in a REST API?",
            "How would you handle API versioning?",
            "How would you optimize a REST API experiencing high traffic?",
            "How would you implement rate limiting in an API?"
        ]
    },

    # =========================
    # FLASK
    # =========================
    "flask": {
        "easy": [
            "What is Flask?",
            "How do you create a basic Flask application?",
            "What is a route in Flask?",
            "What is the purpose of @app.route?",
            "How do you return JSON from Flask?"
        ],
        "medium": [
            "How do you handle POST requests in Flask?",
            "How do you receive JSON data in a Flask API?",
            "What is Flask-CORS and why might you need it?",
            "How would you organize routes in a larger Flask application?",
            "How do you handle errors in Flask?"
        ],
        "hard": [
            "How would you structure a production Flask application?",
            "How would you implement authentication in Flask?",
            "How would you handle database connections efficiently in Flask?",
            "How would you improve the performance of a Flask API?",
            "How would you deploy a Flask application in production?"
        ]
    },

    # =========================
    # DJANGO
    # =========================
    "django": {
        "easy": [
            "What is Django?",
            "What is a Django model?",
            "What is a Django view?",
            "What is Django ORM?",
            "What is Django middleware?"
        ],
        "medium": [
            "Explain Django's MVT architecture.",
            "How does Django ORM work?",
            "How would you create an API using Django REST Framework?",
            "How does Django middleware work?",
            "How would you handle authentication in Django?"
        ],
        "hard": [
            "How would you optimize a Django application?",
            "How would you implement authentication and permissions in Django REST Framework?",
            "How would you handle database performance issues in Django?",
            "How would you design a scalable Django backend?",
            "How would you optimize Django ORM queries?"
        ]
    },

    # =========================
    # JAVASCRIPT
    # =========================
    "javascript": {
        "easy": [
            "What is JavaScript?",
            "What is the difference between let, const and var?",
            "What is an array in JavaScript?",
            "What is a function in JavaScript?",
            "What is an object in JavaScript?"
        ],
        "medium": [
            "Explain closures in JavaScript.",
            "What is the difference between == and ===?",
            "Explain promises and async/await.",
            "What is event bubbling in JavaScript?",
            "What is destructuring in JavaScript?"
        ],
        "hard": [
            "Explain the JavaScript event loop.",
            "How does asynchronous JavaScript work internally?",
            "Explain closures and lexical scope in detail.",
            "How would you optimize a JavaScript application?",
            "Explain the difference between microtasks and macrotasks."
        ]
    },

    # =========================
    # REACT
    # =========================
    "react": {
        "easy": [
            "What is React?",
            "What is a React component?",
            "What are props in React?",
            "What is state in React?",
            "What is JSX?"
        ],
        "medium": [
            "What is the difference between props and state?",
            "What are React hooks?",
            "Explain useState and useEffect.",
            "Why are keys used when rendering lists in React?",
            "What is conditional rendering in React?"
        ],
        "hard": [
            "How does React's reconciliation process work?",
            "How would you optimize a React application?",
            "Explain controlled and uncontrolled components.",
            "How would you manage complex state in a large React application?",
            "What causes unnecessary re-renders in React?"
        ]
    },

    # =========================
    # NODE.JS
    # =========================
    "node.js": {
        "easy": [
            "What is Node.js?",
            "Why is Node.js commonly used for backend development?",
            "What is npm?",
            "What is the Node.js event loop?",
            "What is a Node.js module?"
        ],
        "medium": [
            "How does asynchronous programming work in Node.js?",
            "What is middleware in Express?",
            "How would you create a REST API using Node.js?",
            "How does Node.js handle multiple requests?",
            "What is the difference between synchronous and asynchronous code?"
        ],
        "hard": [
            "How would you scale a Node.js backend?",
            "Explain the Node.js event loop in detail.",
            "How would you handle CPU-intensive tasks in Node.js?",
            "How would you improve the performance of a Node.js API?",
            "How would you design a production Node.js application?"
        ]
    },

    # =========================
    # EXPRESS
    # =========================
    "express": {
        "easy": [
            "What is Express.js?",
            "What is a route in Express?",
            "What is middleware in Express?",
            "How do you send a JSON response in Express?",
            "How do you create an Express server?"
        ],
        "medium": [
            "How do you handle errors in Express?",
            "How do you create REST endpoints using Express?",
            "How does Express middleware work?",
            "How would you structure an Express application?",
            "How would you validate incoming API data?"
        ],
        "hard": [
            "How would you design a scalable Express API?",
            "How would you implement authentication middleware?",
            "How would you handle rate limiting in an Express API?",
            "How would you optimize an Express application?",
            "How would you secure an Express API?"
        ]
    },

    # =========================
    # HTML
    # =========================
    "html": {
        "easy": [
            "What is HTML?",
            "What is the difference between a div and a span?",
            "What are semantic HTML elements?",
            "What is the purpose of a form in HTML?",
            "What is the purpose of the HTML head element?"
        ],
        "medium": [
            "Why are semantic HTML elements important?",
            "How does form submission work?",
            "What is the difference between block and inline elements?",
            "How would you make an HTML page accessible?",
            "What is the difference between localStorage and sessionStorage?"
        ],
        "hard": [
            "How would you optimize the HTML structure of a large web application?",
            "Explain important accessibility considerations in HTML.",
            "How can poorly structured HTML affect SEO and accessibility?",
            "How would you design a semantic structure for a complex web page?",
            "How would you optimize HTML for page performance?"
        ]
    },

    # =========================
    # CSS
    # =========================
    "css": {
        "easy": [
            "What is CSS?",
            "What is the CSS box model?",
            "What is the difference between class and id selectors?",
            "What is Flexbox?",
            "What is a CSS selector?"
        ],
        "medium": [
            "Explain CSS Grid versus Flexbox.",
            "What is CSS specificity?",
            "How would you make a website responsive?",
            "What is the difference between relative, absolute and fixed positioning?",
            "What are media queries?"
        ],
        "hard": [
            "How would you optimize CSS for a large application?",
            "How would you debug a complex CSS layout?",
            "Explain how CSS specificity is calculated.",
            "How would you design a responsive layout for multiple screen sizes?",
            "How would you reduce unused CSS in a production application?"
        ]
    },

    # =========================
    # GIT
    # =========================
    "git": {
        "easy": [
            "What is Git?",
            "What is a Git repository?",
            "What is the difference between git pull and git push?",
            "What is a commit?",
            "What is a Git branch?"
        ],
        "medium": [
            "What is the difference between git merge and git rebase?",
            "What is git stash and when would you use it?",
            "How would you resolve a merge conflict?",
            "What is the difference between git fetch and git pull?",
            "What is a .gitignore file?"
        ],
        "hard": [
            "Explain how Git rebase works.",
            "How would you recover a lost commit using Git?",
            "How would you maintain a clean Git workflow in a team project?",
            "What would you do if you accidentally committed sensitive information?",
            "How would you manage multiple feature branches in a team?"
        ]
    },

    # =========================
    # DATABASE
    # =========================
    "database": {
        "easy": [
            "What is a database?",
            "What is a relational database?",
            "What is a table?",
            "What is a primary key?",
            "What is a foreign key?"
        ],
        "medium": [
            "What is normalization?",
            "What is database indexing?",
            "What is the difference between SQL and NoSQL databases?",
            "What are database constraints?",
            "What is a database transaction?"
        ],
        "hard": [
            "How would you optimize a database with slow queries?",
            "Explain database indexing and its trade-offs.",
            "How would you design a database for a high-traffic application?",
            "Explain database transactions and ACID properties.",
            "How would you design a scalable database architecture?"
        ]
    },

    # =========================
    # MONGODB
    # =========================
    "mongodb": {
        "easy": [
            "What is MongoDB?",
            "What is a document in MongoDB?",
            "What is a collection?",
            "How is MongoDB different from a relational database?",
            "What is BSON?"
        ],
        "medium": [
            "What is an index in MongoDB?",
            "What is the difference between embedding and referencing?",
            "How would you query documents in MongoDB?",
            "What are MongoDB aggregation pipelines?",
            "How do you update a document in MongoDB?"
        ],
        "hard": [
            "How would you optimize a MongoDB query?",
            "How would you design a MongoDB schema for a large application?",
            "Explain MongoDB replication.",
            "When would you choose MongoDB over a relational database?",
            "How would you scale a MongoDB application?"
        ]
    },

    # =========================
    # POSTGRESQL
    # =========================
    "postgresql": {
        "easy": [
            "What is PostgreSQL?",
            "What is a primary key in PostgreSQL?",
            "What is a foreign key?",
            "How do you create a table in PostgreSQL?",
            "What is a PostgreSQL schema?"
        ],
        "medium": [
            "What are indexes in PostgreSQL?",
            "How do transactions work in PostgreSQL?",
            "How would you optimize a slow PostgreSQL query?",
            "What are PostgreSQL constraints?",
            "What is the EXPLAIN command in PostgreSQL?"
        ],
        "hard": [
            "Explain PostgreSQL query planning and EXPLAIN.",
            "How would you optimize a PostgreSQL database for high traffic?",
            "Explain transaction isolation levels.",
            "How would you design a scalable PostgreSQL schema?",
            "How would you diagnose database performance problems?"
        ]
    },

    # =========================
    # BACKEND
    # =========================
    "backend": {
        "easy": [
            "What is backend development?",
            "What is an API?",
            "What is a server?",
            "What is client-server architecture?",
            "What is a backend framework?"
        ],
        "medium": [
            "Explain how a request travels from a frontend application to a backend server.",
            "How would you design authentication for a backend application?",
            "How do you handle errors in backend applications?",
            "What is middleware?",
            "How would you validate data received by a backend?"
        ],
        "hard": [
            "How would you design a scalable backend architecture?",
            "How would you handle thousands of concurrent requests?",
            "How would you secure a production backend?",
            "How would you design caching for a high-traffic backend?",
            "How would you monitor a production backend?"
        ]
    },

    # =========================
    # FULL STACK
    # =========================
    "full stack": {
        "easy": [
            "What is full-stack development?",
            "What is the difference between frontend and backend?",
            "How does a frontend communicate with a backend?",
            "What is an API?",
            "What is client-server architecture?"
        ],
        "medium": [
            "Explain the complete flow of a request from React to a backend API and database.",
            "How would you handle authentication between frontend and backend?",
            "How would you structure a full-stack application?",
            "How would you handle errors between frontend and backend?",
            "How would you connect a React frontend to a Flask backend?"
        ],
        "hard": [
            "How would you design a scalable full-stack application?",
            "How would you secure communication between frontend, backend and database?",
            "How would you optimize a full-stack application experiencing performance issues?",
            "How would you design deployment architecture for a production full-stack application?",
            "How would you design a full-stack application capable of handling high traffic?"
        ]
    },

    # =========================
    # DSA
    # =========================
    "dsa": {
        "easy": [
            "What is an array?",
            "What is a linked list?",
            "What is a stack?",
            "What is a queue?",
            "What is the time complexity of accessing an array element?"
        ],
        "medium": [
            "Explain binary search and its time complexity.",
            "What is the difference between BFS and DFS?",
            "How does a hash table work?",
            "How would you detect a cycle in a linked list?",
            "What is the difference between a stack and a queue?"
        ],
        "hard": [
            "How does a hash table handle collisions?",
            "Compare merge sort and quicksort.",
            "How would you find the longest substring without repeating characters?",
            "How would you find the top K frequent elements?",
            "How would you optimize a solution that currently takes O(n²) time?"
        ]
    },

    # =========================
    # OOP
    # =========================
    "oop": {
        "easy": [
            "What is a class and what is an object?",
            "What is inheritance?",
            "What is encapsulation?",
            "What is the purpose of __init__?",
            "What is polymorphism?"
        ],
        "medium": [
            "Explain polymorphism with an example.",
            "What is method overriding?",
            "What is the difference between inheritance and composition?",
            "Why is self required in Python instance methods?",
            "What is method overloading?"
        ],
        "hard": [
            "Explain multiple inheritance and method resolution order.",
            "What are abstract classes?",
            "Explain composition versus inheritance.",
            "How would you design a reusable class hierarchy?",
            "What are the advantages of object-oriented design?"
        ]
    }
}


# =========================================================
# GET RANDOM QUESTION FROM RESUME SKILLS
# =========================================================

def get_resume_question(
    resume_text,
    difficulty="medium",
    asked_questions=None
):
    """
    Detect skills from resume and randomly select
    a question from those skills.

    Previously asked questions are excluded.
    """

    if asked_questions is None:
        asked_questions = []

    # Detect skills
    skills = detect_skills(resume_text)

    # Safe fallback
    if not skills:
        skills = ["python"]

    available_questions = []

    # Collect questions from ALL detected skills
    for skill in skills:

        if skill not in QUESTION_BANK:
            continue

        skill_bank = QUESTION_BANK[skill]

        # Get requested difficulty
        questions = skill_bank.get(
            difficulty,
            skill_bank.get("medium", [])
        )

        for question in questions:

            if question not in asked_questions:

                available_questions.append({
                    "next_question": question,
                    "topic": skill,
                    "difficulty": difficulty
                })

    # =====================================================
    # If all questions at this difficulty were used
    # =====================================================

    if not available_questions:

        for skill in skills:

            if skill not in QUESTION_BANK:
                continue

            for level, questions in QUESTION_BANK[skill].items():

                for question in questions:

                    if question not in asked_questions:

                        available_questions.append({
                            "next_question": question,
                            "topic": skill,
                            "difficulty": level
                        })

    # =====================================================
    # Absolute fallback
    # =====================================================

    if not available_questions:

        question = random.choice(
            QUESTION_BANK["python"]["medium"]
        )

        return {
            "next_question": question,
            "topic": "python",
            "difficulty": "medium"
        }

    # =====================================================
    # RANDOM SELECTION
    # =====================================================

    return random.choice(available_questions)


# =========================================================
# SPECIFIC TOPIC FALLBACK
# =========================================================

def get_fallback_question(
    topic,
    difficulty="medium"
):

    topic = topic.lower()

    if topic not in QUESTION_BANK:
        topic = "python"

    if difficulty not in QUESTION_BANK[topic]:
        difficulty = "medium"

    question = random.choice(
        QUESTION_BANK[topic][difficulty]
    )

    return {
        "next_question": question,
        "topic": topic,
        "difficulty": difficulty
    }


# =========================================================
# TEST
# =========================================================

if __name__ == "__main__":

    resume = """
    I am an AI and Data Science student.

    Skills:
    Python, Pandas, NumPy, SQL, PostgreSQL,
    React, JavaScript, REST API, Flask,
    Machine Learning, NLP, Git and GitHub.
    """

    print("\n==============================")
    print("DETECTED SKILLS")
    print("==============================")

    skills = detect_skills(resume)

    for skill in skills:
        print("-", skill)

    print("\n==============================")
    print("RANDOM QUESTIONS")
    print("==============================")

    asked_questions = []

    for i in range(10):

        result = get_resume_question(
            resume_text=resume,
            difficulty="medium",
            asked_questions=asked_questions
        )

        question = result["next_question"]

        print(
            f"\n{i + 1}. "
            f"[{result['topic']}] "
            f"{question}"
        )

        asked_questions.append(question)