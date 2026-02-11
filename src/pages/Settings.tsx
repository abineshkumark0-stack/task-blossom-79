import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, Bell, Calendar } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();

  const handleNotificationPermission = async () => {
    if (!('Notification' in window)) {
      toast.error('Browser notifications not supported');
      return;
    }
    const result = await Notification.requestPermission();
    if (result === 'granted') toast.success('Notifications enabled!');
    else toast.info('Notifications permission denied');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight">Settings</h1>

      <Card>
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Enable browser notifications to receive reminders for your tasks.
          </p>
          <Button variant="outline" onClick={handleNotificationPermission}>
            Enable Notifications
          </Button>
        </CardContent>
      </Card>

      <Card>
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
