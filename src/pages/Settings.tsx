import { useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, Calendar, Clock, Globe, Smartphone, Palette, Download, Upload, Check } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNotifications, NotificationPrefs } from '@/hooks/useNotifications';
import { useTasks } from '@/contexts/TaskContext';
import { useI18n, LANGUAGES, Language } from '@/contexts/I18nContext';
import { useAccentColor, ACCENT_COLORS, AccentId } from '@/hooks/useAccentColor';
import { cn } from '@/lib/utils';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { tasks } = useTasks();
  const { prefs, setPrefs, requestPermission } = useNotifications(tasks);
  const { t, language, setLanguage } = useI18n();
  const { accent, setAccent } = useAccentColor();
  const fileRef = useRef<HTMLInputElement>(null);

  const updatePref = <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    toast.success('Notification preference updated');
  };

  const handleExport = () => {
    const KEYS = [
      'reminder-tasks','reminder-goals','reminder-timetable','reminder-completion-history',
      'reminder-streak','reminder-notif-prefs','reminder-accent','reminder-language',
      'reminder-focus-stats','reminder-focus-settings',
    ];
    const data: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: 1 };
    KEYS.forEach(k => { const v = localStorage.getItem(k); if (v) data[k] = JSON.parse(v); });
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `productivity-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📦 Backup downloaded');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        let count = 0;
        Object.entries(data).forEach(([k, v]) => {
          if (k.startsWith('reminder-')) {
            localStorage.setItem(k, JSON.stringify(v));
            count++;
          }
        });
        toast.success(`✅ Restored ${count} keys. Reloading…`);
        setTimeout(() => window.location.reload(), 800);
      } catch {
        toast.error('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications not supported');
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') {
      updatePref('enabled', true);
      toast.success('🔔 Notifications enabled!');
    } else {
      toast.info('Notification permission denied. You can enable it in browser settings.');
    }
  };

  const permissionStatus = 'Notification' in window ? Notification.permission : 'unsupported';

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">{t('settings.title')}</h1>

      {/* Language */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-5 w-5" />
            {t('settings.language')}
          </CardTitle>
          <CardDescription>{t('settings.selectLanguage')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <SelectItem key={code} value={code}>
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.nativeLabel}</span>
                    <span className="text-muted-foreground text-xs">({lang.label})</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            {t('settings.appearance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>{t('settings.darkMode')}</Label>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            {t('settings.notifications')}
          </CardTitle>
          <CardDescription>
            {permissionStatus === 'granted'
              ? `✅ ${t('settings.notifEnabled')}`
              : permissionStatus === 'denied'
              ? `❌ ${t('settings.notifBlocked')}`
              : `⚠️ ${t('settings.notifPending')}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {permissionStatus !== 'granted' && (
            <Button variant="outline" onClick={handleEnableNotifications} className="gap-2">
              <Bell className="h-4 w-4" />
              {t('settings.enableNotif')}
            </Button>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.taskReminders')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.taskRemindersDesc')}</p>
            </div>
            <Switch checked={prefs.enabled} onCheckedChange={(v) => updatePref('enabled', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                {t('settings.remindBefore')}
              </Label>
              <p className="text-xs text-muted-foreground">{t('settings.remindBeforeDesc')}</p>
            </div>
            <Select
              value={String(prefs.beforeMinutes)}
              onValueChange={(v) => updatePref('beforeMinutes', Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('remind.1min')}</SelectItem>
                <SelectItem value="5">{t('remind.5min')}</SelectItem>
                <SelectItem value="10">{t('remind.10min')}</SelectItem>
                <SelectItem value="15">{t('remind.15min')}</SelectItem>
                <SelectItem value="30">{t('remind.30min')}</SelectItem>
                <SelectItem value="60">{t('remind.1hr')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.dailySummary')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.dailySummaryDesc')}</p>
            </div>
            <Switch checked={prefs.dailySummary} onCheckedChange={(v) => updatePref('dailySummary', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.streakAlerts')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.streakAlertDesc')}</p>
            </div>
            <Switch checked={prefs.streakAlerts} onCheckedChange={(v) => updatePref('streakAlerts', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>{t('settings.goalReminders')}</Label>
              <p className="text-xs text-muted-foreground">{t('settings.goalRemindersDesc')}</p>
            </div>
            <Switch checked={prefs.goalReminders} onCheckedChange={(v) => updatePref('goalReminders', v)} />
          </div>

          {'vibrate' in navigator && (
            <>
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">{t('settings.vibration')}</Label>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>{t('settings.vibrateOnNotif')}</Label>
                      <p className="text-xs text-muted-foreground">{t('settings.vibrateDesc')}</p>
                    </div>
                    <Switch checked={prefs.vibration} onCheckedChange={(v) => updatePref('vibration', v)} />
                  </div>

                  {prefs.vibration && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>{t('settings.vibrationPattern')}</Label>
                        <p className="text-xs text-muted-foreground">{t('settings.vibrationPatternDesc')}</p>
                      </div>
                      <Select
                        value={prefs.vibrationPattern}
                        onValueChange={(v) => {
                          updatePref('vibrationPattern', v as any);
                          navigator.vibrate(
                            v === 'short' ? [100] : v === 'medium' ? [200, 100, 200] : v === 'long' ? [500, 200, 500] : [100, 50, 100]
                          );
                        }}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">{t('vibration.short')}</SelectItem>
                          <SelectItem value="medium">{t('vibration.medium')}</SelectItem>
                          <SelectItem value="long">{t('vibration.long')}</SelectItem>
                          <SelectItem value="double">{t('vibration.double')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Google Calendar */}
      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            {t('settings.googleCalendar')}
          </CardTitle>
          <CardDescription>{t('settings.googleCalendarDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
            <p className="font-medium">{t('settings.setupInstructions')}</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Go to <a href="https://console.cloud.google.com/" target="_blank" rel="noopener" className="text-primary underline">Google Cloud Console</a></li>
              <li>Create a new project (or select an existing one)</li>
              <li>Navigate to <strong>APIs & Services → Library</strong></li>
              <li>Search for and enable the <strong>Google Calendar API</strong></li>
              <li>Go to <strong>APIs & Services → Credentials</strong></li>
              <li>Click <strong>Create Credentials → OAuth 2.0 Client ID</strong></li>
              <li>Set the application type to <strong>Web application</strong></li>
              <li>Add your app's URL to Authorized JavaScript Origins</li>
              <li>Add your app's URL to Authorized Redirect URIs</li>
              <li>Copy the <strong>Client ID</strong> — you'll use it to connect below</li>
            </ol>
          </div>
          <Button variant="outline" className="gap-2" onClick={() => toast.info('Google Calendar integration requires a Client ID. Follow the setup guide above.')}>
            <Calendar className="h-4 w-4" />
            {t('settings.connectGoogle')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
