import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Plus, Clock, MapPin, Users, Link as LinkIcon, Trash2 } from 'lucide-react'

const toLocalISO = (d) => {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60 * 1000);
  return local.toISOString().slice(0, 16);
};
const fromLocalISO = (iso) => new Date(iso);
const formatTime = (d) => new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(d);
const formatDate = (d) => new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(d);
const monthLabel = (d) => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(d);

const LS_KEY = 'impettus-meetings-v3';
const saveMeetings = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));
const loadMeetings = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };

const LOCATIONS = ['Sala de Reunião 1.0','Sala de Reunião 2.0','Sala de Reunião 3.0','Sala de Reunião 4.0','Presencial','Auditória','Online'];

function useMonthGrid(activeDate) {
  return useMemo(() => {
    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // seg=0
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ date: new Date(year, month, 1 - (startWeekday - i)), outside: true });
    for (let day = 1; day <= daysInMonth; day++) cells.push({ date: new Date(year, month, day), outside: false });
    while (cells.length < 42) {
      const last = cells[cells.length - 1].date;
      const d = new Date(last); d.setDate(d.getDate() + 1);
      cells.push({ date: d, outside: true });
    }
    return cells;
  }, [activeDate]);
}

export default function App() {
  const [meetings, setMeetings] = useState(loadMeetings());
  const [query, setQuery] = useState('');
  const [month, setMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => saveMeetings(meetings), [meetings]);

  const monthCells = useMonthGrid(month);

  const meetingsByDay = useMemo(() => {
    const map = new Map();
    meetings.forEach((m) => {
      const key = new Date(m.start).toDateString();
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(m);
    });
    return map;
  }, [meetings]);

  const dayMeetings = useMemo(() => {
    const key = selectedDate.toDateString();
    let list = meetingsByDay.get(key) || [];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((m) =>
        m.title.toLowerCase().includes(q) ||
        (m.description || '').toLowerCase().includes(q) ||
        (m.location || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => new Date(a.start) - new Date(b.start));
  }, [meetingsByDay, selectedDate, query]);

  function addMeeting(m) {
    const conflict = meetings.some((ev) => {
      const sameDay = new Date(ev.start).toDateString() === new Date(m.start).toDateString();
      return sameDay && ev.start < m.end && m.start < ev.end;
    });
    if (conflict) { alert('Horário indisponível: já existe uma reunião marcada neste período.'); return; }
    setMeetings((prev) => [...prev, { ...m, id: crypto.randomUUID() }]);
  }
  function deleteMeeting(id) { setMeetings((prev) => prev.filter((m) => m.id !== id)); }

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(#fff,#f1f5f9)', color:'#0f172a'}}>
      <header style={{position:'sticky',top:0, background:'rgba(255,255,255,.7)', borderBottom:'1px solid #e2e8f0', backdropFilter:'blur(6px)'}}>
        <div style={{maxWidth:1080, margin:'0 auto', padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <CalendarDays size={22} /><h1 style={{fontSize:18, margin:0}}>Agenda de Reuniões</h1>
          </div>
          <button className="btn" onClick={() => setOpen(true)} style={{display:'inline-flex',alignItems:'center',gap:8,height:36,padding:'0 12px',border:'1px solid #e2e8f0',borderRadius:10,background:'#111827',color:'#fff',cursor:'pointer'}}><Plus size={16}/> Agendar Reunião</button>
        </div>
      </header>

      <main style={{maxWidth:1080, margin:'0 auto', padding:'16px'}}>
        <div style={{display:'grid', gridTemplateColumns:'2fr 1fr', gap:16}}>
          <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:16}}>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #e2e8f0', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
              <div>{monthLabel(month)}</div>
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()-1, 1))}>Anterior</button>
                <button onClick={() => setMonth(new Date())}>Hoje</button>
                <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth()+1, 1))}>Próximo</button>
              </div>
            </div>
            <div style={{padding:'12px 16px'}}>
              <div style={{display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:6, marginBottom:8, color:'#64748b', fontSize:12}}>
                {['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'].map(d => <div key={d} style={{textAlign:'center'}}>{d}</div>)}
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:6}}>
                {monthCells.map(({ date, outside }, idx) => {
                  const isSelected = selectedDate.toDateString() === date.toDateString();
                  const isToday = new Date().toDateString() === date.toDateString();
                  const list = meetingsByDay.get(date.toDateString()) || [];
                  return (
                    <motion.button key={idx} whileHover={{scale:1.01}} whileTap={{scale:0.99}}
                      onClick={() => setSelectedDate(date)}
                      style={{height:96,padding:8,border:'1px solid #e2e8f0',borderRadius:14,background:'#fff',display:'flex',flexDirection:'column',opacity:outside?0.4:1, outline:isSelected?'2px solid #0f172a':'none'}}
                    >
                      <div style={{display:'flex', justifyContent:'space-between', fontSize:12}}>
                        <span style={{fontWeight: isToday ? 700 : 500}}>{date.getDate()}</span>
                        {list.length>0 && <span style={{fontSize:10, background:'#0ea5e9',color:'#fff',padding:'1px 6px',borderRadius:999}}>{list.length}</span>}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
              <div style={{marginTop:16}}>
                <button onClick={() => setOpen(true)} style={{display:'inline-flex',alignItems:'center',gap:8,height:36,padding:'0 12px',border:'1px solid #e2e8f0',borderRadius:10,background:'#111827',color:'#fff',cursor:'pointer'}}><Plus size={16}/> Agendar Reunião</button>
              </div>
            </div>
          </div>

          <div style={{background:'#fff', border:'1px solid #e2e8f0', borderRadius:16}}>
            <div style={{padding:'12px 16px', borderBottom:'1px solid #e2e8f0'}}>{formatDate(selectedDate)} — Reuniões</div>
            <div style={{padding:'12px 16px'}}>
              <input placeholder="Buscar" value={query} onChange={(e)=>setQuery(e.target.value)} style={{width:'100%',height:36,padding:'0 10px',border:'1px solid #e2e8f0',borderRadius:10}}/>
              {dayMeetings.length===0? <p style={{color:'#64748b',marginTop:12,fontSize:14}}>Sem reuniões.</p> : (
                <div style={{display:'grid', gap:10, marginTop:12}}>
                  {dayMeetings.map(m => (
                    <div key={m.id} style={{border:'1px solid #e2e8f0', borderRadius:12, padding:10}}>
                      <div style={{fontWeight:600}}>{m.title}</div>
                      <div style={{display:'flex',alignItems:'center',gap:6,color:'#64748b',fontSize:14}}><Clock size={16}/> {formatTime(new Date(m.start))}–{formatTime(new Date(m.end))}</div>
                      <div style={{display:'flex',alignItems:'center',gap:6,color:'#64748b',fontSize:14}}><MapPin size={16}/> {m.location}</div>
                      {m.participants?.length>0 && <div style={{display:'flex',alignItems:'center',gap:6,color:'#64748b',fontSize:14}}><Users size={16}/> {m.participants.join(', ')}</div>}
                      {m.onlineLink && <div style={{display:'flex',alignItems:'center',gap:6,color:'#2563eb',fontSize:14}}><LinkIcon size={16}/><a href={m.onlineLink} target="_blank" rel="noreferrer">Acessar reunião</a></div>}
                      {m.description && <p style={{marginTop:6}}>{m.description}</p>}
                      <div style={{marginTop:8}}>
                        <button onClick={()=>deleteMeeting(m.id)} style={{display:'inline-flex',alignItems:'center',gap:6,height:32,padding:'0 10px',border:'1px solid #e2e8f0',borderRadius:10,background:'#fff',cursor:'pointer'}}><Trash2 size={16}/> Excluir</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <ScheduleDialog open={open} onClose={() => setOpen(false)} onSave={(m)=>{addMeeting(m); setOpen(false);}} />
    </div>
  )
}

function ScheduleDialog({ open, onClose, onSave }) {
  const now = new Date();
  const defaultStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours()+1, 0, 0);
  const defaultEnd = new Date(defaultStart.getTime() + 60*60*1000);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toLocalISO(defaultStart).slice(0,10));
  const [startTime, setStartTime] = useState(toLocalISO(defaultStart).slice(11));
  const [endTime, setEndTime] = useState(toLocalISO(defaultEnd).slice(11));
  const [duration, setDuration] = useState(60);
  const [description, setDescription] = useState('');
  const [emails, setEmails] = useState('');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [onlineMode, setOnlineMode] = useState(''); // 'teams' | 'manual' | ''
  const [manualLink, setManualLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    const dlg = document.getElementById('schedule-dialog');
    if (dlg && typeof dlg.showModal === 'function') dlg.showModal();
  }, [open]);

  useEffect(() => {
    const s = new Date(`${date}T${startTime}:00`);
    const e = new Date(s.getTime() + duration*60000);
    setEndTime(`${String(e.getHours()).padStart(2,'0')}:${String(e.getMinutes()).padStart(2,'0')}`);
  }, [startTime, date, duration]);

  useEffect(() => {
    const s = new Date(`${date}T${startTime}:00`);
    const e = new Date(`${date}T${endTime}:00`);
    const diff = Math.max(15, Math.round((e - s) / 60000));
    setDuration(diff);
  }, [endTime]);

  function closeDialog() {
    const dlg = document.getElementById('schedule-dialog');
    if (dlg && typeof dlg.close === 'function') dlg.close();
    onClose?.();
  }

  function handleSave() {
    setError('');
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(`${date}T${endTime}:00`);
    if (!title.trim()) return setError('Título é obrigatório.');
    if (end <= start) return setError('O horário de término deve ser após o início.');
    const emailList = emails.split(/[\s,;]+/).map(e=>e.trim()).filter(Boolean);
    const invalid = emailList.find(e => !/^\S+@\S+\.\S+$/.test(e));
    if (invalid) return setError(`E-mail inválido: ${invalid}`);

    const meeting = {
      id: crypto.randomUUID(),
      title: title.trim(),
      start, end,
      description: description.trim(),
      participants: emailList,
      location,
      online: location === 'Online' ? (onlineMode || 'manual') : '',
      onlineLink: location === 'Online' ? (onlineMode === 'manual' ? manualLink.trim() : '') : '',
      createdAt: new Date(),
    };
    onSave?.(meeting);
    closeDialog();
  }

  return (
    <dialog id="schedule-dialog" onClose={onClose}>
      <div style={{padding:'12px 16px', borderBottom:'1px solid #e2e8f0'}}>Agendar Reunião</div>
      <div style={{padding:'12px 16px'}}>
        {error && <div style={{background:'#fef2f2', color:'#991b1b', border:'1px solid #fecaca', padding:8, borderRadius:12, fontSize:14}}>{error}</div>}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
          <div><label>Título</label><input className="input" value={title} onChange={(e)=>setTitle(e.target.value)} /></div>
          <div><label>Data</label><input className="input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} /></div>
          <div><label>Início</label><input className="input" type="time" value={startTime} onChange={(e)=>setStartTime(e.target.value)} /></div>
          <div><label>Fim</label><input className="input" type="time" value={endTime} onChange={(e)=>setEndTime(e.target.value)} /></div>
          <div><label>Descrição</label><textarea className="input" rows="3" value={description} onChange={(e)=>setDescription(e.target.value)} /></div>
          <div><label>E-mails dos participantes</label><textarea className="input" rows="3" placeholder="separe por vírgulas ou quebras de linha" value={emails} onChange={(e)=>setEmails(e.target.value)} /></div>
          <div>
            <label>Local</label>
            <select className="input" value={location} onChange={(e)=>{ setLocation(e.target.value); if (e.target.value!=='Online'){ setOnlineMode(''); setManualLink(''); } }}>
              {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            {location === 'Online' && (
              <div>
                <label>Como deseja gerar o link da reunião?</label>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button className={`btn ${onlineMode==='teams'?'':'outline'}`} onClick={()=>setOnlineMode('teams')}>Criar via Microsoft Teams</button>
                  <button className={`btn ${onlineMode==='manual'?'':'outline'}`} onClick={()=>setOnlineMode('manual')}>Inserir link manualmente</button>
                </div>
                {onlineMode==='teams' && <p style={{color:'#64748b', fontSize:12, marginTop:6}}>Demo: integre com Microsoft Graph e preencha automaticamente o link.</p>}
                {onlineMode==='manual' && <div className="mt"><input className="input" placeholder="https://zoom.us/j/..., https://meet.google.com/..." value={manualLink} onChange={(e)=>setManualLink(e.target.value)} /></div>}
              </div>
            )}
          </div>
        </div>
        <div style={{display:'flex', gap:8, justifyContent:'flex-end', marginTop:12}}>
          <button className="btn outline" onClick={()=>{document.getElementById('schedule-dialog').close(); onClose?.();}}>Cancelar</button>
          <button className="btn" onClick={handleSave}><Plus size={16}/> Salvar</button>
        </div>
      </div>
    </dialog>
  )
}
