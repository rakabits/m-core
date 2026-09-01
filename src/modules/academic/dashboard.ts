import { prisma } from '@/core/database/prisma';

export async function academicDashboard(input:{academicYearId:string;programId?:string;classId?:string}){
  const classWhere={academicYearId:input.academicYearId,...(input.programId?{programId:input.programId}:{}),...(input.classId?{id:input.classId}:{})};
  const classes=await prisma.academicClass.findMany({where:classWhere,select:{id:true,programId:true}});
  const classIds=classes.map(x=>x.id);
  const [students,attendance,grades,schedules,programs]=await Promise.all([
    prisma.classEnrollment.count({where:{classId:{in:classIds},endedAt:null}}),
    prisma.attendanceRecord.groupBy({by:['status'],where:{session:{classId:{in:classIds}}},_count:{_all:true}}),
    prisma.grade.aggregate({where:{classId:{in:classIds}},_avg:{score:true},_count:{_all:true}}),
    prisma.schedule.count({where:{classId:{in:classIds},status:'ACTIVE'}}),
    prisma.program.count({where:{id:{in:classes.map(x=>x.programId)},isActive:true}}),
  ]);
  const attendanceTotal=attendance.reduce((sum,row)=>sum+row._count._all,0);
  const present=attendance.find(row=>row.status==='PRESENT')?._count._all??0;
  return {students,attendance:{total:attendanceTotal,present,rate:attendanceTotal?Math.round(present/attendanceTotal*10000)/100:0,byStatus:attendance.map(row=>({status:row.status,count:row._count._all}))},grades:{count:grades._count._all,average:grades._avg.score},schedules,activePrograms:programs};
}
