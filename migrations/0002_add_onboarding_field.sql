-- Adicionar campo de onboarding completado
ALTER TABLE users ADD COLUMN onboarding_completed INTEGER DEFAULT 0;
