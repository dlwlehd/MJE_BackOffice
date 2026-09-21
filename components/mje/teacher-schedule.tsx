'use client';

import {useState} from 'react';
import {ArrowUp,ArrowDown,GripVertical,Plus,Users,Save,X,ArrowUpRight} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {type DemoData,teacherOrder,validateTeacherOrder,staffNames,saturday,shift,dayDate,iso,dateLabel} from '@/lib/model';
import {DateNav,Pick,ErrorMessage,Status} from './shared';

export default function TeacherSchedule({data,onSave,onOpenMakeup,initialDate}:{data:DemoData;onSave:(date:string,teachers:string[])=>void;onOpenMakeup:(date:string)=>void;initialDate:string}){
 const [date,setDate]=useState(initialDate);
 const [drafts,setDrafts]=useState<Record<string,string[]>>({});
 const [picked,setPicked]=useState('');
 const [dragging,setDragging]=useState<string|null>(null);
 const [error,setError]=useState('');
 const [announcement,setAnnouncement]=useState('');
 const saved=teacherOrder(data,date),teachers=drafts[date]??saved;
 const dirty=JSON.stringify(saved)!==JSON.stringify(teachers);
 const available=staffNames.filter(n=>!teachers.includes(n));
 const d=dayDate(date),first=saturday(iso(new Date(d.getFullYear(),d.getMonth(),1,12)));
 const saturdays=Array.from({length:5},(_,i)=>shift(first,i*7)).filter(s=>s.slice(0,7)===date.slice(0,7));
 const changeDate=(next:string)=>{try{validateTeacherOrder(next,[]);setDate(next);setPicked('');setError('');}catch(e){setError((e as Error).message)}};
 const update=(next:string[])=>{setDrafts(p=>({...p,[date]:next}));setError('');};
 function move(name:string,index:number){const next=teachers.filter(n=>n!==name);next.splice(index,0,name);update(next);setAnnouncement(`${name} 선생님을 ${index+1}번째로 이동했습니다.`);}
 function save(){try{validateTeacherOrder(date,teachers);onSave(date,teachers);setDrafts(p=>{const next={...p};delete next[date];return next;});setError('');setAnnouncement('담당 선생님 순서를 저장했습니다.');}catch(e){setError((e as Error).message)}}
 return <>
  <div className="page-heading"><div><h1>보강 스케줄</h1><p>토요일별 담당 선생님을 정하고, 배치 순서를 조정하세요.</p></div><Button onClick={save} disabled={!dirty}><Save/>스케줄 저장</Button></div>
  <div className="toolbar"><DateNav label={`${date.replaceAll('-','.')} 토요일`} onPrev={()=>changeDate(shift(date,-7))} onNext={()=>changeDate(shift(date,7))} onToday={()=>changeDate(saturday())}/><Input className="date-input" aria-label="스케줄 토요일" type="date" value={date} onChange={e=>changeDate(e.target.value)}/></div>
  <div className="schedule-layout">
   <section className="schedule-editor" aria-label="선생님 순서 배치">
    <div className="schedule-section-title"><div><h2><Users size={18}/>담당 선생님 순서</h2><p>위아래 버튼이나 끌어 놓기로 순서를 바꿀 수 있습니다.</p></div><Status tone={dirty?'warning':'success'}>{dirty?'저장 전':'저장됨'}</Status></div>
    <ol className="teacher-order-list">
     {teachers.map((name,index)=><li key={name} className={`teacher-order-row ${dragging===name?'dragging':''}`} onDragOver={e=>e.preventDefault()} onDrop={e=>{e.preventDefault();if(dragging&&dragging!==name)move(dragging,index);setDragging(null)}}>
      <span className="drag-handle" draggable onDragStart={e=>{setDragging(name);e.dataTransfer.effectAllowed='move';e.dataTransfer.setData('text/plain',name)}} onDragEnd={()=>setDragging(null)} title="끌어서 순서 변경"><GripVertical size={18}/></span>
      <span className="teacher-rank">{index+1}</span><div className="teacher-row-name"><strong>{name} 선생님</strong><span>담당 학생 {new Set(data.makeups.filter(m=>m.date===date&&m.staff===name).map(m=>m.studentId)).size}명</span></div>
      <div className="teacher-order-actions"><Button variant="ghost" size="icon" disabled={index===0} aria-label={`${name} 순서 올리기`} onClick={()=>move(name,index-1)}><ArrowUp/></Button><Button variant="ghost" size="icon" disabled={index===teachers.length-1} aria-label={`${name} 순서 내리기`} onClick={()=>move(name,index+1)}><ArrowDown/></Button><Button variant="ghost" size="icon" aria-label={`${name} 배치에서 제외`} onClick={()=>update(teachers.filter(n=>n!==name))}><X/></Button></div>
     </li>)}
    </ol>
    {!teachers.length&&<div className="schedule-empty"><Users/><p>이 날짜에 배치된 선생님이 없습니다.</p><span>아래에서 담당 선생님을 추가해 주세요.</span></div>}
    <div className="schedule-add"><Pick label="배치할 선생님" value={picked} onChange={setPicked} placeholder={available.length?'선생님 선택':'모든 선생님이 배치되었습니다'} options={available} className="grow"/><Button variant="outline" disabled={!picked||!available.includes(picked)} onClick={()=>{update([...teachers,picked]);setPicked('')}}><Plus/>추가</Button></div>
    <p className="schedule-note">저장한 순서는 해당 날짜의 토요 보강 상단에 반영됩니다. 학생별 담당자와 예약은 그대로 유지됩니다.</p>
    <ErrorMessage message={error}/><div aria-live="polite" className="sr-only">{announcement}</div>
    <div className="schedule-editor-footer"><Button variant="ghost" onClick={()=>{setDrafts(p=>{const next={...p};delete next[date];return next;});setPicked('')}} disabled={!dirty}>변경 취소</Button><Button variant="outline" onClick={()=>onOpenMakeup(date)} disabled={dirty}>토요 보강 보기<ArrowUpRight/></Button><Button onClick={save} disabled={!dirty}>순서 저장</Button></div>
   </section>
   <aside className="schedule-month" aria-label="이달 토요일 배치"><h2>{d.getFullYear()}년 {d.getMonth()+1}월 배치</h2><p>날짜를 선택하면 담당 순서를 수정할 수 있습니다.</p><div className="schedule-date-list">{saturdays.map(s=>{const names=teacherOrder(data,s);const changed=drafts[s]&&JSON.stringify(drafts[s])!==JSON.stringify(names);return <button key={s} className={`schedule-date-item ${date===s?'active':''}`} onClick={()=>changeDate(s)}><div><strong>{dateLabel(s)}</strong>{changed?<Status tone="warning">저장 전</Status>:<span>{names.length}명</span>}</div><p>{names.length?names.join(' → '):'담당 선생님 미배정'}</p></button>})}</div></aside>
  </div>
 </>;
}
