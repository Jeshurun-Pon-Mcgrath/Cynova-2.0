import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Attribute,
  Difficulty,
  Recurrence,
} from "../generated/prisma/client.js";
import { argon2id, hash } from "argon2";
import { calculateQuestReward } from "../src/progression/progression.engine.js";

const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!url) throw new Error("DATABASE_URL or DIRECT_URL is required to seed.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url }),
});

const rewards = [
  [
    "10000000-0000-4000-8000-000000000001",
    "moonlit-realm",
    "THEME",
    "RARE",
    "Moonlit Realm",
    "A calm blue sanctuary for focused evenings.",
    650,
  ],
  [
    "10000000-0000-4000-8000-000000000002",
    "solar-flare",
    "CORE_SKIN",
    "EPIC",
    "Solar Flare",
    "A warm core skin earned through consistent action.",
    1100,
  ],
  [
    "10000000-0000-4000-8000-000000000003",
    "unbroken",
    "TITLE",
    "LEGENDARY",
    "The Unbroken",
    "A title for sustained discipline.",
    1800,
  ],
  [
    "10000000-0000-4000-8000-000000000004",
    "bronze-frame",
    "AVATAR_FRAME",
    "COMMON",
    "Bronze Frame",
    "A restrained frame for a new character.",
    180,
  ],
  [
    "10000000-0000-4000-8000-000000000005",
    "streak-shield",
    "STREAK_SHIELD",
    "RARE",
    "Streak Shield",
    "A future-use recovery item for a missed day.",
    800,
  ],
] as const;

const skills = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    slug: "focused-mind",
    name: "Focused Mind",
    description: "Build a reliable focus practice.",
    attribute: "INTELLECT",
    maxLevel: 5,
    requiredPlayerLevel: 1,
    sortOrder: 1,
  },
  {
    id: "20000000-0000-4000-8000-000000000002",
    slug: "deep-work",
    name: "Deep Work",
    description: "Strengthen longer focus sessions.",
    attribute: "DISCIPLINE",
    maxLevel: 5,
    requiredPlayerLevel: 4,
    prerequisiteId: "20000000-0000-4000-8000-000000000001",
    prerequisiteLevel: 2,
    sortOrder: 2,
  },
  {
    id: "20000000-0000-4000-8000-000000000003",
    slug: "flow-state",
    name: "Flow State",
    description: "Unlock a focused daily challenge.",
    attribute: "CREATIVITY",
    maxLevel: 3,
    requiredPlayerLevel: 8,
    prerequisiteId: "20000000-0000-4000-8000-000000000002",
    prerequisiteLevel: 3,
    sortOrder: 3,
  },
] as const;

const achievements = [
  {
    id: "30000000-0000-4000-8000-000000000001",
    slug: "first-step",
    name: "First Step",
    description: "Complete the first quest.",
    requirementType: "QUEST_COUNT",
    threshold: 1,
    sortOrder: 1,
  },
  {
    id: "30000000-0000-4000-8000-000000000002",
    slug: "seven-day-rhythm",
    name: "Seven-Day Rhythm",
    description: "Reach a seven-day streak.",
    requirementType: "STREAK",
    threshold: 7,
    sortOrder: 2,
  },
  {
    id: "30000000-0000-4000-8000-000000000003",
    slug: "quest-fifty",
    name: "Fifty Finished",
    description: "Complete fifty quests.",
    requirementType: "QUEST_COUNT",
    threshold: 50,
    sortOrder: 3,
  },
];

async function main() {
  for (const [id, slug, category, rarity, name, description, price] of rewards)
    await prisma.reward.upsert({
      where: { slug },
      update: { category, rarity, name, description, price, available: true },
      create: { id, slug, category, rarity, name, description, price },
    });
  for (const skill of skills)
    await prisma.skillNode.upsert({
      where: { slug: skill.slug },
      update: skill,
      create: skill,
    });
  for (const achievement of achievements)
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  if (process.env.ENABLE_DEMO_USER !== "true") return;
  const email = process.env.DEMO_USER_EMAIL?.trim().toLowerCase();
  const password = process.env.DEMO_USER_PASSWORD;
  if (!email || !password || password.length < 12)
    throw new Error(
      "Demo seeding requires DEMO_USER_EMAIL and a 12+ character DEMO_USER_PASSWORD.",
    );
  const passwordHash = await hash(password, { type: argon2id });
  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash },
    create: {
      email,
      passwordHash,
      profile: { create: { displayName: "Demo Player", timezone: "UTC" } },
      streak: { create: {} },
      preference: { create: {} },
    },
  });
  await prisma.playerAttribute.createMany({
    data: Object.values(Attribute).map((attribute) => ({
      userId: user.id,
      attribute,
    })),
    skipDuplicates: true,
  });
  const questInput = {
    category: Attribute.INTELLECT,
    difficulty: Difficulty.STANDARD,
    estimatedMinutes: 30,
  };
  const reward = calculateQuestReward(
    questInput.category,
    questInput.difficulty,
    questInput.estimatedMinutes,
  );
  const existing = await prisma.quest.findFirst({
    where: {
      userId: user.id,
      title: "Review one focused study topic",
      deletedAt: null,
    },
  });
  if (!existing)
    await prisma.quest.create({
      data: {
        userId: user.id,
        title: "Review one focused study topic",
        description: "Complete one focused review session.",
        ...questInput,
        recurrence: Recurrence.NONE,
        dueAt: new Date(Date.now() + 86_400_000),
        tags: ["study"],
        xpReward: reward.xp,
        goldReward: reward.gold,
      },
    });
}

void main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
