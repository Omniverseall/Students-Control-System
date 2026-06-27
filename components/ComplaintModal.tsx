// components/ComplaintModal.tsx
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';

const TEMPLATES: Record<string, Record<string, string>> = {
  homework: {
    ru: 'Уважаемый(ая) {ParentName}! {StudentRef} выполнил(а) домашнее задание лишь на {Value}%. Прошу Вас проконтролировать подготовку к занятиям, так как регулярное выполнение заданий — основа успешного изучения английского языка.',
    uz: "Hurmatli {ParentName}! {StudentRef} uy vazifasini bor-yo‘g‘i {Value}% ga bajardi. Ingliz tilini muvaffaqiyatli o'zlashtirish uchun uy vazifalarini muntazam bajarish muhimligini inobatga olib, uning darsga tayyorgarligini nazorat qilishingizni so‘rayman."
  },
  lateness: {
    ru: 'Уважаемый(ая) {ParentName}! Хочу сообщить, что {StudentRef} опоздал(а) на занятие на {Value} минут. Опоздания нарушают рабочий процесс группы, поэтому прошу Вас проследить за своевременным приходом на уроки.',
    uz: "Hurmatli {ParentName}! {StudentRef} darsga {Value} daqiqa kechikib kelganini ma'lum qilaman. Kechikishlar dars jarayoniga xalaqit beradi, shu sababli darslarga vaqtida kelishini nazorat qilishingizni so'rayman."
  },
  absence_reason: {
    ru: 'Уважаемый(ая) {ParentName}! Я принял(а) Ваше предупреждение о том, что {StudentRef} пропустит сегодняшнее занятие по причине: ({Value}). Благодарю за своевременное уведомление, ждем на следующем уроке!',
    uz: "Hurmatli {ParentName}! {StudentRef} bugungi darsda ({Value}) sababli qatnasha olmasligi haqidagi xabaringizni qabul qildim. Ogohlantirganingiz uchun rahmat, navbatdagi darslarda kutib qolamiz!"
  },
  absence_no_reason: {
    ru: 'Уважаемый(ая) {ParentName}! Сегодня {StudentRef} отсутствует на занятии без предупреждения. Пожалуйста, свяжитесь со мной для уточнения причины пропуска.',
    uz: "Hurmatli {ParentName}! {StudentRef} bugun darsga ogohlantirishsiz kelmadi. Iltimos, dars qoldirish sababini aniqlashtirish uchun men bilan bog'laning."
  },
  overdue: {
    ru: 'Уважаемый(ая) {ParentName}! Напоминаю, что по оплате за обучение ({StudentRef}) возникла задолженность в размере {Value}. Пожалуйста, произведите оплату при первой возможности. Если оплата уже внесена, просто проигнорируйте это сообщение.',
    uz: "Hurmatli {ParentName}! {StudentRef}ning o'quv to‘lovi {Value} ga kechikayotganini eslatib o‘taman. To‘lovni eng yaqin fursatda amalga oshirishingizni so‘rayman. Agar to‘lov qilingan bo‘lsa, ushbu xabarni e'tiborsiz qoldiring."
  },
  custom: {
    ru: 'Уважаемый(ая) {ParentName}! Обращаюсь к Вам по поводу: {StudentRef}. {Value}',
    uz: 'Hurmatli {ParentName}! {StudentRef} bo\'yicha murojaat qilmoqdaman. {Value}'
  }
};

export function ComplaintModal() {
  const { 
    isComplaintModalOpen, 
    closeComplaintModal, 
    complaintStudentId,
    students,
    macrodroidUrl,
    openAlert
  } = useStore();

  const [lang, setLang] = useState('ru');
  const [category, setCategory] = useState('homework');
  const [paramValue, setParamValue] = useState('');
  const [preview, setPreview] = useState('');
  const [isSending, setIsSending] = useState(false);

  const student = students.find(s => s.id === complaintStudentId);

  useEffect(() => {
    if (!student) return;
    
    const categoryTemplates = TEMPLATES[category] || TEMPLATES.custom;
    let text = categoryTemplates[lang] || categoryTemplates.ru;
    
    const parentName = student.parents?.full_name || '[Имя Родителя]';
    const studentName = student.full_name || '[Имя Ученика]';
    const role = student.parents?.role?.trim().toLowerCase() || '';

    // ==========================================
    // ЛОГИКА ОПРЕДЕЛЕНИЯ РОДСТВА
    // ==========================================
    let studentRef = studentName; // По умолчанию (Брат, Сестра, Тетя, Дядя и т.д.) просто имя

    if (lang === 'ru') {
      if (role === 'мама' || role === 'папа') {
        studentRef = `Ваш ребенок ${studentName}`;
      } else if (role === 'бабушка' || role === 'дедушка') {
        studentRef = `Ваш внук/внучка ${studentName}`;
      }
    } else if (lang === 'uz') {
      if (role === 'мама' || role === 'папа') {
        studentRef = `Farzandingiz ${studentName}`;
      } else if (role === 'бабушка' || role === 'дедушка') {
        studentRef = `Nabirangiz ${studentName}`;
      }
    }
    
    // Заменяем переменные в тексте
    text = text.replace('{ParentName}', parentName)
               .replace('{StudentRef}', studentRef)
               .replace('{StudentName}', studentName); // На всякий случай оставляем

    // Логика обработки склонений и нулевых значений
    if (category === 'overdue') {
      const days = parseInt(paramValue) || 5;
      const getDaysWord = (d: number) => {
        const mod10 = d % 10;
        const mod100 = d % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'дней';
        if (mod10 === 1) return 'день';
        if (mod10 >= 2 && mod10 <= 4) return 'дня';
        return 'дней';
      };
      const daysStr = lang === 'ru' ? `${days} ${getDaysWord(days)}` : `${days} kunlik`;
      text = text.replace('{Value}', daysStr);
    } else if (category === 'homework' && (paramValue === '0' || paramValue === '0%' || !paramValue.trim())) {
      if (lang === 'ru') {
        text = text.replace(/выполнил\(а\) домашнее задание лишь на \{Value\}%?/gi, 'вообще не выполнил(а) домашнее задание');
        text = text.replace(/\{Value\}%/gi, '0%');
      } else {
        text = text.replace(/uy vazifasini bor-yo‘g‘i \{Value\}% ga bajardi/gi, 'uy vazifasini umuman bajarmadi');
        text = text.replace(/\{Value\}%/gi, '0%');
      }
    } else {
      text = text.replace(/\{Value\}/g, paramValue || '0');
    }

    const signature = lang === 'ru' 
      ? '\n\nС уважением, преподаватель английского языка Хикматов Алихон Акбаралиевич (Everest).'
      : "\n\nHurmat bilan, Everest o'quv markazining ingliz tili o'qituvchisi Xikmatov Alixon Akbaraliyevich.";

    text = text + signature;
    setPreview(text);
  }, [lang, category, paramValue, student]);

  useEffect(() => {
    if (isComplaintModalOpen) {
      setLang('ru');
      setCategory('homework');
      setParamValue('0');
    }
  }, [isComplaintModalOpen]);

  useEffect(() => {
    if (!isComplaintModalOpen) return;
    if (category === 'overdue') setParamValue('5');
    else if (category === 'homework') setParamValue('0');
    else if (category === 'lateness') setParamValue('15');
    else setParamValue('');
  }, [category, isComplaintModalOpen]);

  const handleSend = async () => {
    if (!student || !student.parents) {
      openAlert('Ошибка', 'Нет данных родителя (отсутствует номер телефона).', 'error');
      return;
    }
    const phone = student.parents.phone_number;
    
    setIsSending(true);
    try {
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: macrodroidUrl,
          phone: phone,
          msg: preview
        })
      });

      if (!res.ok) throw new Error('Server request failed');
      
      closeComplaintModal();
      openAlert('Успешно', 'Запрос отправлен!\n\nВАЖНО: Убедитесь, что MacroDroid имеет разрешения на фоновую работу и автозапуск.', 'success');
    } catch (e) {
      console.error(e);
      openAlert('Ошибка отправки', 'Не удалось связаться с сервером MacroDroid. Проверьте адрес Webhook.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isComplaintModalOpen && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={closeComplaintModal}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-xl bg-surface border border-border rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-primary tracking-tight flex items-center gap-2">
                  Отправка Уведомления
                </h3>
                <p className="text-xs text-secondary mt-1">Формирование сообщения родителю</p>
              </div>
              <button onClick={closeComplaintModal} className="text-secondary hover:text-primary transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-5 pr-2 custom-scroll">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Ученик</label>
                  <div className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-secondary truncate">
                    {student.full_name}
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Получатель ({student.parents?.role || 'Нет роли'})</label>
                  <div className="bg-background border border-border rounded-lg px-4 py-3 text-sm text-secondary truncate">
                    {student.parents?.full_name || 'Не указан'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Язык</label>
                  <select 
                    value={lang} onChange={e => setLang(e.target.value)}
                    className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary appearance-none transition-colors"
                  >
                    <option value="ru">Русский</option>
                    <option value="uz">O&apos;zbekcha</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Категория</label>
                  <select 
                    value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary appearance-none transition-colors"
                  >
                    <option value="homework">Д/З недовыполнено</option>
                    <option value="lateness">Опоздание</option>
                    <option value="absence_reason">Пропуск (уважит.)</option>
                    <option value="absence_no_reason">Пропуск (без причины)</option>
                    <option value="overdue">Просрочка оплаты</option>
                    <option value="custom">Свой текст</option>
                  </select>
                </div>
              </div>

              <div>
                {category === 'homework' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Процент выполнения (%)</label>
                    <input type="number" min="0" max="100" value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="0-100" className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary" />
                  </div>
                )}
                {category === 'lateness' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Время (минут)</label>
                    <input type="number" min="1" value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="Минут опоздания" className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary" />
                  </div>
                )}
                {category === 'overdue' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Количество дней просрочки</label>
                    <input type="number" min="1" value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="Дней просрочки" className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary" />
                  </div>
                )}
                {category === 'custom' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Свой текст сообщения</label>
                    <textarea rows={3} value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="Напишите, что нужно передать..." className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary resize-none" />
                  </div>
                )}
                {category === 'absence_reason' && (
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Причина (укажите кратко)</label>
                    <input type="text" value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="Например: по состоянию здоровья" className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary" />
                  </div>
                )}
              </div>

              <div className="bg-background rounded-lg border border-border p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50" />
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest ml-2 block">Итоговое сообщение:</span>
                <p className="text-sm font-newsreader italic text-primary/80 leading-relaxed whitespace-pre-wrap ml-2">
                  {preview}
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-border">
              <button 
                onClick={closeComplaintModal} 
                className="w-1/2 bg-background hover:bg-border text-primary text-sm font-medium py-3 rounded-full border border-border transition-colors"
                disabled={isSending}
              >
                Отмена
              </button>
              <button 
                onClick={handleSend} 
                disabled={isSending || !student.parents}
                className="w-1/2 bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <motion.div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Отправить SMS</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}