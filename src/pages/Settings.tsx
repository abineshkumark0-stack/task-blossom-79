import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Smartphone } from 'lucide-react';
import { Sun, Moon, Bell, Calendar, Clock, BarChart3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useNotifications, NotificationPrefs } from '@/hooks/useNotifications';
import { useTasks } from '@/contexts/TaskContext';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { tasks } = useTasks();
  const { prefs, setPrefs, requestPermission } = useNotifications(tasks);

  const updatePref = <K extends keyof NotificationPrefs>(key: K, value: NotificationPrefs[K]) => {
    setPrefs(prev => ({ ...prev, [key]: value }));
    toast.success('Notification preference updated');
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
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            {theme === 'light' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            Appearance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Label>Dark Mode</Label>
            <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>
            {permissionStatus === 'granted'
              ? '✅ Browser notifications are enabled'
              : permissionStatus === 'denied'
              ? '❌ Notifications blocked — enable in browser settings'
              : '⚠️ Notifications not yet enabled'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {permissionStatus !== 'granted' && (
            <Button variant="outline" onClick={handleEnableNotifications} className="gap-2">
              <Bell className="h-4 w-4" />
              Enable Browser Notifications
            </Button>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label>Task Reminders</Label>
              <p className="text-xs text-muted-foreground">Get notified before tasks are due</p>
            </div>
            <Switch checked={prefs.enabled} onCheckedChange={(v) => updatePref('enabled', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Remind Before
              </Label>
              <p className="text-xs text-muted-foreground">How early to send the reminder</p>
            </div>
            <Select
              value={String(prefs.beforeMinutes)}
              onValueChange={(v) => updatePref('beforeMinutes', Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 minute</SelectItem>
                <SelectItem value="5">5 minutes</SelectItem>
                <SelectItem value="10">10 minutes</SelectItem>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary</Label>
              <p className="text-xs text-muted-foreground">Morning overview of today's tasks</p>
            </div>
            <Switch checked={prefs.dailySummary} onCheckedChange={(v) => updatePref('dailySummary', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Streak Alerts</Label>
              <p className="text-xs text-muted-foreground">Remind you to maintain your streak</p>
            </div>
            <Switch checked={prefs.streakAlerts} onCheckedChange={(v) => updatePref('streakAlerts', v)} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Goal Reminders</Label>
              <p className="text-xs text-muted-foreground">Progress updates for active goals</p>
            </div>
            <Switch checked={prefs.goalReminders} onCheckedChange={(v) => updatePref('goalReminders', v)} />
          </div>

          {'vibrate' in navigator && (
            <>
              <div className="border-t pt-4 mt-2">
                <div className="flex items-center gap-2 mb-3">
                  <Smartphone className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm font-medium">Mobile Vibration</Label>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Vibrate on Notifications</Label>
                      <p className="text-xs text-muted-foreground">Vibrate your phone when a reminder fires</p>
                    </div>
                    <Switch checked={prefs.vibration} onCheckedChange={(v) => updatePref('vibration', v)} />
                  </div>

                  {prefs.vibration && (
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Vibration Pattern</Label>
                        <p className="text-xs text-muted-foreground">Choose how the vibration feels</p>
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
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="double">Double tap</SelectItem>
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

      <Card className="glass-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-5 w-5" />
            Google Calendar Integration
          </CardTitle>
          <CardDescription>Connect to sync tasks with Google Calendar</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm space-y-3">
            <p className="font-medium">Setup Instructions:</p>
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
            Connect to Google Calendar
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
