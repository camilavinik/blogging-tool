
-- This makes sure that foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create your tables with SQL commands here (watch out for slight syntactical differences with SQLite vs MySQL)

CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    hashed_password TEXT NOT NULL,
    user_name TEXT NOT NULL,
    blog_title TEXT
);

CREATE TABLE IF NOT EXISTS email_accounts (
    email_account_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_address TEXT NOT NULL,
    user_id  INT, --the user that the email account belongs to
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS articles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  INT NOT NULL, --the user that the article belongs to
    name TEXT,
    content TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    last_modified DATE DEFAULT CURRENT_TIMESTAMP,
    published_at DATE,
    number_of_reads INT DEFAULT 0,
    number_of_likes INT DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id  INT NOT NULL, --the article that the comment belongs to
    content TEXT,
    created_at DATE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (article_id) REFERENCES articles(id)
);

-- Insert default data (if necessary here)

-- Set up three users
INSERT INTO users ('user_name', 'hashed_password') VALUES ('Simon Star', '$2b$10$YbvbRFiFqScKc9H.zfdQyebqrZcNf1uA0x.7XS2lPp9q4Q6.cffFm'); -- password is 'password123'
INSERT INTO users ('user_name', 'blog_title', 'hashed_password') VALUES ('Dianne Dean', 'Hello world', '$2b$10$YbvbRFiFqScKc9H.zfdQyebqrZcNf1uA0x.7XS2lPp9q4Q6.cffFm'); -- password is 'password123'
INSERT INTO users ('user_name', 'blog_title', 'hashed_password') VALUES ('Harry Hilbert', 'The Life of Harry', '$2b$10$YbvbRFiFqScKc9H.zfdQyebqrZcNf1uA0x.7XS2lPp9q4Q6.cffFm'); -- password is 'password123'

-- Give Simon two email addresses and Diane one, but Harry has none
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@gmail.com', 1); 
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('simon@hotmail.com', 1); 
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('test@mail.com', 1); 
INSERT INTO email_accounts ('email_address', 'user_id') VALUES ('dianne@yahoo.co.uk', 2); 

-- Insert articles
INSERT INTO articles ('user_id', 'name', 'content', 'published_at') VALUES (1, 'my first article', 'Lorem Ipsum', CURRENT_TIMESTAMP);
INSERT INTO articles ('user_id', 'name', 'content', 'published_at') VALUES (1, 'my second article', 'Lorem Ipsum', CURRENT_TIMESTAMP);  
INSERT INTO articles ('user_id', 'name') VALUES (1, 'the effect of cows'); 
INSERT INTO articles ('user_id', 'name', 'content') VALUES (2, 'what you should know about me', 'Lorem Ipsum'); 

COMMIT;

