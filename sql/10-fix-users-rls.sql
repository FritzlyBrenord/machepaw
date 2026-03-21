-- =====================================================
-- 10-FIX-USERS-RLS.SQL
-- Corrige l'erreur 500 (récursion infinie) sur la table users
-- =====================================================

-- On supprime les anciennes politiques problématiques
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Sécurité pour la table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 1. Un utilisateur peut lire et modifier sa propre ligne sans déclencher de boucle
CREATE POLICY "Users can read own profile"
    ON public.users
    FOR SELECT
    USING (id = auth.uid() OR auth_id = auth.uid());

CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    USING (id = auth.uid() OR auth_id = auth.uid());

-- 2. Les administrateurs peuvent tout faire sur toutes les lignes.
-- Pour éviter la récursion (qu'une table se lise elle-même pour vérifier l'accès),
-- nous utilisons directement les métadonnées certifiées du jeton d'authentification.
CREATE POLICY "Admins can manage all users"
    ON public.users
    FOR ALL
    USING (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() -> 'user_metadata' ->> 'role' = 'admin');

-- On s'assure que pgcrypto est actif
CREATE EXTENSION IF NOT EXISTS pgcrypto;
