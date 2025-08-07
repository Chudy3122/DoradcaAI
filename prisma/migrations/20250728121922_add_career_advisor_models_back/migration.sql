/*
  Warnings:

  - You are about to drop the `competency_test_types` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `competency_tests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `education_paths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profession_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `profession_education_paths` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `professions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `test_recommendations` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_career_profiles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profession_interests` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_test_results` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "competency_tests" DROP CONSTRAINT "competency_tests_typeId_fkey";

-- DropForeignKey
ALTER TABLE "profession_education_paths" DROP CONSTRAINT "profession_education_paths_educationPathId_fkey";

-- DropForeignKey
ALTER TABLE "profession_education_paths" DROP CONSTRAINT "profession_education_paths_professionId_fkey";

-- DropForeignKey
ALTER TABLE "professions" DROP CONSTRAINT "professions_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "test_recommendations" DROP CONSTRAINT "test_recommendations_professionId_fkey";

-- DropForeignKey
ALTER TABLE "test_recommendations" DROP CONSTRAINT "test_recommendations_testId_fkey";

-- DropForeignKey
ALTER TABLE "user_career_profiles" DROP CONSTRAINT "user_career_profiles_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_profession_interests" DROP CONSTRAINT "user_profession_interests_professionId_fkey";

-- DropForeignKey
ALTER TABLE "user_profession_interests" DROP CONSTRAINT "user_profession_interests_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_test_results" DROP CONSTRAINT "user_test_results_testId_fkey";

-- DropForeignKey
ALTER TABLE "user_test_results" DROP CONSTRAINT "user_test_results_userId_fkey";

-- DropTable
DROP TABLE "competency_test_types";

-- DropTable
DROP TABLE "competency_tests";

-- DropTable
DROP TABLE "education_paths";

-- DropTable
DROP TABLE "profession_categories";

-- DropTable
DROP TABLE "profession_education_paths";

-- DropTable
DROP TABLE "professions";

-- DropTable
DROP TABLE "test_recommendations";

-- DropTable
DROP TABLE "user_career_profiles";

-- DropTable
DROP TABLE "user_profession_interests";

-- DropTable
DROP TABLE "user_test_results";
