-- Add column "storageName" to table "File"
ALTER TABLE "public"."File" ADD COLUMN "storageName" TEXT;

UPDATE "public"."File" SET "storageName" = "name" WHERE "storageName" IS NULL;
