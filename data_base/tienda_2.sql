CREATE TYPE "orders_status" AS ENUM (
  'pending',
  'complete',
  'cancel'
);

CREATE TABLE "product" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "unit_cost" numeric(10,2) NOT NULL,
  "unit_price" numeric(10,2) NOT NULL,
  "unit_stock" int NOT NULL DEFAULT 0,
  "quantity_per_unit" int NOT NULL DEFAULT 1,
  "id_category" uuid NOT NULL,
  "id_supplier" uuid NOT NULL
);

CREATE TABLE "category" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100) UNIQUE,
  "description" varchar(500)
);

CREATE TABLE "supplier" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "address" varchar(200),
  "city" varchar(50),
  "phone" varchar(15) UNIQUE
);

CREATE TABLE "orders" (
  "id" uuid PRIMARY KEY,
  "date" timestamp NOT NULL DEFAULT 'now()',
  "id_customer" uuid NOT NULL,
  "id_employee" uuid NOT NULL,
  "total_amount" numeric(10,2) NOT NULL DEFAULT 0,
  "status" orders_status NOT NULL DEFAULT 'pending'
);

CREATE TABLE "order_detail" (
  "id" uuid PRIMARY KEY,
  "id_product" uuid NOT NULL,
  "id_order" uuid NOT NULL,
  "unit_price" numeric(10,2) NOT NULL,
  "unit_cost" numeric(10,2) NOT NULL,
  "quantity" int NOT NULL,
  "discount" numeric(5,2) NOT NULL DEFAULT 0
);

CREATE TABLE "customer" (
  "id" uuid PRIMARY KEY,
  "name" varchar(200) NOT NULL,
  "phone" varchar(15) UNIQUE
);

CREATE TABLE "employee" (
  "id" uuid PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "lastname" varchar(100) NOT NULL,
  "title" varchar(50),
  "hire_date" date DEFAULT 'now()',
  "address" varchar(100),
  "phone" varchar(15) UNIQUE,
  "report_to" uuid
);

CREATE INDEX ON "product" ("name");

CREATE INDEX ON "supplier" ("name");

CREATE UNIQUE INDEX ON "order_detail" ("id_order", "id_product");

CREATE INDEX ON "employee" ("lastname");

CREATE INDEX ON "employee" ("report_to");

COMMENT ON COLUMN "order_detail"."discount" IS 'Porcentaje de descuento: 0 a 100';

ALTER TABLE "product" ADD FOREIGN KEY ("id_category") REFERENCES "category" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "product" ADD FOREIGN KEY ("id_supplier") REFERENCES "supplier" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("id_customer") REFERENCES "customer" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "orders" ADD FOREIGN KEY ("id_employee") REFERENCES "employee" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_detail" ADD FOREIGN KEY ("id_product") REFERENCES "product" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "order_detail" ADD FOREIGN KEY ("id_order") REFERENCES "orders" ("id") DEFERRABLE INITIALLY IMMEDIATE;

ALTER TABLE "employee" ADD FOREIGN KEY ("report_to") REFERENCES "employee" ("id") DEFERRABLE INITIALLY IMMEDIATE;
