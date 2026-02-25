export interface ProgramEnrollmentRepository {
  isUserEnrolledInProgram(userId: number, programId: number): Promise<boolean>;
}
