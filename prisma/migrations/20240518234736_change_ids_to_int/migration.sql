-- Drop the foreign key constraint on the old column
ALTER TABLE "Task" DROP CONSTRAINT IF EXISTS "Task_userId_fkey";

-- Rename the existing userId column
ALTER TABLE "Task" RENAME COLUMN "userId" TO "oldUserId";

-- Rename the existing id column in User table
ALTER TABLE "User" RENAME COLUMN "id" TO "oldId";

-- Create the new userId column with the correct type
ALTER TABLE "Task" ADD COLUMN "userId_temp" INT;

-- Create the new id column with the correct type in User table
ALTER TABLE "User" ADD COLUMN "id_temp" INT GENERATED BY DEFAULT AS IDENTITY;

-- Generate new IDs for users
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT "oldId" FROM "User") LOOP
        UPDATE "User" SET "id_temp" = nextval(pg_get_serial_sequence('"User"', 'id_temp')) WHERE "oldId" = r."oldId";
    END LOOP;
END $$;

-- Update Task table with new user IDs
UPDATE "Task" SET "userId_temp" = (SELECT "id_temp" FROM "User" WHERE "oldId" = "Task"."oldUserId");

-- Drop the old userId column from Task table
ALTER TABLE "Task" DROP COLUMN "oldUserId";

-- Drop the old id column from User table
ALTER TABLE "User" DROP COLUMN "oldId";

-- Rename the new column to the original column name in Task table
ALTER TABLE "Task" RENAME COLUMN "userId_temp" TO "userId";

-- Rename the new column to the original column name in User table
ALTER TABLE "User" RENAME COLUMN "id_temp" TO "id";

-- Set the new id column as primary key
ALTER TABLE "User" ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- Recreate the foreign key constraint on the new column
ALTER TABLE "Task" ADD CONSTRAINT "Task_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
