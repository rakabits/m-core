import { prisma } from '@/core/database/prisma';
import { Prisma } from '@prisma/client';

const jsonValue = (value: unknown) => value == null ? undefined : value as Prisma.InputJsonValue;

export async function listAcademicYears(){return prisma.academicYear.findMany({orderBy:{code:'desc'}})}
export async function createAcademicYear(input:{code:string;label:string;startDate:Date;endDate:Date;isActive?:boolean},actorId:string){return prisma.$transaction(async tx=>{const row=await tx.academicYear.create({data:{...input,code:input.code.trim(),label:input.label.trim()}});await tx.auditLog.create({data:{actorId,action:'academic_year.create',resource:'academic_year',resourceId:row.id,changes:input}});return row})}
export async function updateAcademicYear(id:string,input:Partial<{code:string;label:string;startDate:Date;endDate:Date;isActive:boolean}>,actorId:string){return prisma.$transaction(async tx=>{const row=await tx.academicYear.update({where:{id},data:{...input,code:input.code?.trim(),label:input.label?.trim()}});await tx.auditLog.create({data:{actorId,action:'academic_year.update',resource:'academic_year',resourceId:id,changes:input}});return row})}
export async function listClasses(){return prisma.academicClass.findMany({include:{program:true,academicYear:true},orderBy:[{academicYear:{code:'desc'}},{name:'asc'}]})}
export async function createClass(input:{programId:string;academicYearId:string;code:string;name:string;capacity?:number|null;isActive?:boolean},actorId:string){return prisma.$transaction(async tx=>{const row=await tx.academicClass.create({data:{...input,code:input.code.trim().toUpperCase(),name:input.name.trim()}});await tx.auditLog.create({data:{actorId,action:'class.create',resource:'academic_class',resourceId:row.id,changes:input}});return row})}
export async function updateClass(id:string,input:Partial<{code:string;name:string;capacity:number|null;isActive:boolean}>,actorId:string){return prisma.$transaction(async tx=>{const row=await tx.academicClass.update({where:{id},data:{...input,code:input.code?.trim().toUpperCase(),name:input.name?.trim()}});await tx.auditLog.create({data:{actorId,action:'class.update',resource:'academic_class',resourceId:id,changes:input}});return row})}
export async function listSubjects(){return prisma.subject.findMany({orderBy:{name:'asc'}})}
export async function createSubject(input:{code:string;name:string;description?:string|null;isActive?:boolean},actorId:string){return prisma.$transaction(async tx=>{const row=await tx.subject.create({data:{...input,code:input.code.trim().toUpperCase(),name:input.name.trim()}});await tx.auditLog.create({data:{actorId,action:'subject.create',resource:'subject',resourceId:row.id,changes:input}});return row})}
export async function updateSubject(id:string,input:Partial<{code:string;name:string;description:string|null;isActive:boolean}>,actorId:string){return prisma.$transaction(async tx=>{const row=await tx.subject.update({where:{id},data:{...input,code:input.code?.trim().toUpperCase(),name:input.name?.trim()}});await tx.auditLog.create({data:{actorId,action:'subject.update',resource:'subject',resourceId:id,changes:input}});return row})}
export async function listTeachers(){return prisma.teacher.findMany({orderBy:{displayName:'asc'}})}
export async function createTeacher(input:{userProfileId?:string|null;employeeCode?:string|null;displayName:string;isActive?:boolean;profile?:Record<string,unknown>|null;address?:Record<string,unknown>|null;employment?:Record<string,unknown>[]|null;education?:Record<string,unknown>[]|null;spouse?:Record<string,unknown>|null;family?:Record<string,unknown>|null;documents?:Record<string,unknown>[]|null},actorId:string){return prisma.$transaction(async tx=>{const row=await tx.teacher.create({data:{userProfileId:input.userProfileId,employeeCode:input.employeeCode?.trim()||null,displayName:input.displayName.trim(),isActive:input.isActive??true,profile:jsonValue(input.profile),address:jsonValue(input.address),employment:jsonValue(input.employment),education:jsonValue(input.education),spouse:jsonValue(input.spouse),family:jsonValue(input.family),documents:jsonValue(input.documents)}});await tx.auditLog.create({data:{actorId,action:'teacher.create',resource:'teacher',resourceId:row.id,changes:jsonValue(input)}});return row})}
export async function updateTeacher(id:string,input:Partial<{employeeCode:string|null;displayName:string;isActive:boolean}>,actorId:string){return prisma.$transaction(async tx=>{const row=await tx.teacher.update({where:{id},data:{...input,employeeCode:input.employeeCode?.trim()||null,displayName:input.displayName?.trim()}});await tx.auditLog.create({data:{actorId,action:'teacher.update',resource:'teacher',resourceId:id,changes:input}});return row})}

type AcademicMasterLevel = 'JUNIOR_HIGH' | 'SENIOR_HIGH';

type AcademicLevelConfig = {
  names: readonly string[];
  patterns: readonly string[];
  fallback: { programCode: string; programName: string; educationLevel: string };
};

const academicLevelConfig: Record<AcademicMasterLevel, AcademicLevelConfig> = {
  JUNIOR_HIGH: {
    names: ['7', '8', '9'],
    patterns: ['MTS', 'SMP', 'JUNIOR', 'TSANAWIYAH'],
    fallback: { programCode: 'ACADEMIC-JUNIOR-HIGH', programName: 'Academic Master Junior High', educationLevel: 'Junior High' },
  },
  SENIOR_HIGH: {
    names: ['10', '11', '12'],
    patterns: ['MA', 'SMA', 'SENIOR', 'ALIYAH'],
    fallback: { programCode: 'ACADEMIC-SENIOR-HIGH', programName: 'Academic Master Senior High', educationLevel: 'Senior High' },
  },
};

const levelNames = { JUNIOR_HIGH: ['7', '8', '9'], SENIOR_HIGH: ['10', '11', '12'] } as const;

function normalizeClassName(value: string) {
  return value.trim().replace(/^kelas\\s+/i, '').replace(/\\s+/g, ' ');
}

async function resolveAcademicPrograms(tx: Prisma.TransactionClient, level: AcademicMasterLevel) {
  const config = academicLevelConfig[level];
  const fallbackExisting = await tx.program.findUnique({ where: { programCode: config.fallback.programCode } });
  if (fallbackExisting) {
    const owner = fallbackExisting.academicLevel === level || !fallbackExisting.academicLevel
      ? await tx.program.update({ where: { id: fallbackExisting.id }, data: { academicLevel: level, isActive: true } })
      : null;
    if (owner) return [owner];
  }

  const programs = await tx.program.findMany({ where: { academicLevel: level, isActive: true }, orderBy: { programName: 'asc' } });
  if (programs.length) return [programs[0]];

  const legacy = await tx.program.findMany({ where: { academicLevel: null, isActive: true }, orderBy: { programName: 'asc' } });
  const matches = legacy.filter(program => config.patterns.some(pattern => `${program.programCode} ${program.programName} ${program.educationLevel || ''}`.toUpperCase().includes(pattern)));
  if (matches.length === 1) {
    const owner = await tx.program.update({ where: { id: matches[0].id }, data: { academicLevel: level } });
    return [owner];
  }

  const program = await tx.program.create({ data: { ...config.fallback, academicLevel: level, isActive: true } });
  return [program];
}

async function loadAcademicMasterLevel(level: AcademicMasterLevel) {
  const [years, programs, classes, histories] = await Promise.all([
    prisma.academicYear.findMany({ orderBy: { code: 'desc' } }),
    prisma.program.findMany({ where: { academicLevel: level, isActive: true }, orderBy: { programName: 'asc' } }),
    prisma.academicClass.findMany({ where: { isActive: true, program: { academicLevel: level } }, include: { program: true, academicYear: true }, orderBy: { name: 'asc' } }),
    prisma.academicMasterHistory.findMany({ where: { academicLevel: level }, include: { academicYear: true }, orderBy: { createdAt: 'desc' } }),
  ]);
  return { years, programs, classes, histories, defaultNames: academicLevelConfig[level].names };
}

export async function getAcademicMaster() {
  const [junior, senior, countries] = await Promise.all([
    loadAcademicMasterLevel('JUNIOR_HIGH'),
    loadAcademicMasterLevel('SENIOR_HIGH'),
    prisma.preUniversityCountry.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
  ]);
  const card = (level: AcademicMasterLevel, source: Awaited<ReturnType<typeof loadAcademicMasterLevel>>) => {
    const latestHistory = source.histories[0];
    const academicYear = latestHistory?.academicYear || source.classes.map(item => item.academicYear).sort((a, b) => b.code.localeCompare(a.code))[0] || source.years[0] || null;
    const yearClasses = source.classes.filter(item => item.academicYearId === academicYear?.id);
    return {
      level,
      academicYear,
      classes: levelNames[level].map(name => ({
        name,
        rombelCount: yearClasses.filter(item => normalizeClassName(item.name) === normalizeClassName(name)).length,
      })),
    };
  };
  return { juniorHigh: card('JUNIOR_HIGH', junior), seniorHigh: card('SENIOR_HIGH', senior), preUniversity: { countries } };
}

export async function listAcademicMasterHistory(level: AcademicMasterLevel) { return prisma.academicMasterHistory.findMany({ where: { academicLevel: level }, include: { academicYear: true }, orderBy: { createdAt: 'desc' } }); }
export async function saveAcademicMasterSnapshot(level: AcademicMasterLevel, actorId: string, snapshot: unknown, academicYearId?: string) { return prisma.academicMasterHistory.create({ data: { academicLevel: level, actorId, academicYearId, snapshot: jsonValue(snapshot)! } }); }
export async function listCountries() { return prisma.preUniversityCountry.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }); }
export async function createCountry(name: string, actorId: string) { return prisma.$transaction(async tx => { const row = await tx.preUniversityCountry.create({ data: { name: name.trim() } }); const profile = await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } }); await tx.auditLog.create({ data: { actorId: profile?.id, action: 'pre_university_country.create', resource: 'pre_university_country', resourceId: row.id, changes: { name: name.trim() } } }); return row; }); }

export async function loadAcademicMasterEditor(level: AcademicMasterLevel) { return loadAcademicMasterLevel(level); }

export async function saveAcademicMasterEditor(input: { level: AcademicMasterLevel; academicYearId?: string | null; newAcademicYear?: { code: string; label: string; startDate: Date; endDate: Date }; classes: { name: string; rombelCount: number }[] }, actorId: string) {
  return prisma.$transaction(async tx => {
    const profile = await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } });
    const auditActorId = profile?.id;
    const level = input.level;
    let year = input.academicYearId ? await tx.academicYear.findUniqueOrThrow({ where: { id: input.academicYearId } }) : null;
    if (input.newAcademicYear) year = await tx.academicYear.create({ data: { ...input.newAcademicYear, isActive: true } });
    if (!year) throw new Error('ACADEMIC_YEAR_REQUIRED');

    const programs = await resolveAcademicPrograms(tx, level);
    const programIds = programs.map(program => program.id);
    const existing = await tx.academicClass.findMany({ where: { academicYearId: year.id, programId: { in: programIds }, program: { academicLevel: level } }, orderBy: { code: 'asc' } });
    const created = [] as unknown[];
    for (const item of input.classes) {
      const current = existing.filter(row => row.name === item.name);
      for (let i = current.length; i < item.rombelCount; i++) created.push(await tx.academicClass.create({ data: { programId: programIds[0], academicYearId: year.id, name: item.name.trim(), code: `${item.name.trim().toUpperCase().replace(/\\s+/g, '-')}-${i + 1}`, isActive: true } }));
      if (current.length > item.rombelCount) await tx.academicClass.updateMany({ where: { id: { in: current.slice(item.rombelCount).map(row => row.id), }, program: { academicLevel: level } }, data: { isActive: false } });
    }
    const snapshot = { level, academicYear: year, classes: input.classes };
    await tx.academicMasterHistory.create({ data: { academicLevel: level, academicYearId: year.id, actorId: auditActorId, snapshot: jsonValue(snapshot)! } });
    await tx.auditLog.create({ data: { actorId: auditActorId, action: 'academic_master.update', resource: 'academic_master', resourceId: year.id, changes: jsonValue(snapshot)! } });
    return { year, classes: created };
  });
}

export async function resetAcademicMasterSafely(actorId: string) {
  return prisma.$transaction(async tx => {
    const profiles = await tx.userProfile.findUnique({ where: { authId: actorId }, select: { id: true } });
    const programs = await tx.program.findMany({ where: { academicLevel: { in: ['JUNIOR_HIGH', 'SENIOR_HIGH'] } }, select: { id: true, programCode: true, academicLevel: true } });
    const classes = await tx.academicClass.findMany({ where: { programId: { in: programs.map(program => program.id) } }, select: { id: true, programId: true, academicYearId: true } });
    const protectedIds = new Set<string>();
    for (const item of classes) {
      const [enrollments, schedules, attendance, grades, teachers] = await Promise.all([
        tx.classEnrollment.count({ where: { classId: item.id } }),
        tx.schedule.count({ where: { classId: item.id } }),
        tx.attendanceSession.count({ where: { classId: item.id } }),
        tx.grade.count({ where: { classId: item.id } }),
        tx.teacher.count({ where: { classes: { some: { id: item.id } } } }),
      ]);
      if (enrollments || schedules || attendance || grades || teachers) protectedIds.add(item.id);
    }
    const removableIds = classes.filter(item => !protectedIds.has(item.id)).map(item => item.id);
    const deactivatedClasses = removableIds.length ? (await tx.academicClass.updateMany({ where: { id: { in: removableIds } }, data: { isActive: false } })).count : 0;
    const activeClassesByProgram = await tx.academicClass.groupBy({ by: ['programId'], where: { isActive: true, programId: { in: programs.map(program => program.id) } }, _count: { id: true } });
    const activeProgramIds = new Set(activeClassesByProgram.map(row => row.programId));
    const deactivatedPrograms = (await tx.program.updateMany({ where: { id: { in: programs.map(program => program.id).filter(id => !activeProgramIds.has(id)) } }, data: { isActive: false } })).count;
    const years = [...new Set(classes.map(item => item.academicYearId))];
    const activeYears = await tx.academicClass.findMany({ where: { isActive: true, academicYearId: { in: years } }, select: { academicYearId: true } });
    const activeYearIds = new Set(activeYears.map(item => item.academicYearId));
    const deactivatedYears = (await tx.academicYear.updateMany({ where: { id: { in: years.filter(id => !activeYearIds.has(id)) } }, data: { isActive: false } })).count;
    const histories = (await tx.academicMasterHistory.deleteMany({ where: { academicLevel: { in: ['JUNIOR_HIGH', 'SENIOR_HIGH'] }, academicYearId: { in: years } } })).count;
    const result = { deactivatedClasses, protectedClasses: protectedIds.size, deactivatedPrograms, deactivatedYears, historiesDeleted: histories };
    await tx.auditLog.create({ data: { actorId: profiles?.id, action: 'academic_master.safe_reset', resource: 'academic_master', resourceId: 'JUNIOR_HIGH,SENIOR_HIGH', changes: result } });
    return result;
  });
}
