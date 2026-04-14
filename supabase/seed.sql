-- Tareas del Usuario A
INSERT INTO tasks (user_id, title, description, priority, status, position)
VALUES
  ('beb5e261-6f6e-4cae-80df-2bf09b189b84', 'Configurar Supabase', 'Setup inicial del proyecto', 'high', 'todo', 1),
  ('beb5e261-6f6e-4cae-80df-2bf09b189b84', 'Crear componente Kanban', 'UI con drag and drop', 'high', 'in_progress', 2),
  ('beb5e261-6f6e-4cae-80df-2bf09b189b84', 'Implementar RAG', 'Chat con contexto de tareas', 'medium', 'todo', 3);

-- Tareas del Usuario B
INSERT INTO tasks (user_id, title, description, priority, status, position)
VALUES
  ('558e45c2-7766-4f0b-8583-8cc97acc4e44', 'Revisar documentacion', 'Leer docs de Next.js 15', 'low', 'todo', 1),
  ('558e45c2-7766-4f0b-8583-8cc97acc4e44', 'Preparar presentacion', 'Demo final del curso', 'high', 'in_progress', 2);
