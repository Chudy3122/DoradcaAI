-- CreateTable
CREATE TABLE "profession_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "profession_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "professions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "requirements" TEXT[],
    "skills" TEXT[],
    "education" TEXT[],
    "experience" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "salaryAverage" INTEGER,
    "growthProspects" TEXT,
    "demandLevel" TEXT,
    "automationRisk" TEXT,
    "workingConditions" TEXT,
    "benefits" TEXT[],
    "challenges" TEXT[],
    "dayInLife" TEXT,
    "categoryId" TEXT NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "interestCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "professions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "education_paths" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "institution" TEXT,
    "duration" TEXT,
    "cost" INTEGER,
    "description" TEXT,
    "requirements" TEXT[],
    "website" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "region" TEXT,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "education_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profession_education_paths" (
    "id" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "educationPathId" TEXT NOT NULL,
    "relevance" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profession_education_paths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_test_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT,
    "timeLimit" INTEGER,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_test_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competency_tests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "questions" JSONB NOT NULL,
    "scoringRules" JSONB NOT NULL,
    "resultRanges" JSONB NOT NULL,
    "typeId" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competency_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_test_results" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "testId" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "scores" JSONB NOT NULL,
    "interpretation" TEXT,
    "recommendedProfessions" TEXT[],
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "user_test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_recommendations" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "minScore" INTEGER NOT NULL,
    "maxScore" INTEGER,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "description" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_career_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "skills" TEXT[],
    "interests" TEXT[],
    "values" TEXT[],
    "workPreferences" JSONB,
    "careerGoals" TEXT,
    "educationPlans" TEXT,
    "experienceLevel" TEXT,
    "recommendedProfessions" TEXT[],
    "lastRecommendationUpdate" TIMESTAMP(3),
    "notes" TEXT,
    "profileCompleteness" INTEGER NOT NULL DEFAULT 0,
    "lastTestDate" TIMESTAMP(3),
    "testsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_career_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profession_interests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "professionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "priority" INTEGER,
    "notes" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profession_interests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "profession_categories_name_key" ON "profession_categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "professions_name_key" ON "professions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "profession_education_paths_professionId_educationPathId_key" ON "profession_education_paths"("professionId", "educationPathId");

-- CreateIndex
CREATE UNIQUE INDEX "competency_test_types_name_key" ON "competency_test_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "test_recommendations_testId_professionId_key" ON "test_recommendations"("testId", "professionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_career_profiles_userId_key" ON "user_career_profiles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profession_interests_userId_professionId_key" ON "user_profession_interests"("userId", "professionId");

-- AddForeignKey
ALTER TABLE "professions" ADD CONSTRAINT "professions_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "profession_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profession_education_paths" ADD CONSTRAINT "profession_education_paths_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profession_education_paths" ADD CONSTRAINT "profession_education_paths_educationPathId_fkey" FOREIGN KEY ("educationPathId") REFERENCES "education_paths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competency_tests" ADD CONSTRAINT "competency_tests_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "competency_test_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_test_results" ADD CONSTRAINT "user_test_results_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_test_results" ADD CONSTRAINT "user_test_results_testId_fkey" FOREIGN KEY ("testId") REFERENCES "competency_tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_testId_fkey" FOREIGN KEY ("testId") REFERENCES "competency_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_recommendations" ADD CONSTRAINT "test_recommendations_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_career_profiles" ADD CONSTRAINT "user_career_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profession_interests" ADD CONSTRAINT "user_profession_interests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profession_interests" ADD CONSTRAINT "user_profession_interests_professionId_fkey" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
