import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
  // Criando categorias
  const categories = [];
  for (let i = 0; i < 5; i++) {
    const category = await prisma.category.create({
      data: {
        name: faker.word.words(2), // Gera um nome de categoria fictício
      },
    });
    categories.push(category);
  }

  // Criando usuários (alunos e instrutores)
  const instructors = [];
  const students = [];

  for (let i = 0; i < 10; i++) {
    const instructor = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'instrutor',
      },
    });
    instructors.push(instructor);
  }

  for (let i = 0; i < 30; i++) {
    const student = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        role: 'aluno',
      },
    });
    students.push(student);
  }

  // Criando cursos e associando instrutores e categorias
  const courses = [];
  for (let i = 0; i < 15; i++) {
    const course = await prisma.course.create({
      data: {
        title: faker.lorem.words(),
        description: faker.lorem.sentence(),
        categoryId: categories[Math.floor(Math.random() * categories.length)].id, // Categoria aleatória
      },
    });
    courses.push(course);

    // Associando instrutores aleatórios ao curso
    const courseInstructors = instructors.slice(0, Math.floor(Math.random() * instructors.length) + 1);
    for (const instructor of courseInstructors) {
      await prisma.courseInstructor.create({
        data: {
          userId: instructor.id,
          courseId: course.id,
        },
      });
    }
  }

  // Criando módulos e aulas para cada curso
  for (const course of courses) {
    for (let j = 0; j < 5; j++) {
      const module = await prisma.module.create({
        data: {
          title: `Módulo ${j + 1}: ${faker.lorem.words(1)}`,
          courseId: course.id,
        },
      });

      for (let k = 0; k < 5; k++) {
        await prisma.lesson.create({
          data: {
            title: `Aula ${k + 1}: ${faker.lorem.words(3)}`,
            content: faker.lorem.sentence(),
            moduleId: module.id,
          },
        });
      }
    }
  }

  // Inscrevendo alunos em cursos
  for (const student of students) {
    const randomCourses = courses.slice(0, Math.floor(Math.random() * courses.length) + 1);
    for (const course of randomCourses) {
      await prisma.courseEnrollment.create({
        data: {
          userId: student.id,
          courseId: course.id,
        },
      });
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
