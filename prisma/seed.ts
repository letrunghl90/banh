// Dữ liệu MẪU cho máy phát triển và staging. Mọi tên đều có nhãn "[MẪU]" (AC-PLT-02).
// Không dùng dữ liệu thật của trẻ.
import { PrismaClient } from '@prisma/client';
import { hash } from '@node-rs/argon2';

const prisma = new PrismaClient();
const SAMPLE = '[MẪU]';

async function main() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Không chạy seed dữ liệu mẫu trên production');
  }

  const grade = await prisma.grade.upsert({
    where: { id: '0190f000-0000-7000-8000-000000000003' },
    update: {},
    create: { id: '0190f000-0000-7000-8000-000000000003', name: 'Lớp 3', order: 3 },
  });

  const math = await prisma.subject.upsert({
    where: { gradeId_code: { gradeId: grade.id, code: 'math' } },
    update: {},
    create: { gradeId: grade.id, code: 'math', name: 'Toán', order: 1 },
  });
  await prisma.subject.upsert({
    where: { gradeId_code: { gradeId: grade.id, code: 'vietnamese' } },
    update: {},
    create: { gradeId: grade.id, code: 'vietnamese', name: 'Tiếng Việt', order: 2 },
  });

  const skill = await prisma.skill.upsert({
    where: { subjectId_code: { subjectId: math.id, code: 'mul-table' } },
    update: {},
    create: { subjectId: math.id, code: 'mul-table', name: `${SAMPLE} Bảng nhân` },
  });

  const existingTopic = await prisma.topic.findFirst({
    where: { subjectId: math.id, name: `${SAMPLE} Phép nhân trong bảng` },
  });
  const topic =
    existingTopic ??
    (await prisma.topic.create({
      data: {
        subjectId: math.id,
        name: `${SAMPLE} Phép nhân trong bảng`,
        order: 1,
        status: 'published',
      },
    }));

  const lesson = await prisma.lesson.upsert({
    where: { code: 'SAMPLE-MATH-3-001' },
    update: {},
    create: {
      topicId: topic.id,
      code: 'SAMPLE-MATH-3-001',
      title: `${SAMPLE} Bảng nhân 6`,
      summary: 'Bài học mẫu để kiểm tra giao diện, không phải nội dung thật.',
      body: { steps: [{ kind: 'text', text: '6 x 1 = 6, 6 x 2 = 12, ...' }] },
      estMinutes: 15,
      order: 1,
      status: 'published',
    },
  });

  const existingQuestion = await prisma.question.findFirst({
    where: { subjectId: math.id, prompt: { equals: { text: `${SAMPLE} 6 x 7 = ?` } } },
  });
  const question =
    existingQuestion ??
    (await prisma.question.create({
      data: {
        subjectId: math.id,
        type: 'single',
        prompt: { text: `${SAMPLE} 6 x 7 = ?` },
        options: [
          { id: 'a', text: '36' },
          { id: 'b', text: '42' },
          { id: 'c', text: '48' },
        ],
        answerKey: { optionId: 'b' },
        explanation: { text: '6 x 7 = 42' },
        status: 'published',
        skills: { create: [{ skillId: skill.id }] },
      },
    }));

  const existingAssessment = await prisma.assessment.findFirst({ where: { lessonId: lesson.id } });
  if (!existingAssessment) {
    await prisma.assessment.create({
      data: {
        subjectId: math.id,
        lessonId: lesson.id,
        kind: 'practice',
        title: `${SAMPLE} Luyện tập bảng nhân 6`,
        estMinutes: 5,
        status: 'published',
        items: {
          create: [{ questionId: question.id, questionVersion: question.version, order: 1 }],
        },
      },
    });
  }

  const parentEmail = 'phuhuynh.mau@example.com';
  const parent = await prisma.user.findUnique({ where: { email: parentEmail } });
  if (!parent) {
    const now = new Date();
    const family = await prisma.family.create({
      data: {
        name: `${SAMPLE} Gia đình Nguyễn`,
        trialStartedAt: now,
        trialEndsAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    await prisma.user.create({
      data: {
        familyId: family.id,
        role: 'parent',
        fullName: `${SAMPLE} Phụ huynh`,
        email: parentEmail,
        // Mật khẩu mẫu chỉ dùng ở máy phát triển: MatKhauMau123
        passwordHash: await hash('MatKhauMau123'),
        emailVerifiedAt: now,
      },
    });
    await prisma.student.create({
      data: {
        familyId: family.id,
        displayName: `${SAMPLE} Minh Anh`,
        avatarKey: 'girl-01',
        gradeId: grade.id,
        pinHash: await hash('1234'),
      },
    });
  }

  console.warn('Đã tạo dữ liệu mẫu (có nhãn [MẪU]).');
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
