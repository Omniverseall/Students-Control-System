/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send } from 'lucide-react';

const TEMPLATE_FALLBACKS: Record<string, Record<string, string>> = {
  homework: {
    ru: 'Уважаемый(ая) {ParentName}! Преподаватель {StudentName} сообщает, что домашнее задание было выполнено лишь на {Value}%. Убедительно просим Вас уделить время совместному контролю выполнения домашних заданий, так как это является залогом качественного прогресса в обучении английскому языку.',
    uz: "Hurmatli {ParentName}! {StudentName} ismli o'quvchimiz uy vazifasini bor-yo‘g‘i {Value}% ga bajarganini ma’lum qilamiz. Sizdan farzandingizning darsga tayyorgarligini alohida nazorat qilishingizni so‘rab qolamiz, chunki uy vazifalarini sifatli bajarish til o‘rganishda yuqori natijaga erishishning asosiy garovidir."
  },
  lateness: {
    ru: 'Уважаемый(ая) {ParentName}! Доводим до Вашего сведения, что {StudentName} опоздал(а) на урок на {Value} минут. К сожалению, частые опоздания нарушают общую дисциплину и отвлекают учащихся от учебного процесса. Пожалуйста, содействуйте своевременному прибытию Вашего ребенка на уроки.',
    uz: "Hurmatli {ParentName}! Farzandingiz {StudentName} darsga {Value} daqiqa kechikib kelganini ma'lum qilamiz. Kechikishlar dars jarayoniga va guruh intizomiga salbiy ta'sir ko'rsatishini inobatga olib, darslarga vaqtida kelishini ta'minlashingizni so'rab qolamiz."
  },
  absence_reason: {
    ru: 'Уважаемый(ая) {ParentName}! Получили Ваше предупреждение о том, что {StudentName} сегодня пропустит занятие по уважительной причине ({Value}). Спасибо за обратную связь! Будем рады видеть {StudentName} на следующем уроке.',
    uz: "Hurmatli {ParentName}! Farzandingiz {StudentName} bugungi darsda uzrli sabab ({Value}) tufayli qatnasha olmasligi haqida bergan xabaringizni qabul qildik. Ma’lumot uchun rahmat! Farzandingizni navbatdagi darslarda kutib qolamiz."
  },
  absence_no_reason: {
    ru: 'Уважаемый(ая) {ParentName}! Обращаем Ваше внимание, что {StudentName} сегодня отсутствует на уроке без предварительного предупреждения. Просим Вас связаться с преподавателем для уточнения обстоятельств.',
    uz: "Hurmatli {ParentName}! Farzandingiz {StudentName} bugun darsga kelmaganini va bu haqida bizga ogohlantirish berilmaganini ma’lum qilamiz. Iltimos, dars qolishining sababini aniqlashtirish uchun biz bilan bog'laning."
  },
  overdue: {
    ru: 'Уважаемый(ая) {ParentName}! Напоминаем Вам, что по {StudentName} зафиксирована задержка ежемесячной оплаты обучения на {Value}. Убедительно просим Вас произвести оплату в самое ближайшее время. Если Вы уже внесли оплату, просим Вас просто проигнорировать данное автоматическое извещение. Благодарим за понимание!',
    uz: "Hurmatli {ParentName}! Farzandingiz {StudentName} ning oylik o'quv to‘lovi {Value} ga kechikayotganini eslatib o‘tamiz. To‘lovni yaqin muddatda amalga oshirishingizni so‘raymiz. Agar to‘lovni amalga oshirgan bo‘lsangiz, ushbu xabarga e’tibor bermasligingizni so‘raymiz. Tushunganingiz uchun rahmat!"
  },
  default: {
    ru: 'Уважаемый(ая) {ParentName}! Сообщение касательно {StudentName}: {Value}',
    uz: 'Hurmatli {ParentName}! {StudentName} haqida xabar: {Value}'
  }
};

export function ComplaintModal() {
  const { 
    isComplaintModalOpen, 
    closeComplaintModal, 
    complaintStudentId,
    students,
    templates,
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
    const template = templates.find(t => t.category === category && t.language === lang);
    
    let text = '';
    if (!template) {
      const categoryTemplates = TEMPLATE_FALLBACKS[category] || TEMPLATE_FALLBACKS.default;
      text = categoryTemplates[lang] || categoryTemplates.ru;
    } else {
      text = template.template_text;
    }
    
    const parentName = student.parents?.full_name || '[Родитель]';
    const studentName = student.full_name || '[Ученик]';
    
    text = text.replace('{ParentName}', parentName)
               .replace('{StudentName}', studentName);

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
        text = text.replace(/было выполнено лишь на \{Value\}%?/gi, 'вообще не было выполнено');
        text = text.replace(/было выполнено на \{Value\}%?/gi, 'вообще не было выполнено');
        text = text.replace(/выполнено лишь на \{Value\}%?/gi, 'вообще не было выполнено');
        text = text.replace(/выполнено на \{Value\}%?/gi, 'вообще не было выполнено');
        
        if (text.includes('{Value}')) {
          text = text.replace(/\{Value\}%/g, '0% (вообще не выполнено)');
          text = text.replace(/\{Value\}/g, 'вообще не выполнено');
        }
      } else {
        text = text.replace(/bor-yo‘g‘i \{Value\}% ga bajarganini/gi, 'umuman bajarmaganini');
        text = text.replace(/\{Value\}% ga bajarganini/gi, 'umuman bajarmaganini');
        if (text.includes('{Value}')) {
          text = text.replace(/\{Value\}%/g, '0% (umuman bajarmagan)');
          text = text.replace(/\{Value\}/g, 'umuman bajarmagan');
        }
      }
    } else {
      text = text.replace(/\{Value\}/g, paramValue || '0');
    }

    const signature = lang === 'ru' 
      ? '\n\nС уважением, преподаватель английского языка Хикматов Алихон Акбаралиевич из учебного центра Everest.'
      : "\n\nHurmat bilan, Everest o'quv markazining ingliz tili o'qituvchisi Xikmatov Alixon Akbaraliyevich.";

    text = text + signature;
               
    setPreview(text);
  }, [lang, category, paramValue, student, templates]);

  // Reset states when opened
  useEffect(() => {
    if (isComplaintModalOpen) {
      setLang('ru');
      setCategory('homework');
      setParamValue('0');
    }
  }, [isComplaintModalOpen]);

  // Dynamically update default values when switching category
  useEffect(() => {
    if (!isComplaintModalOpen) return;
    if (category === 'overdue') {
      setParamValue('5');
    } else if (category === 'homework') {
      setParamValue('0');
    } else if (category === 'lateness') {
      setParamValue('15');
    } else {
      setParamValue('');
    }
  }, [category, isComplaintModalOpen]);

  const handleSend = async () => {
    if (!student || !student.parents) {
      openAlert('Ошибка', 'Нет данных родителя (отсутствует номер телефона).', 'error');
      return;
    }
    const phone = student.parents.phone_number;
    
    setIsSending(true);
    try {
      // Send request via internal server API to bypass browser CORS/Adblockers
      const res = await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: macrodroidUrl,
          phone: phone,
          msg: preview
        })
      });

      if (!res.ok) {
        throw new Error('Server request failed');
      }
      
      closeComplaintModal();
      openAlert('Успешно', 'Запрос отправлен!\n\nВАЖНО: Если SMS отправляются только при открытии приложения MacroDroid на телефоне:\n1. Настройки телефона -> Приложения -> MacroDroid\n2. Батарея / Контроль активности -> Выбрать "Нет ограничений"\n3. Разрешить фоновую работу и автозапуск.', 'success');
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
                  Отправка Жалобы
                </h3>
                <p className="text-xs text-secondary mt-1">Формирование уведомления родителю</p>
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
                  <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Родитель</label>
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
                    <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest">Детали нарушения</label>
                    <textarea rows={3} value={paramValue} onChange={e => setParamValue(e.target.value)} placeholder="Описание проблемы..." className="w-full bg-background border border-border focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm text-primary resize-none" />
                  </div>
                )}
              </div>

              <div className="bg-background rounded-lg border border-border p-4 space-y-2 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-secondary opacity-50" />
                <span className="text-[9px] font-bold text-secondary uppercase tracking-widest ml-2 block">Превью сообщения:</span>
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
                disabled={isSending || preview === 'Шаблон не найден.' || !student.parents}
                className="w-1/2 bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSending ? <motion.div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin" /> : <><Send className="w-4 h-4" /> Отправить</>}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
