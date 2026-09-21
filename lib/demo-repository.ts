import {type DemoData,makeSeed} from './model';
// Demo-only adapter. Replace these functions with authenticated API calls when connecting a real DB.
export const STORAGE_KEY='mje-academy-demo-v1';
export function loadDemo():DemoData {const raw=localStorage.getItem(STORAGE_KEY);if(!raw)return makeSeed();const value=JSON.parse(raw);if(value.version!==1||!['events','subjects','makeups','consultations','archives','audit'].every(k=>Array.isArray(value[k])))throw Error('저장된 데모 데이터를 읽을 수 없습니다. 데모 초기화로 다시 시작할 수 있습니다.');return value;}
export function saveDemo(data:DemoData){const current=localStorage.getItem(STORAGE_KEY);if(current&&JSON.parse(current).revision>data.revision)throw Error('다른 탭에서 내용이 바뀌었습니다. 새로고침 후 다시 저장해 주세요.');const next={...data,revision:data.revision+1};localStorage.setItem(STORAGE_KEY,JSON.stringify(next));return next;}
export function resetDemo(){const data=makeSeed();localStorage.setItem(STORAGE_KEY,JSON.stringify(data));return data;}
