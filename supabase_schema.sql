-- Script para crear la base de datos de SoulSync en Supabase
-- Ejecuta esto en el "SQL Editor" de tu proyecto de Supabase

-- 1. Tabla de Parejas (Vinculación)
CREATE TABLE couples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pairing_code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Moods (Estados en tiempo real)
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID DEFAULT auth.uid(), -- Opcional si usas Auth, si no, usa un ID único
  user_name TEXT NOT NULL,
  couple_id UUID REFERENCES couples(id),
  energy TEXT,
  mental TEXT,
  needs TEXT,
  mood TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar Realtime para la tabla de moods
ALTER PUBLICATION supabase_realtime ADD TABLE moods;
