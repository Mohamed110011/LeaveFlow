-- CREATE DATABASE jwttutorial;

-- CREATE TABLE users(
--   user_id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
--   user_name VARCHAR(255) NOT NULL,
--   user_email VARCHAR(255) NOT NULL UNIQUE,
--   user_password VARCHAR(255) NOT NULL
-- );

-- CREATE TABLE todo(
--   todo_id SERIAL,
--   user_id UUID ,
--   description VARCHAR(255),
--   PRIMARY KEY (todo_id),
--   FOREIGN KEY (user_id) REFERENCES users(user_id)
-- );


-- CREATE DATABASE authtodolist;

-- --users

-- CREATE TABLE users(
--   user_id UUID DEFAULT uuid_generate_v4(),
--   user_name VARCHAR(255) NOT NULL,
--   user_email VARCHAR(255) NOT NULL UNIQUE,
--   user_password VARCHAR(255) NOT NULL,
--   PRIMARY KEY (user_id)
-- );

-- --todos

-- CREATE TABLE todos(
--   todo_id SERIAL,
--   user_id UUID,
--   description VARCHAR(255) NOT NULL,
--   PRIMARY KEY (todo_id),
--   FOREIGN KEY (user_id) REFERENCES users(user_id)
-- );

-- --fake users data

-- insert into users (user_name, user_email, user_password) values ('henry', 'henryly213@gmail.com', 'kthl8822');

-- --fake todos data

-- insert into todos (user_id, description) values ('96cec373-ac99-44e5-8d2c-4969d98499f2', 'clean med');



CREATE DATABASE smarthome;


--users

CREATE TABLE users(
  user_id UUID DEFAULT uuid_generate_v4(),
  user_name VARCHAR(255) NOT NULL,
  user_email VARCHAR(255) NOT NULL UNIQUE,
  user_password VARCHAR(255) NOT NULL,
  role VARCHAR(50),
  date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  PRIMARY KEY (user_id)
);


--fake users data


--fake todos data


CREATE EXTENSION IF NOT EXISTS "uuid-ossp";