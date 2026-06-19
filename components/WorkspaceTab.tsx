import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronRight, TriangleAlert, 
  UsersRound, ArrowLeft, Calendar, Phone, Mail
} from 'lucide-react';

export function WorkspaceTab() {
  const { 
    groups, students,
    selectedGroupId, setSelectedGroupId,
    openComplaintModal,
    connectionError
  } = useStore();

  // Local state to track which student profile is active
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const groupStudents = students.filter(s => s.group_id === selectedGroupId);
  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const handleSelectGroup = (id: string | null) => {
    setSelectedGroupId(id);
    setSelectedStudentId(null);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      
      {/* Top Group Choice Row */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="mb-4">
          <h2 className="text-sm font-semibold tracking-tight text-primary uppercase tracking-widest text-[#888] flex items-center gap-1.5">
            <UsersRound className="w-4 h-4 text-secondary" /> Учебные Группы
          </h2>
          <p className="text-xs text-secondary mt-1">Выберите группу для работы со списком учеников и отправки уведомлений</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.length === 0 ? (
            <p className="text-xs text-secondary col-span-full py-4 text-center">Группы пока не занесены в реестр в Админ панели.</p>
          ) : (
            groups.map(g => {
              const studentsInG = students.filter(s => s.group_id === g.id).length;
              const hasSelected = selectedGroupId === g.id;
              return (
                <button 
                  key={g.id}
                  onClick={() => handleSelectGroup(g.id)}
                  id={`group-btn-${g.id}`}
                  className={`
                    text-left rounded-xl p-4 border transition-all flex justify-between items-center group
                    ${hasSelected 
                      ? 'bg-background border-primary/60 text-accent ring-1 ring-primary/20 shadow-lg' 
                      : 'bg-background border-border hover:border-border-hover text-primary'}
                  `}
                >
                  <div>
                    <span className="text-sm font-semibold tracking-wide block">{g.name}</span>
                    <span className="text-[10px] text-secondary mt-0.5 block">{studentsInG} человек</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${hasSelected ? 'text-primary translate-x-1' : 'text-secondary group-hover:text-primary group-hover:translate-x-1'}`} />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Stage Area */}
      {selectedGroupId && selectedGroup && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface border border-border rounded-2xl p-6 space-y-6"
        >
          {/* Header block with Group details */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
            <div>
              <span className="text-[10px] bg-accent/15 border border-accent/20 text-accent px-2 py-0.5 rounded font-mono uppercase tracking-widest">Рабочая зона</span>
              <h2 className="text-xl font-semibold tracking-tight text-primary mt-1.5 matches-title">
                Группа: {selectedGroup.name}
              </h2>
            </div>
            {selectedStudentId && (
              <button 
                onClick={() => setSelectedStudentId(null)}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors bg-background border border-border py-2 px-4 rounded-full"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Вернуться к списку
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            
            {/* VIEW A: LIST OF STUDENTS IN GROUP */}
            {!selectedStudentId ? (
              <motion.div
                key="student-list"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="space-y-4"
              >
                <div className="mb-2">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-widest">Состав группы ({groupStudents.length})</h3>
                  <p className="text-[11px] text-secondary mt-1">Кликните на имя ученика, чтобы открыть карточку, или нажмите кнопку &quot;Жалоба&quot; справа для немедленной отправки уведомления.</p>
                </div>

                <div className="overflow-x-auto border border-border rounded-xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border text-[11px] text-secondary uppercase tracking-wider bg-background/20">
                        <th className="py-3.5 px-4 font-semibold">Ученик</th>
                        <th className="py-3.5 px-4 font-semibold">Родитель</th>
                        <th className="py-3.5 px-4 font-semibold">Телефон</th>
                        <th className="py-3.5 px-4 font-semibold">Первый приход</th>
                        <th className="py-3.5 px-4 text-right font-semibold">Действие</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50 text-sm">
                      {groupStudents.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-16 text-center text-xs text-secondary">
                            В этой группе пока нет учеников. Зарегистрируйте их на вкладке &quot;Админ&quot;.
                          </td>
                        </tr>
                      ) : (
                        groupStudents.map(s => {
                          return (
                            <tr 
                              key={s.id} 
                              id={`student-row-${s.id}`}
                              className="table-row-hover cursor-pointer"
                              onClick={() => setSelectedStudentId(s.id)}
                            >
                              <td className="py-4.5 px-4 font-bold text-primary text-base">
                                <div className="flex items-center gap-2">
                                  <span>{s.full_name}</span>
                                  <ChevronRight className="w-4 h-4 text-secondary/40 group-hover:text-primary transition-colors" />
                                </div>
                              </td>
                              <td className="py-4.5 px-4 text-secondary font-medium">
                                {s.parents?.full_name || 'Не привязан'}
                              </td>
                              <td className="py-4.5 px-4 text-xs font-mono text-secondary">
                                {s.parents?.phone_number || '—'}
                              </td>
                              <td className="py-4.5 px-4 text-xs font-mono text-secondary">
                                {s.first_arrival_date || 'Не указан'}
                              </td>
                              <td className="py-4.5 px-4 text-right" onClick={e => e.stopPropagation()}>
                                <button 
                                  onClick={() => openComplaintModal(s.id)}
                                  id={`complaint-btn-${s.id}`}
                                  className="inline-flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-background text-xs font-bold py-2.5 px-4 rounded-full transition-all"
                                >
                                  <TriangleAlert className="w-3.5 h-3.5" /> <span>Жалоба</span>
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              
              // VIEW B: STUDENT PROFILE CARD Only (Lean and focused)
              selectedStudent && (
                <motion.div
                  key="student-profile"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  className="max-w-xl mx-auto"
                >
                  <div className="bg-background border border-border rounded-xl p-6 space-y-6 shadow-md">
                    <div className="border-b border-border/50 pb-4 text-center">
                      <span className="text-secondary text-[10px] uppercase font-bold tracking-widest bg-border/50 px-2.5 py-1 rounded font-mono">Карточка ученика</span>
                      <p className="text-2xl font-bold text-primary mt-3">{selectedStudent.full_name}</p>
                      <p className="text-xs text-secondary mt-1">Класс: {selectedGroup.name}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-3 items-start bg-surface p-4 rounded-lg border border-border/40">
                        <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-secondary font-mono">Информация о Родителе</p>
                          <p className="font-semibold text-primary mt-1.5 text-base">{selectedStudent.parents?.full_name || 'Не привязан'}</p>
                          <p className="text-sm font-mono text-secondary mt-1">{selectedStudent.parents?.phone_number || 'Телефон отсутствует'}</p>
                          {selectedStudent.parents?.role && (
                            <span className="inline-block mt-2 text-[10px] bg-accent/15 text-accent px-2.5 py-0.5 rounded font-medium">
                              Статус: {selectedStudent.parents.role}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 items-start bg-surface p-4 rounded-lg border border-border/40">
                        <Calendar className="w-5 h-5 text-secondary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-wide text-secondary font-mono">Первый приход в класс</p>
                          <p className="font-mono mt-1 text-sm text-primary">{selectedStudent.first_arrival_date || 'Не заполнен'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => openComplaintModal(selectedStudent.id)}
                        className="w-full bg-accent hover:bg-accent-hover text-background font-bold py-3.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-accent/10"
                      >
                        <TriangleAlert className="w-4.5 h-4.5" /> Отправить жалобу родителю
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  );
}
