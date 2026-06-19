import React from 'react';
import { useStore } from '@/store/useStore';
import { motion } from 'motion/react';

export function Header() {
  const activeTab = useStore(state => state.activeTab);
  const setActiveTab = useStore(state => state.setActiveTab);

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-border/50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="w-11 h-11 bg-accent text-background rounded-full flex items-center justify-center font-semibold text-sm tracking-wider">
            ХА
          </div>
          <div>
            <h1 className="text-sm font-medium tracking-tight text-primary">
              Хикматов Алихон Акбаралиевич
            </h1>
            <p className="text-xs text-secondary tracking-normal mt-0.5">
              Английский язык &bull; Панель автоматизации
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <nav className="flex gap-4">
            {(['workspace', 'admin'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-2 py-1 text-xs font-medium tracking-wide uppercase transition-colors ${
                  activeTab === tab ? 'text-primary' : 'text-secondary hover:text-primary'
                }`}
              >
                {tab === 'workspace' && 'Рабочий стол'}
                {tab === 'admin' && 'Админ'}
                
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute -bottom-[21px] left-0 right-0 h-[2px] bg-primary"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

