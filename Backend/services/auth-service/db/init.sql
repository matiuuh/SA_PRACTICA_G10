CREATE TABLE "roles" (
  "id_rol" uuid PRIMARY KEY,
  "nombre" varchar UNIQUE NOT NULL
);

COMMENT ON TABLE "roles" IS 'Roles del sistema';

CREATE TABLE "usuarios" (
  "id_usuario" uuid PRIMARY KEY,
  "nombre" varchar NOT NULL,
  "correo" varchar UNIQUE NOT NULL,
  "password_hash" varchar NOT NULL,
  "id_rol" uuid NOT NULL
);

COMMENT ON TABLE "usuarios" IS 'Usuarios registrados';

ALTER TABLE "usuarios"
  ADD CONSTRAINT "usuarios_roles"
  FOREIGN KEY ("id_rol") REFERENCES "roles" ("id_rol")
  DEFERRABLE INITIALLY IMMEDIATE;

-- Seed: roles y administrador inicial
CREATE EXTENSION IF NOT EXISTS pgcrypto;

INSERT INTO "roles" ("id_rol", "nombre") VALUES
  ('00000000-0000-0000-0000-000000000001', 'ADMINISTRADOR'),
  ('00000000-0000-0000-0000-000000000002', 'CLIENTE');

INSERT INTO "usuarios" ("id_usuario", "nombre", "correo", "password_hash", "id_rol") VALUES
  (
    '00000000-0000-0000-0000-000000000010',
    'Administrador',
    'admin@filmstars.com',
    crypt('admin1234', gen_salt('bf', 10)),
    '00000000-0000-0000-0000-000000000001'
  );
