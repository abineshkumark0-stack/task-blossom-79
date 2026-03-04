import { useState } from 'react';
import { useTasks } from '@/contexts/TaskContext';
import { TimetableEntry } from '@/types/task';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Pencil, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const { timetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry, addTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);

  const [day, setDay] = useState('Monday');
  const [subject, setSubject] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [faculty, setFaculty] = useState('');
  const [classroom, setClassroom] = useState('');

  const resetForm = () => {
    setDay('Monday'); setSubject(''); setStartTime('09:00'); setEndTime('10:00');
    setFaculty(''); setClassroom('');
    setEditingEntry(null);
  };

  const openEdit = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setDay(entry.day); setSubject(entry.subject); setStartTime(entry.startTime);
    setEndTime(entry.endTime); setFaculty(entry.faculty || ''); setClassroom(entry.classroom || '');
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!subject.trim()) { toast.error('Subject is required'); return; }
    const data = { day, subject: subject.trim(), startTime, endTime, faculty: faculty.trim(), classroom: classroom.trim() };

    if (editingEntry) {
      updateTimetableEntry(editingEntry.id, data);
      toast.success('Entry updated!');
    } else {
      addTimetableEntry(data);
      toast.success('Entry added!');
    }
    resetForm();
    setModalOpen(false);
  };

  const createReminder = (entry: TimetableEntry) => {
    const today = new Date();
    const dayIndex = DAYS.indexOf(entry.day);
    const currentDay = (today.getDay() + 6) % 7; // Monday = 0
    let diff = dayIndex - currentDay;
    if (diff <= 0) diff += 7;
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + diff);

    addTask({
      title: `${entry.subject} Class`,
      description: `${entry.faculty ? `Faculty: ${entry.faculty}` : ''}${entry.classroom ? ` | Room: ${entry.classroom}` : ''}`,
      date: nextDate.toISOString().split('T')[0],
      time: entry.startTime,
      category: 'college',
      priority: 'medium',
      repeat: 'weekly',
    });
    toast.success(`Reminder created for ${entry.subject}!`);
  };

  return (
    <div className="space-y-6 pb-24 md:pb-0">
      <div className="flex items-center justify-between">
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold tracking-tight flex items-center gap-2">
          🎓 College Timetable
        </motion.h1>
        <Button onClick={() => { resetForm(); setModalOpen(true); }} className="gradient-college text-primary-foreground rounded-xl glow-college border-0 gap-2">
          <Plus className="h-4 w-4" /> Add Class
        </Button>
      </div>

      {DAYS.map((dayName, di) => {
        const dayEntries = timetable.filter(e => e.day === dayName).sort((a, b) => a.startTime.localeCompare(b.startTime));
        if (dayEntries.length === 0) return null;

        return (
          <motion.div key={dayName} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.05 }}>
            <Card className="glass-card border-0 overflow-hidden">
              <div className="h-1 gradient-college" />
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{dayName}</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead className="hidden sm:table-cell">Faculty</TableHead>
                      <TableHead className="hidden sm:table-cell">Room</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dayEntries.map(entry => (
                      <TableRow key={entry.id} className="hover:bg-accent/30">
                        <TableCell className="font-bold text-sm">{entry.startTime} - {entry.endTime}</TableCell>
                        <TableCell className="font-medium">{entry.subject}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{entry.faculty || '—'}</TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{entry.classroom || '—'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => createReminder(entry)} title="Create reminder">
                              <Clock className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(entry)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => { deleteTimetableEntry(entry.id); toast.info('Deleted'); }}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}

      {timetable.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
          <Clock className="h-16 w-16 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No classes added yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Add your college schedule to auto-create reminders</p>
        </motion.div>
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card">
          <DialogHeader><DialogTitle>{editingEntry ? 'Edit Class' : 'Add Class'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Day</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Subject *</Label><Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g., Data Structures" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Start Time</Label><Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} /></div>
              <div><Label>End Time</Label><Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Faculty</Label><Input value={faculty} onChange={e => setFaculty(e.target.value)} placeholder="Optional" /></div>
              <div><Label>Classroom</Label><Input value={classroom} onChange={e => setClassroom(e.target.value)} placeholder="Optional" /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} className="gradient-college text-primary-foreground border-0">{editingEntry ? 'Update' : 'Add Class'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Timetable;
