import type { ProgramEnrollmentRepository } from '../../domain/repositories/ProgramEnrollmentRepository';
import { getPrisma } from '../database/prisma';

export class PrismaProgramEnrollmentRepository implements ProgramEnrollmentRepository {
  async isUserEnrolledInProgram(userId: number, programId: number): Promise<boolean> {
    const prisma = getPrisma();
    const enrollment = await prisma.programEnrollment.findUnique({
      where: {
        userId_programId: {
          userId,
          programId,
        },
      },
      select: {
        id: true,
        status: true,
      },
    });

    return Boolean(enrollment && enrollment.status === 'ACTIVE');
  }
}
