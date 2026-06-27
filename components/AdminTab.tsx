import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, UserPlus, Database, Plus, Trash2, Search,
  AlertCircle, ArrowLeft, PlusCircle, Edit
} from 'lucide-react';

type SubTab = 'registry' | 'register' | 'groups' | 'parents';

export function AdminTab() {
  const { 
    groups, parents, students,
    addGroup, updateGroup, deleteGroup,
    addParent, updateParent, deleteParent,
    addStudent, updateStudent, deleteStudent,
    connectionError
  } = useStore();

  // Active sub-tab defaults to Registry to keep layout tidy
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('registry');

  // Form states
  const [newGroupName, setNewGroupName] = useState('');
  
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');
  const [newParentRole, setNewParentRole] = useState('Мама');
  
  const [newStudentName, setNewStudentName] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedParent, setSelectedParent] = useState('');
  
  // Combined single date input state for both arrival and payment
  const [unifiedStartDate, setUnifiedStartDate] = useState('');

  // Editing states
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editingParentName, setEditingParentName] = useState('');
  const [editingParentPhone, setEditingParentPhone] = useState('');
  const [editingParentRole, setEditingParentRole] = useState('');

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editingStudentName, setEditingStudentName] = useState('');
  const [editingStudentGroup, setEditingStudentGroup] = useState('');
  const [editingStudentParent, setEditingStudentParent] = useState('');
  const [editingStudentDate, setEditingStudentDate] = useState('');

  const handleUpdateGroup = async (id: string) => {
    if (editingGroupName.trim()) {
      await updateGroup(id, editingGroupName);
      setEditingGroupId(null);
    }
  };

  const handleUpdateParent = async (id: string) => {
    if (editingParentName.trim() && editingParentPhone.trim()) {
      await updateParent(id, editingParentName, editingParentPhone, editingParentRole);
      setEditingParentId(null);
    }
  };

  const handleUpdateStudent = async (id: string) => {
    if (editingStudentName.trim() && editingStudentGroup && editingStudentParent) {
      await updateStudent(
        id,
        editingStudentName,
        editingStudentGroup,
        editingStudentParent,
        editingStudentDate || undefined,
        editingStudentDate || undefined
      );
      setEditingStudentId(null);
    }
  };

  // Table search and filters
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState('all');

  const handleAddGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGroupName.trim()) {
      await addGroup(newGroupName);
      setNewGroupName('');
    }
  };

  const handleAddParent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newParentName.trim() && newParentPhone.trim()) {
      await addParent(newParentName, newParentPhone, newParentRole);
      setNewParentName('');
      setNewParentPhone('');
      setNewParentRole('Мама');
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim() && selectedGroup && selectedParent) {
      // Pass the unifiedStartDate to both arrival and payment date fields
      const dateVal = unifiedStartDate || undefined;
      await addStudent(
        newStudentName, 
        selectedGroup, 
        selectedParent, 
        dateVal, 
        dateVal
      );
      setNewStudentName('');
      setSelectedGroup('');
      setSelectedParent('');
      setUnifiedStartDate('');
      setActiveSubTab('registry'); // auto navigate back to registry list
    }
  };

  const totalStudents = students.length;
  const totalGroups = groups.length;
  const totalParents = parents.length;

  // Filter students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.full_name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                          s.parents?.full_name.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesGroup = selectedGroupFilter === 'all' || s.group_id === selectedGroupFilter;
    return matchesSearch && matchesGroup;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >

      {/* 3 Clickable Metric Navigation Cards at the Top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Students registry */}
        <div 
          onClick={() => setActiveSubTab('registry')}
          id="admin-card-students"
          className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between select-none group
            ${activeSubTab === 'registry' || activeSubTab === 'register' 
              ? 'bg-[#141414] border-accent/60 ring-1 ring-accent/20 shadow-lg shadow-accent/5' 
              : 'bg-[#0a0a0a] border-border hover:border-border-hover'}`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest block font-mono">Общий реестр</span>
            <Users className={`w-4 h-4 transition-colors ${activeSubTab === 'registry' || activeSubTab === 'register' ? 'text-accent' : 'text-secondary group-hover:text-primary'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-semibold text-primary font-mono">{totalStudents}</span>
            <p className="text-xs text-secondary mt-1 font-sans">Ученики &bull; Кликните для просмотра списка</p>
          </div>
        </div>

        {/* Card 2: Groups */}
        <div 
          onClick={() => setActiveSubTab('groups')}
          id="admin-card-groups"
          className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between select-none group
            ${activeSubTab === 'groups' 
              ? 'bg-[#141414] border-accent/60 ring-1 ring-accent/20 shadow-lg shadow-accent/5' 
              : 'bg-[#0a0a0a] border-border hover:border-border-hover'}`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest block font-mono">Группы и Классы</span>
            <Database className={`w-4 h-4 transition-colors ${activeSubTab === 'groups' ? 'text-accent' : 'text-secondary group-hover:text-primary'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-semibold text-primary font-mono">{totalGroups}</span>
            <p className="text-xs text-secondary mt-1 font-sans">Учебные классы &bull; Кликните для управления</p>
          </div>
        </div>

        {/* Card 3: Parents database */}
        <div 
          onClick={() => setActiveSubTab('parents')}
          id="admin-card-parents"
          className={`cursor-pointer rounded-2xl p-5 border transition-all flex flex-col justify-between select-none group
            ${activeSubTab === 'parents' 
              ? 'bg-[#141414] border-accent/60 ring-1 ring-accent/20 shadow-lg shadow-accent/5' 
              : 'bg-[#0a0a0a] border-border hover:border-border-hover'}`}
        >
          <div className="flex justify-between items-center text-secondary mb-2">
            <span className="text-[11px] font-bold uppercase tracking-widest block font-mono">База контактов</span>
            <UserPlus className={`w-4 h-4 transition-colors ${activeSubTab === 'parents' ? 'text-accent' : 'text-secondary group-hover:text-primary'}`} />
          </div>
          <div className="mt-2">
            <span className="text-3xl font-semibold text-primary font-mono">{totalParents}</span>
            <p className="text-xs text-secondary mt-1 font-sans">Родители &bull; Кликните для списка телефонов</p>
          </div>
        </div>

      </div>

      {/* Stage Container displaying Active View */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          
          {/* 1. MASTER SEARCH REGISTRY SUBTAB */}
          {activeSubTab === 'registry' && (
            <motion.div
              key="registry"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-surface border border-border rounded-2xl p-6"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-primary">Реестр Учеников</h3>
                  <p className="text-xs text-secondary mt-1">Полный перечень учащихся. Для начисления оплат кликните по ученику на Рабочем столе.</p>
                </div>

                {/* Filter tools and beautiful New Student CTA */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                  <div className="relative flex-grow sm:flex-grow-0">
                    <Search className="w-3.5 h-3.5 text-secondary absolute left-3 top-3" />
                    <input 
                      type="text" 
                      value={studentSearch}
                      onChange={e => setStudentSearch(e.target.value)}
                      placeholder="Поиск по имени..."
                      className="bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-full pl-9 pr-4 py-2 text-xs w-full sm:w-44 transition-colors text-primary"
                    />
                  </div>
                  
                  <select 
                    value={selectedGroupFilter}
                    onChange={e => setSelectedGroupFilter(e.target.value)}
                    className="bg-background border border-border focus:outline-none rounded-full px-4 py-2 text-xs text-secondary appearance-none pr-8 relative transition-colors"
                  >
                    <option value="all">Все группы</option>
                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>

                  <button
                    onClick={() => setActiveSubTab('register')}
                    className="flex items-center gap-1 bg-accent hover:bg-accent-hover text-background font-bold text-xs py-2 px-4 rounded-full transition-all"
                  >
                    <PlusCircle className="w-3.5 h-3.5" /> Добавить ученика
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border border-border rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider bg-background/20">
                      <th className="py-3 px-4 font-semibold">ФИО Ученика</th>
                      <th className="py-3 px-4 font-semibold">Группа</th>
                      <th className="py-3 px-4 font-semibold">Родитель</th>
                      <th className="py-3 px-4 text-right font-semibold">Удаление</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-xs">
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-16 text-center text-xs text-secondary">
                          Ученики не обнаружены. Нажмите «Добавить ученика», чтобы внести анкету в базу.
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        editingStudentId === s.id ? (
                          <tr key={s.id} className="bg-[#111] border-b border-border">
                            <td className="p-4" colSpan={4}>
                              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-secondary font-mono">ФИО Ученика</label>
                                  <input 
                                    type="text"
                                    value={editingStudentName}
                                    onChange={e => setEditingStudentName(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none"
                                  />
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-secondary font-mono">Группа</label>
                                  <select 
                                    value={editingStudentGroup}
                                    onChange={e => setEditingStudentGroup(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none"
                                  >
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-secondary font-mono">Родитель</label>
                                  <select 
                                    value={editingStudentParent}
                                    onChange={e => setEditingStudentParent(e.target.value)}
                                    className="w-full bg-background border border-border rounded-lg px-3 py-2 text-xs text-primary focus:outline-none"
                                  >
                                    {parents.map(p => <option key={p.id} value={p.id} className="font-mono">{p.full_name} ({p.phone_number})</option>)}
                                  </select>
                                </div>
                                <div className="space-y-1.5">
                                  <label className="text-[10px] uppercase font-bold text-secondary font-mono">Дата первого занятия</label>
                                  <div className="flex gap-2">
                                    <input 
                                      type="date"
                                      value={editingStudentDate}
                                      onChange={e => setEditingStudentDate(e.target.value)}
                                      className="bg-background border border-border rounded-lg px-2 py-2 text-xs text-primary font-mono flex-grow focus:outline-none"
                                    />
                                    <button 
                                      onClick={() => handleUpdateStudent(s.id)}
                                      className="bg-accent hover:bg-accent-hover text-background text-xs font-bold px-3 py-2 rounded-lg transition-all"
                                    >
                                      Ок
                                    </button>
                                    <button 
                                      onClick={() => setEditingStudentId(null)}
                                      className="border border-border text-secondary text-xs px-3 py-2 rounded-lg hover:text-primary transition-all"
                                    >
                                      Отмена
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={s.id} className="table-row-hover group/stdrow">
                            <td className="py-4.5 px-4 font-bold text-base text-primary">{s.full_name}</td>
                            <td className="py-4.5 px-4 font-medium text-secondary">{s.groups?.name || <span className="text-secondary/50">—</span>}</td>
                            <td className="py-4.5 px-4 text-secondary">
                              <div>
                                <span className="font-semibold">{s.parents?.full_name || <span className="text-secondary">—</span>}</span>
                                {s.parents?.phone_number && (
                                  <p className="text-[10px] text-secondary/70 font-mono mt-0.5">{s.parents.phone_number}</p>
                                )}
                              </div>
                            </td>
                            <td className="py-4.5 px-4 text-right">
                              <div className="flex gap-1 justify-end">
                                <button 
                                  onClick={() => {
                                    setEditingStudentId(s.id);
                                    setEditingStudentName(s.full_name);
                                    setEditingStudentGroup(s.group_id || '');
                                    setEditingStudentParent(s.parent_id || '');
                                    setEditingStudentDate(s.first_arrival_date || s.first_payment_date || '');
                                  }}
                                  className="opacity-0 group-hover/stdrow:opacity-100 text-secondary hover:text-accent transition-all p-1.5 rounded-full hover:bg-accent/10"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => deleteStudent(s.id)} 
                                  className="opacity-0 group-hover/stdrow:opacity-100 text-secondary hover:text-error transition-all p-1.5 rounded-full hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* 2. REGISTER STUDENT SUBTAB (Combined informal Date Input) */}
          {activeSubTab === 'register' && (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="bg-surface border border-border rounded-2xl p-6 max-w-2xl mx-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-sm font-semibold text-primary">Регистрационная анкета студента</h3>
                  <p className="text-xs text-secondary mt-1">Заполните ФИО, выберите группу и привяжите родителя</p>
                </div>
                <button 
                  onClick={() => setActiveSubTab('registry')}
                  className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors bg-background border border-border py-2 px-3.5 rounded-full"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> К реестру
                </button>
              </div>

              {parents.length === 0 || groups.length === 0 ? (
                <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs space-y-2 mb-6">
                  <p className="font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Недостаточно опорных данных
                  </p>
                  <p>
                    Для регистрации ученика сначала необходимо создать хотя бы одну <b>Группу</b> и зарегистрировать хотя бы одного <b>Родителя</b>.
                  </p>
                </div>
              ) : null}

              <form onSubmit={handleAddStudent} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest font-mono">
                      ФИО Ученика *
                    </label>
                    <input 
                      type="text" 
                      value={newStudentName}
                      onChange={e => setNewStudentName(e.target.value)}
                      placeholder="Например: Смирнов Даниил"
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary placeholder:text-secondary/40"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest font-mono">
                      Учебная группа *
                    </label>
                    <select 
                      value={selectedGroup}
                      onChange={e => setSelectedGroup(e.target.value)}
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                      required
                    >
                      <option value="" disabled>-- Выберите из списка --</option>
                      {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest font-mono">
                    Родитель *
                  </label>
                  <select 
                    value={selectedParent}
                    onChange={e => setSelectedParent(e.target.value)}
                    className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary appearance-none"
                    required
                  >
                    <option value="" disabled>-- Выберите родителя --</option>
                    {parents.map(p => <option key={p.id} value={p.id}>{p.full_name} ({p.phone_number}) {p.role ? `[${p.role}]` : ''}</option>)}
                  </select>
                </div>

                {/* Combined Informal Date Input as requested */}
                <div className="border-t border-border/80 pt-4 mt-6 space-y-3">
                  <div className="bg-background/40 border border-border/50 rounded-xl p-4 space-y-2">
                    <h4 className="text-xs font-semibold text-secondary uppercase tracking-widest flex items-center gap-1.5 font-mono">
                      🗓️ Начало обучения и старт отсчета оплаты
                    </h4>
                    <p className="text-[11px] text-secondary leading-relaxed">
                      Укажите дату первого прихода. Система автоматически сформирует график ежемесячных оплат с этого дня.
                    </p>
                    
                    <div className="space-y-1.5 pt-2">
                      <label className="block text-[11px] font-bold text-secondary uppercase tracking-widest font-mono">
                        Когда впервые пришел(а) на занятия и оплатил(а)? (необязательно)
                      </label>
                      <input 
                        type="date" 
                        value={unifiedStartDate}
                        onChange={e => setUnifiedStartDate(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    className="bg-accent hover:bg-accent-hover text-background text-sm font-semibold px-8 py-3 rounded-full transition-colors disabled:opacity-40"
                    disabled={!groups.length || !parents.length}
                  >
                    Внести в реестр
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* 3. GROUPS SUBTAB */}
          {activeSubTab === 'groups' && (
            <motion.div
              key="groups"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col h-full justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-2">
                    <Database className="w-4 h-4 text-secondary" /> Создать Группу
                  </h3>
                  <p className="text-xs text-secondary mb-6">Добавление нового учебного класса в расписание учителя.</p>
                  
                  <form onSubmit={handleAddGroup} className="space-y-4">
                    <input 
                      type="text" 
                      value={newGroupName}
                      onChange={e => setNewGroupName(e.target.value)}
                      placeholder="Например: General English 10:00"
                      className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                      required
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Добавить группу
                    </button>
                  </form>
                </div>
              </div>

              {/* List of existing groups */}
              <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-primary mb-1">Активные группы</h3>
                <p className="text-xs text-secondary mb-4">Всего {groups.length} классов</p>
                
                <div className="divide-y divide-border/60">
                  {groups.map(g => {
                    const groupStudentsCount = students.filter(s => s.group_id === g.id).length;
                    return (
                      <div key={g.id} className="py-4">
                        {editingGroupId === g.id ? (
                          <div className="flex gap-2 items-center">
                            <input 
                              type="text"
                              value={editingGroupName}
                              onChange={e => setEditingGroupName(e.target.value)}
                              className="bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-3 py-1.5 text-sm text-primary flex-grow font-semibold"
                            />
                            <button 
                              onClick={() => handleUpdateGroup(g.id)}
                              className="bg-accent hover:bg-accent-hover text-background text-xs font-bold py-1.5 px-3 rounded-lg"
                            >
                              Ок
                            </button>
                            <button 
                              onClick={() => setEditingGroupId(null)}
                              className="border border-border text-secondary text-xs py-1.5 px-3 rounded-lg hover:text-primary"
                            >
                              Отмена
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center group/row">
                            <div>
                              <p className="text-sm font-semibold text-primary">{g.name}</p>
                              <p className="text-xs text-secondary mt-0.5">{groupStudentsCount} студентов привязано</p>
                            </div>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => {
                                  setEditingGroupId(g.id);
                                  setEditingGroupName(g.name);
                                }}
                                className="opacity-0 group-hover/row:opacity-100 text-secondary hover:text-accent transition-all p-2 rounded-full hover:bg-accent/10"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => deleteGroup(g.id)}
                                className="opacity-0 group-hover/row:opacity-100 text-secondary hover:text-error transition-all p-2 rounded-full hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {groups.length === 0 && (
                    <div className="py-12 text-center text-xs text-secondary">Группы пока не созданы.</div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. PARENTS SUBTAB */}
          {activeSubTab === 'parents' && (
            <motion.div
              key="parents"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-semibold tracking-tight text-primary flex items-center gap-2 mb-2">
                    <UserPlus className="w-4 h-4 text-secondary" /> Новый родитель
                  </h3>
                  <p className="text-xs text-secondary mb-6">Создайте карточку доверенного лица перед привязкой ученика.</p>
                  
                  <form onSubmit={handleAddParent} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest font-mono">ФИО Родителя</label>
                      <input 
                        type="text" 
                        value={newParentName}
                        onChange={e => setNewParentName(e.target.value)}
                        placeholder="Например, Иванова В. К."
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest font-mono">Номер Телефона (для СМС)</label>
                      <input 
                        type="text" 
                        value={newParentPhone}
                        onChange={e => setNewParentPhone(e.target.value)}
                        placeholder="+998901234567"
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-secondary tracking-widest font-mono">Роль (Кем приходится ученику)</label>
                      <select 
                        value={newParentRole}
                        onChange={e => setNewParentRole(e.target.value)}
                        className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary"
                        required
                      >
                        <option value="Мама">Мама</option>
                        <option value="Папа">Папа</option>
                        <option value="Сестра">Сестра</option>
                        <option value="Брат">Брат</option>
                        <option value="Бабушка">Бабушка</option>
                        <option value="Дедушка">Дедушка</option>
                        <option value="Тетя">Тетя</option>
                        <option value="Дядя">Дядя</option>
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-accent hover:bg-accent-hover text-background text-sm font-semibold py-3 rounded-full transition-colors flex items-center justify-center gap-1 mt-2"
                    >
                      <Plus className="w-4 h-4" /> Зарегистрировать родителя
                    </button>
                  </form>
                </div>
              </div>

              {/* Parents list table */}
              <div className="md:col-span-2 bg-surface border border-border rounded-2xl p-6 border-border">
                <h3 className="text-sm font-semibold text-primary mb-1">База Контактов</h3>
                <p className="text-xs text-secondary mb-4">Всего {parents.length} контактных лиц</p>
                
                <div className="overflow-y-auto max-h-[450px] pr-2 custom-scroll">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[10px] text-secondary uppercase tracking-wider bg-background/20">
                        <th className="py-2.5 px-3 font-semibold">ФИО Родителя</th>
                        <th className="py-2.5 px-3 font-semibold">Телефон</th>
                        <th className="py-2.5 px-3 text-right font-semibold">Удаление</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-xs text-primary">
                      {parents.map(p => (
                        editingParentId === p.id ? (
                          <tr key={p.id} className="bg-background/25">
                            <td className="py-3 px-3" colSpan={3}>
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end p-2 border border-border/40 rounded-xl">
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-secondary font-mono">ФИО</label>
                                  <input 
                                    type="text"
                                    value={editingParentName}
                                    onChange={e => setEditingParentName(e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-primary focus:outline-none focus:border-secondary"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-secondary font-mono">Телефон</label>
                                  <input 
                                    type="text"
                                    value={editingParentPhone}
                                    onChange={e => setEditingParentPhone(e.target.value)}
                                    className="w-full bg-background border border-border rounded px-2.5 py-1.5 text-xs text-primary font-mono focus:outline-none focus:border-secondary"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[9px] uppercase font-bold text-secondary font-mono">Роль</label>
                                  <div className="flex gap-1.5">
                                    <input 
                                      type="text"
                                      value={editingParentRole}
                                      onChange={e => setEditingParentRole(e.target.value)}
                                      className="bg-background border border-border rounded px-2.5 py-1.5 text-xs text-primary flex-grow focus:outline-none focus:border-secondary"
                                    />
                                    <button 
                                      onClick={() => handleUpdateParent(p.id)}
                                      className="bg-accent hover:bg-accent-hover text-background text-xs font-bold px-3 py-1.5 rounded-md shrink-0"
                                    >
                                      Да
                                    </button>
                                    <button 
                                      onClick={() => setEditingParentId(null)}
                                      className="border border-border text-secondary text-xs px-2.5 py-1.5 rounded-md hover:text-primary shrink-0"
                                    >
                                      Нет
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          <tr key={p.id} className="group/prow hover:bg-background/40 transition-colors">
                            <td className="py-3.5 px-3 font-medium flex items-center gap-2">
                              <span>{p.full_name}</span>
                              {p.role && (
                                <span className="text-[10px] bg-accent/20 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-bold">
                                  {p.role}
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-3 font-mono text-secondary">{p.phone_number}</td>
                            <td className="py-3.5 px-3 text-right">
                              <div className="flex gap-1 justify-end">
                                <button 
                                  onClick={() => {
                                    setEditingParentId(p.id);
                                    setEditingParentName(p.full_name);
                                    setEditingParentPhone(p.phone_number);
                                    setEditingParentRole(p.role || '');
                                  }}
                                  className="opacity-0 group-hover/prow:opacity-100 text-secondary hover:text-accent transition-all p-1 rounded-full hover:bg-accent/10"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button 
                                  onClick={() => deleteParent(p.id)}
                                  className="opacity-0 group-hover/prow:opacity-100 text-secondary hover:text-error transition-all p-1 rounded-full hover:bg-red-500/10"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        )
                      ))}
                      {parents.length === 0 && (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-secondary">Контакты отсутствуют.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </motion.div>
  );
}