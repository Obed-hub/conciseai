import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Bell, Shield, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";

interface SettingsModalProps {
    children: React.ReactNode;
}

export function SettingsModal({ children }: SettingsModalProps) {
    const { setTheme, theme } = useTheme();
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(true);

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Settings</DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-4">

                    {/* Appearance Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Monitor className="w-4 h-4" /> Appearance
                        </h3>
                        <div className="grid gap-4 pl-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="theme" className="text-sm font-normal">Theme</Label>
                                <div className="flex gap-2">
                                    <Button
                                        variant={theme === 'light' ? 'default' : 'outline'}
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setTheme('light')}
                                    >
                                        <Sun className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={theme === 'dark' ? 'default' : 'outline'}
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setTheme('dark')}
                                    >
                                        <Moon className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant={theme === 'system' ? 'default' : 'outline'}
                                        size="icon"
                                        className="w-8 h-8"
                                        onClick={() => setTheme('system')}
                                    >
                                        <Monitor className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* Notifications Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Bell className="w-4 h-4" /> Notifications
                        </h3>
                        <div className="grid gap-4 pl-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="notifications" className="text-sm font-normal">Enable Notifications</Label>
                                <Switch
                                    id="notifications"
                                    checked={notifications}
                                    onCheckedChange={setNotifications}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="sound" className="text-sm font-normal">Sound Effects</Label>
                                <Switch
                                    id="sound"
                                    checked={sound}
                                    onCheckedChange={setSound}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border/50" />

                    {/* Privacy Section */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <Shield className="w-4 h-4" /> Privacy
                        </h3>
                        <div className="grid gap-4 pl-6">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="language" className="text-sm font-normal">Data Usage</Label>
                                <Select defaultValue="minimal">
                                    <SelectTrigger className="w-[180px] h-8">
                                        <SelectValue placeholder="Select usage" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="minimal">Minimal</SelectItem>
                                        <SelectItem value="standard">Standard</SelectItem>
                                        <SelectItem value="full">Full Experience</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                </div>
            </DialogContent>
        </Dialog>
    );
}
