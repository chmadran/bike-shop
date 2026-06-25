-- Vur Selle Bikes — Neon Postgres schema
-- Requires: CREATE EXTENSION vector;

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS bike_faq (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  region TEXT NOT NULL DEFAULT 'UK',
  embedding vector(1536) NOT NULL
);

CREATE INDEX IF NOT EXISTS bike_faq_embedding_idx
  ON bike_faq USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

CREATE TABLE IF NOT EXISTS bike_stock (
  id SERIAL PRIMARY KEY,
  model_name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_gbp INTEGER NOT NULL,
  weight_kg NUMERIC(5, 1),
  best_for TEXT,
  spec TEXT,
  warehouse TEXT NOT NULL DEFAULT 'London',
  in_stock BOOLEAN NOT NULL DEFAULT true,
  quantity INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS bike_stock_model_idx ON bike_stock (model_name);
