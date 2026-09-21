export type Category = 'exam' | 'vacation' | 'test' | 'event' | 'other';
export type AcademicEvent = { id:string; title:string; category:Category; start:string; end:string; allDay:boolean; startTime:string; endTime:string; school:string; audience:string; staff:string; location:string; note:string; tentative:boolean };
export type Subject = {id:string; name:string; school:string; grade:string; guardian:string; prospect:boolean};
export type Makeup = {id:string; studentId:string; date:string; start:string; end:string; staff:string; kind:'보강'|'정기'; attendance:'미체크'|'출석'|'사유 결석'|'무단 결석'; absenceReason:string; task:string; completed:boolean; result:string; note:string};
export type Consultation = {id:string; subjectId:string; target:string; type:'신규 상담'|'재원생 학부모 상담'|'학생 상담'; staff:string; date:string; start:string; end:string; method:string; topic:string; status:'예약'|'완료'|'취소'|'미방문'; reason:string; content:string; summary:string; agreement:string; followUp:string; due:string; nextDate:string; draft:boolean; previousId:string; origin?:'reservation'|'direct'};
export type Audit = {id:string; at:string; entity:string; action:string; before:unknown; after:unknown};
export type Archive = {id:string; date:string; at:string; sessions:(Makeup & {studentName:string})[]};
export type TeacherRotation = {startDate:string; teachers:string[]};
export type DemoData = {version:1; revision:number; events:AcademicEvent[]; subjects:Subject[]; makeups:Makeup[]; consultations:Consultation[]; archives:Archive[]; audit:Audit[]; teacherSchedules:Record<string,string[]>; teacherRotations:TeacherRotation[]};
export const categoryLabels:Record<Category,string>={exam:'학교 시험',vacation:'학원 방학',test:'Test',event:'학원 행사',other:'기타'};
export const staffNames=['정지민','이수빈','김민서'];
export function today(){return new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul'}).format(new Date());}
export function dayDate(s:string){return new Date(s+'T12:00:00');}
export function iso(d:Date){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function shift(s:string,n:number){const d=dayDate(s); d.setDate(d.getDate()+n);return iso(d);}
export function saturday(s=today()){return shift(s,(6-dayDate(s).getDay()+7)%7);}
export function weekStart(s:string){return shift(s,-((dayDate(s).getDay()+6)%7));}
export function dateLabel(s:string){return dayDate(s).toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'short'});}
export function minutes(s:string){const [h,m]=s.split(':').map(Number);return h*60+m;}
export function overlaps(a:string,b:string,c:string,d:string){return a<d&&c<b;}
export function uid(){return crypto.randomUUID();}
export function validDate(s:string){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(dayDate(s).getTime())&&iso(dayDate(s))===s;}
export function validateEvent(e:AcademicEvent){if(!e.title.trim())throw Error('일정 제목을 입력해 주세요.');if(!validDate(e.start)||!validDate(e.end)||e.end<e.start)throw Error('종료일은 시작일 이후로 선택해 주세요.');if(!e.allDay && (e.start===e.end&&e.startTime>=e.endTime || !e.startTime || !e.endTime))throw Error('종료 시각은 시작 시각보다 늦어야 합니다.');}
export function validateMakeup(m:Makeup,all:Makeup[]){if(!m.studentId)throw Error('학생을 선택해 주세요.');if(m.date&&(!validDate(m.date)||dayDate(m.date).getDay()!==6))throw Error('보강은 토요일에만 예약할 수 있습니다.');if(!/^\d{2}:(00|30)$/.test(m.start)||!/^\d{2}:(00|30)$/.test(m.end)||m.start<'10:00'||m.end>'14:00'||m.start>=m.end||minutes(m.start)%30||minutes(m.end)%30)throw Error('10:00~14:00 안에서 30분 단위로 선택해 주세요.');if(m.attendance==='사유 결석'&&!m.absenceReason.trim())throw Error('결석 사유를 입력해 주세요.');if(m.completed&&!m.result.trim())throw Error('완료하려면 진행 내용과 결과를 남겨 주세요.');if(m.date&&all.some(x=>x.id!==m.id&&x.studentId===m.studentId&&x.date===m.date&&overlaps(x.start,x.end,m.start,m.end)))throw Error('해당 학생의 보강 시간이 기존 예약과 겹칩니다.');}
export function validateConsultation(c:Consultation,all:Consultation[]){if(!c.subjectId||!c.target.trim())throw Error('관련 학생과 상담 대상자를 입력해 주세요.');if(!validDate(c.date)||!c.start||!c.end||c.start>=c.end)throw Error('상담 날짜와 시작·종료 시각을 확인해 주세요.');if(['취소','미방문'].includes(c.status)&&!c.reason.trim())throw Error('취소 또는 미방문 사유를 남겨 주세요.');if(c.status==='완료'&&!c.summary.trim())throw Error('기록 완료 전 결과 요약을 입력해 주세요.');if(c.origin!=='direct'&&c.status!=='취소'&&all.some(x=>x.id!==c.id&&x.origin!=='direct'&&x.status!=='취소'&&x.staff===c.staff&&x.date===c.date&&overlaps(x.start,x.end,c.start,c.end)))throw Error('같은 상담자의 예약 시간이 겹칩니다. 다른 시간으로 선택해 주세요.');}
export function blankEvent(date=today()):AcademicEvent{return {id:uid(),title:'',category:'event',start:date,end:date,allDay:true,startTime:'14:00',endTime:'15:00',school:'',audience:'',staff:'',location:'',note:'',tentative:false};}
export function blankMakeup(date=saturday()):Makeup{return {id:uid(),studentId:'',date,start:'10:00',end:'11:00',staff:staffNames[0],kind:'보강',attendance:'미체크',absenceReason:'',task:'',completed:false,result:'',note:''};}
export function blankConsultation(date=today()):Consultation{return {id:uid(),subjectId:'',target:'',type:'재원생 학부모 상담',staff:staffNames[0],date,start:'15:00',end:'15:30',method:'방문',topic:'',status:'예약',reason:'',content:'',summary:'',agreement:'',followUp:'',due:'',nextDate:'',draft:true,previousId:''};}
export function makeSeed():DemoData{
 const t=today(),y=t.slice(0,4),month=t.slice(0,7),sat=saturday(t),mon=weekStart(t);
 const subjects:Subject[]=[{id:'s1',name:'박은서',school:'매탄중',grade:'2학년',guardian:'박은서 보호자',prospect:false},{id:'s2',name:'최도현',school:'매탄중',grade:'2학년',guardian:'최도현 보호자',prospect:false},{id:'s3',name:'서하린',school:'매탄중',grade:'1학년',guardian:'서하린 보호자',prospect:false},{id:'s4',name:'윤지안',school:'원천중',grade:'1학년',guardian:'윤지안 보호자',prospect:false},{id:'s5',name:'김민준',school:'매원중',grade:'3학년',guardian:'김민준 보호자',prospect:false},{id:'s6',name:'이서윤',school:'원천중',grade:'2학년',guardian:'이서윤 보호자',prospect:false},{id:'s7',name:'윤서하',school:'',grade:'예비 중1',guardian:'윤서하 보호자',prospect:true},{id:'s8',name:'임지호',school:'',grade:'중1',guardian:'임지호 보호자',prospect:true}];
 const event=(id:string,title:string,category:Category,start:string,end=start,extra:Partial<AcademicEvent>={}):AcademicEvent=>({...blankEvent(start),id,title,category,end,...extra});
 const events=[event('e1','매탄중 중간고사','exam',month+'-14',month+'-16',{school:'매탄중',audience:'2·3학년',note:'시험 기간 집중 학습 계획을 확인해 주세요.'}),event('e2','엠제이 방학','vacation',month+'-25',month+'-27',{note:'학원 전체 휴무 예시입니다.'}),event('e3','레벨 Test','test',month+'-07',month+'-07',{allDay:false,startTime:'15:00',endTime:'16:00'}),event('e4','레벨 Test','test',month+'-19',month+'-19',{allDay:false,startTime:'16:30',endTime:'17:30'}),event('e5','월말 Test','test',month+'-28',month+'-28',{allDay:false,startTime:'16:00',endTime:'17:00'}),event('e6','학부모 설명회','event',t,t,{allDay:false,startTime:'14:00',endTime:'15:00',location:'엠제이 세미나실'}),event('e7','신학기 안내','event',t,t,{allDay:false,startTime:'16:00',endTime:'17:00'}),event('e8','겨울 학습 계획','event',y+'-12-21',y+'-12-21',{tentative:true}),event('e9','겨울방학 특강','event',y+'-01-05',y+'-01-30'),event('e10','새 학기 레벨 Test','test',y+'-03-02'),event('e11','매탄중 기말고사','exam',y+'-07-06',y+'-07-08',{school:'매탄중'}),event('e12','여름 방학','vacation',y+'-08-03',y+'-08-07')];
 const makeups:Makeup[]=subjects.slice(0,6).map((s,i)=>({...blankMakeup(sat),id:'m'+i,studentId:s.id,start:i<3?'10:00':'11:00',end:i===0?'12:30':i<3?'12:00':'13:00',staff:staffNames[0],kind:i===1?'정기':'보강',attendance:i>1?'출석':'미체크',task:['독해 오답 정리','문법 4단원 복습','단어 테스트'][i%3],completed:i===5,result:i===5?'오답 정리와 단어 테스트를 완료했습니다.':'',note:i===0?'독해 지문 2개 추가 연습':''}));
 const consultations:Consultation[]=[{...blankConsultation(mon),id:'c1',subjectId:'s7',target:'윤서하 보호자',type:'신규 상담',staff:'이수빈',start:'14:00',end:'14:30',topic:'입학 상담 및 레벨 테스트 안내'},{...blankConsultation(mon),id:'c2',subjectId:'s1',target:'박은서 보호자',topic:'중간고사 학습 방향'},{...blankConsultation(mon),id:'c3',subjectId:'s2',target:'최도현',type:'학생 상담',staff:'이수빈',start:'16:00',end:'16:20',topic:'독해 학습 습관 점검'},{...blankConsultation(shift(mon,2)),id:'c4',subjectId:'s3',target:'서하린 보호자',topic:'학습 적응 현황',staff:'김민서'},{...blankConsultation(shift(mon,3)),id:'c5',subjectId:'s8',target:'임지호 보호자',type:'신규 상담',staff:'이수빈',status:'취소',reason:'보호자 일정 변경',topic:'신규 입학 안내'},{...blankConsultation(shift(mon,-28)),id:'c6',subjectId:'s1',target:'박은서 보호자',status:'완료',draft:false,content:'독해 속도와 가정 학습 습관을 함께 점검했습니다.',summary:'매일 20분 독해 연습과 주 3회 단어 복습에 합의했습니다.',agreement:'가정에서 학습 시간을 기록합니다.',followUp:'다음 상담에서 학습 기록 확인',due:mon,topic:'학습 습관 상담'}];
 return {version:1,revision:0,events,subjects,makeups,consultations,archives:[],audit:[],teacherSchedules:{},teacherRotations:[{startDate:sat,teachers:[...staffNames]}]};
}


// Rules apply from their start date; later rules preserve earlier weekly assignments.
export function dutyTeacher(data:Pick<DemoData,'teacherRotations'>,date:string):string{
 if(!validDate(date)||dayDate(date).getDay()!==6)return '';
 const rule=[...data.teacherRotations].filter(r=>r.startDate<=date).sort((a,b)=>b.startDate.localeCompare(a.startDate))[0];
 if(!rule?.teachers.length)return '';
 const weeks=Math.floor((Date.parse(date+'T00:00:00Z')-Date.parse(rule.startDate+'T00:00:00Z'))/604800000);
 return rule.teachers[weeks%rule.teachers.length];
}
export function migrateDemo(value:DemoData):DemoData{
 if(value.teacherRotations)return value;
 const legacy=Object.entries(value.teacherSchedules??{}).filter(([date,names])=>validDate(date)&&dayDate(date).getDay()===6&&names.length).sort(([a],[b])=>a.localeCompare(b));
 const startDate=legacy[0]?.[0]||value.makeups.map(m=>m.date).filter(d=>validDate(d)&&dayDate(d).getDay()===6).sort()[0]||saturday();
 const teachers=legacy[0]?.[1].filter(n=>staffNames.includes(n))||staffNames;
 return {...value,teacherSchedules:value.teacherSchedules??{},teacherRotations:[{startDate,teachers:teachers.length?[...new Set(teachers)]:[...staffNames]}]};
}
export function validateTeacherOrder(date:string,teachers:string[]){
 if(!validDate(date)||dayDate(date).getDay()!==6)throw Error('보강 스케줄은 토요일만 선택할 수 있습니다.');
 if(!teachers.length)throw Error('로테이션에 참여할 선생님을 한 명 이상 선택해 주세요.');
 if(new Set(teachers).size!==teachers.length||teachers.some(n=>!staffNames.includes(n)))throw Error('담당 선생님을 중복 없이 선택해 주세요.');
}
export function consultationState(c:Consultation,now=Date.now()){
 if(c.status==='완료')return {label:'기록 완료',tone:'success'};
 if(c.status==='취소')return {label:'취소',tone:'cancelled'};
 if(c.status==='미방문')return {label:'미방문',tone:'destructive'};
 if(c.origin==='direct')return {label:'작성 중',tone:'warning'};
 if(new Date(c.date+'T'+c.end+':00+09:00').getTime()<now)return {label:'결과 미기록',tone:'warning'};
 return {label:'예약',tone:'reserved'};
}
