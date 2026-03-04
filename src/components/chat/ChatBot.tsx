import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasks } from '@/contexts/TaskContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_PROMPTS = [
  '💡 Suggest study plan',
  '📊 Analyze my productivity',
  '💪 Motivate me',
  '🔧 Break down a big task',
];

// Simple local AI responses based on task data
function generateResponse(input: string, context: { stats: any; streak: any; score: number }): string {
  const lower = input.toLowerCase();

  if (lower.includes('study') || lower.includes('plan')) {
    return `📚 **Study Plan Suggestion**\n\nBased on your activity, here's a plan:\n\n1. **Morning (8-10 AM)** — Focus on high-priority subjects\n2. **Afternoon (2-4 PM)** — Practice problems & revision\n3. **Evening (7-8 PM)** — Light review & notes\n\nYou currently have ${context.stats.upcoming} upcoming tasks. Try to complete at least 3 today to maintain your ${context.streak.current}-day streak! 🔥`;
  }

  if (lower.includes('productiv') || lower.includes('analyz') || lower.includes('analys')) {
    const score = context.score;
    const emoji = score >= 80 ? '🌟' : score >= 60 ? '👍' : score >= 40 ? '⚡' : '💪';
    return `${emoji} **Productivity Analysis**\n\n- **Score:** ${score}/100\n- **Current Streak:** ${context.streak.current} days 🔥\n- **Longest Streak:** ${context.streak.longest} days\n- **Overdue Tasks:** ${context.stats.overdue}\n\n${score >= 70 ? "Great job! You're on track. Keep the momentum going!" : "You can improve! Try tackling overdue tasks first and setting smaller daily goals."}`;
  }

  if (lower.includes('motivat') || lower.includes('inspire')) {
    const quotes = [
      '"The secret of getting ahead is getting started." — Mark Twain',
      '"It does not matter how slowly you go as long as you do not stop." — Confucius',
      '"Success is not final, failure is not fatal: it is the courage to continue that counts." — Churchill',
      '"The only way to do great work is to love what you do." — Steve Jobs',
    ];
    return `💪 **Here's some motivation:**\n\n${quotes[Math.floor(Math.random() * quotes.length)]}\n\nYou've completed ${context.stats.completedToday} tasks today. ${context.streak.current > 0 ? `Your ${context.streak.current}-day streak is impressive! Don't break it! 🔥` : "Start a new streak today! Complete just one task to begin. 🚀"}`;
  }

  if (lower.includes('break') || lower.includes('smaller')) {
    return `🔧 **Breaking Down Tasks**\n\nHere's a framework:\n\n1. **Define the end goal** clearly\n2. **List all subtasks** (brainstorm freely)\n3. **Order by dependency** — what must come first?\n4. **Estimate time** for each subtask\n5. **Schedule 2-3 subtasks per day**\n\n💡 Tip: Each subtask should take 25-45 minutes (one Pomodoro session). Add them as separate tasks with deadlines!`;
  }

  if (lower.includes('miss') || lower.includes('overdue')) {
    return `📋 **Overdue Task Analysis**\n\nYou have ${context.stats.overdue} overdue tasks.\n\n**Suggestions:**\n- Reschedule non-urgent overdue tasks\n- Prioritize by impact — which ones matter most?\n- Consider if some tasks can be delegated or dropped\n- Set realistic deadlines going forward\n\n${context.stats.overdue > 3 ? "⚠️ You might be overloading your schedule. Try reducing daily tasks to 5-7 maximum." : "You're managing well. Just clear those overdue items! ✅"}`;
  }

  return `🤖 I can help you with:\n\n- **Study planning** — "Suggest a study plan"\n- **Productivity analysis** — "Analyze my productivity"\n- **Motivation** — "Motivate me"\n- **Task breakdown** — "Help me break down a big task"\n- **Overdue analysis** — "Analyze my missed tasks"\n\nJust ask anything! I'll use your task data to give personalized advice.`;
}

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "👋 Hi! I'm your productivity assistant. Ask me anything about your tasks, study plans, or need motivation!" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { stats, streak, productivityScore } = useTasks();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = generateResponse(text, { stats, streak, score: productivityScore });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 600);
  };

  return (
    <>
      {/* FAB */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-24 md:bottom-8 right-6 z-50 w-14 h-14 rounded-full chat-fab flex items-center justify-center text-primary-foreground"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 md:bottom-8 right-4 md:right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] rounded-2xl glass-card flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="gradient-primary px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-primary-foreground">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-semibold text-sm">AI Assistant</p>
                  <p className="text-[10px] opacity-80">Powered by your data</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20" onClick={() => setIsOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-2", msg.role === 'user' ? "justify-end" : "justify-start")}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center shrink-0 mt-1">
                      <Bot className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line",
                    msg.role === 'user'
                      ? "gradient-primary text-primary-foreground rounded-br-md"
                      : "bg-muted rounded-bl-md"
                  )}>
                    {msg.content}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center shrink-0 mt-1">
                      <User className="h-3 w-3" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-center">
                  <div className="w-6 h-6 rounded-full gradient-primary flex items-center justify-center">
                    <Bot className="h-3 w-3 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex gap-1">
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            <div className="px-3 py-2 flex gap-1.5 overflow-x-auto">
              {QUICK_PROMPTS.map(prompt => (
                <button
                  key={prompt}
                  onClick={() => sendMessage(prompt)}
                  className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-accent hover:bg-accent/80 text-accent-foreground font-medium transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="rounded-xl text-sm"
                onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
              />
              <Button size="icon" className="gradient-primary text-primary-foreground rounded-xl border-0 shrink-0" onClick={() => sendMessage(input)} disabled={!input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
