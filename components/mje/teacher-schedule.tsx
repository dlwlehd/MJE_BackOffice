'use client';
import {useState} from 'react';
import {ArrowUp,ArrowDown,Plus,Users,Save,X,ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {type DemoData,dutyTeacher,validateTeacherOrder,saturday,shift,dateLabel} from '@/lib/model';
import {TextField,Pick,ErrorMessage,Status} from './shared';

export default function TeacherSchedule({data,onSave,onOpenMakeup,initialDate,onAddTeacher}:{data:DemoData;onAddTeacher:(name:string)=>void;onSave:(date:string,teachers:string[])=>void;onOpenMakeup:(date:string)=>void;initialDate:string}){
 const rule=[...data.teacherRotations].filter(r=>r.startDate<=initialDate).sort((a,b)=>b.startDate.localeCompare(a.startDate))[0];
 const [date,setDate]=useState(initialDate),[teachers,setTeachers]=useState(rule?.teachers??[...data.teachers]),[picked,setPicked]=useState(''),[error,setError]=useState('');
 const [name,setName]=useState(''),[registrationError,setRegistrationError]=useState('');
 const available=data.teachers.filter(n=>!teachers.includes(n));
 const preview={teacherOverrides:data.teacherOverrides,teacherRotations:[...data.teacherRotations.filter(r=>r.startDate!==date),{startDate:date,teachers}]};
 function move(index:number,to:number){const next=[...teachers];[next[index],next[to]]=[next[to],next[index]];setTeachers(next)}
 function save(){try{validateTeacherOrder(date,teachers,data.teachers);onSave(date,teachers);setError('')}catch(e){setError((e as Error).message)}}
 return <>
  <div className="page-heading"><div><h1>보강 스케줄</h1><p>토요일마다 한 명의 선생님이 담당하고, 정해진 순서대로 매주 교대합니다.</p></div><Button onClick={save}><Save/>로테이션 저장</Button></div>
  <section className="teacher-registration" aria-label="선생님 등록"><div><h2>선생님 등록</h2><p>등록한 선생님은 당일 담당 변경, 로테이션, 학사 일정과 상담에서 선택할 수 있습니다.</p></div><form onSubmit={e=>{e.preventDefault();try{onAddTeacher(name);setName('');setRegistrationError('')}catch(e){setRegistrationError((e as Error).message)}}}><TextField label="새 선생님 이름" value={name} onChange={setName}/><Button type="submit"><Plus/>선생님 등록</Button></form><ErrorMessage message={registrationError}/><div className="registered-teachers">{data.teachers.map(n=><Status key={n}>{n} 선생님</Status>)}</div><p>등록 후 아래 로테이션에 추가하거나, 토요 보강에서 당일 담당으로 지정하세요.</p></section>
  <div className="schedule-layout">
   <section className="schedule-editor" aria-label="주간 로테이션 설정">
    <div className="schedule-section-title"><div><h2><Users size={18}/>교사 로테이션</h2><p>첫 번째 선생님부터 시작해 마지막 순서 후 다시 반복합니다.</p></div></div>
    <TextField label="적용 시작 토요일" type="date" value={date} onChange={setDate}/>
    <ol className="teacher-order-list">
     {teachers.map((name,index)=><li key={name} className="teacher-order-row">
      <span className="teacher-rank">{index+1}</span><div className="teacher-row-name"><strong>{name} 선생님</strong><span>{index+1}주차 담당</span></div>
      <div className="teacher-order-actions"><Button variant="ghost" size="icon" disabled={index===0} aria-label={`${name} 순서 올리기`} onClick={()=>move(index,index-1)}><ArrowUp/></Button><Button variant="ghost" size="icon" disabled={index===teachers.length-1} aria-label={`${name} 순서 내리기`} onClick={()=>move(index,index+1)}><ArrowDown/></Button><Button variant="ghost" size="icon" aria-label={`${name} 로테이션에서 제외`} onClick={()=>setTeachers(teachers.filter(n=>n!==name))}><X/></Button></div>
     </li>)}
    </ol>
    <div className="schedule-add"><Pick label="참여 선생님" value={picked} onChange={setPicked} placeholder={available.length?'선생님 선택':'모든 선생님이 참여합니다'} options={available} className="grow"/><Button variant="outline" disabled={!picked||!available.includes(picked)} onClick={()=>{setTeachers([...teachers,picked]);setPicked('')}}><Plus/>추가</Button></div>
    <p className="schedule-note">시작일 이전의 배정은 유지됩니다. 이후에 이미 저장한 로테이션이 있다면 해당 시작일부터 그 순서가 적용됩니다. 보관된 기록은 변경되지 않습니다.</p>
    <ErrorMessage message={error}/>
    <div className="schedule-editor-footer"><Button variant="outline" onClick={()=>onOpenMakeup(initialDate)}>토요 보강 보기<ArrowUpRight/></Button><Button onClick={save}>로테이션 저장</Button></div>
   </section>
   <aside className="schedule-month" aria-label="주간 담당 미리보기"><h2>앞으로 8주 미리보기</h2><p>저장할 순서를 미리 확인하세요. 하루 담당은 1명입니다.</p><div className="schedule-date-list">{Array.from({length:8},(_,i)=>shift(saturday(/^\d{4}-\d{2}-\d{2}$/.test(date)?date:initialDate),i*7)).map(s=><div key={s} className="schedule-date-item"><div><strong>{dateLabel(s)}</strong><Status tone={data.teacherOverrides[s]?'warning':'reserved'}>{data.teacherOverrides[s]?'당일 변경':'1명 담당'}</Status></div><p>{dutyTeacher(preview,s)||'미배정'} 선생님</p><small>현재 저장: {dutyTeacher(data,s)||'미배정'}</small></div>)}</div></aside>
  </div>
 </>;
}
