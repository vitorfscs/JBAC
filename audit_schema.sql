-- Tabela de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    performer_id UUID NOT NULL REFERENCES profiles(id),
    target_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Apenas Super Admins podem ver todos os logs
CREATE POLICY "Super Admins can view all logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Admins de Escritório podem ver logs do seu escritório
CREATE POLICY "Office Admins can view their office logs" ON audit_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles p1
            JOIN profiles p2 ON p1.office_id = p2.office_id
            WHERE p1.id = auth.uid() AND p1.role = 'office_admin' AND p2.id = audit_logs.performer_id
        )
    );

-- Política de Inserção: Qualquer usuário autenticado pode inserir logs (o sistema fará isso)
CREATE POLICY "Authenticated users can insert logs" ON audit_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas RLS para RBAC de Exclusão
-- 1. Impedir que Contadores excluam Admins de Escritório
-- Nota: Supabase RLS policies são permissivas (OR). Para "proibir", precisamos garantir que as políticas existentes não permitam.
-- Vamos ajustar a política de exclusão na tabela profiles.

DROP POLICY IF EXISTS "Allow all profiles" ON profiles;

-- Super Admins podem fazer tudo
CREATE POLICY "Super Admins full access" ON profiles
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
    );

-- Admins de Escritório podem gerenciar usuários do seu escritório
CREATE POLICY "Office Admins manage their office" ON profiles
    FOR ALL USING (
        office_id = (SELECT office_id FROM profiles WHERE id = auth.uid() AND role = 'office_admin')
    );

-- Contadores podem ver usuários do escritório
CREATE POLICY "Accountants view office users" ON profiles
    FOR SELECT USING (
        office_id = (SELECT office_id FROM profiles WHERE id = auth.uid() AND role = 'accountant')
    );

-- Contadores podem EXCLUIR apenas CLIENTES
CREATE POLICY "Accountants delete only clients" ON profiles
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'accountant')
        AND role = 'client'
    );

-- Política para Clientes (ver apenas a si mesmo)
CREATE POLICY "Clients view self" ON profiles
    FOR SELECT USING (id = auth.uid());
