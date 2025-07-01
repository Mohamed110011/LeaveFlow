CREATE TABLE employee_satisfaction (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(user_id),
    satisfaction_score INTEGER CHECK (satisfaction_score >= 0 AND satisfaction_score <= 100),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id)
);
