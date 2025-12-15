"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarInput,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from "recharts";
import { Bell, Search, LayoutDashboard, Users as UsersIcon, ShoppingCart, BarChart3, Plus, Send, Filter, Calendar as CalendarIcon } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/app/hooks/use-Mobile";
import Cookies from "js-cookie";

export default function AdminPage() {
  const router = useRouter();
  const API_PREFIX = process.env.NEXT_PUBLIC_API_BASE ? process.env.NEXT_PUBLIC_API_BASE.replace(/\/$/, '') : '/api';
  const isMobile = useIsMobile();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [items, setItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard"); // 'dashboard' | 'notifications'
  const [priority, setPriority] = useState("normal");
  const [channel, setChannel] = useState("push");
  const [audience, setAudience] = useState("all");
  const [sendNow, setSendNow] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [scheduleDate, setScheduleDate] = useState(null);
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [dateOpen, setDateOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [prefs, setPrefs] = useState({ push: true, email: true, sms: false });
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [testTitle, setTestTitle] = useState("");
  const [testMessage, setTestMessage] = useState("");
  const [testChannel, setTestChannel] = useState("push");
  const [testTarget, setTestTarget] = useState("");
  const [viewOpen, setViewOpen] = useState(false);
  const [viewLoading, setViewLoading] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [viewError, setViewError] = useState("");

  function handleLogout() {
    // Clear admin session
    localStorage.removeItem("admin");
    // Redirect to auth page
    router.push("/admin/auth");
  }

  const kpis = [
    { key: "customers", label: "Customers", value: 3782, delta: "+11.01%", positive: true },
    { key: "orders", label: "Orders", value: 5359, delta: "-9.05%", positive: false },
    { key: "target", label: "Monthly Target", value: 75.55 },
  ];

  const salesData = [
    { name: "Jan", value: 120 },
    { name: "Feb", value: 180 },
    { name: "Mar", value: 90 },
    { name: "Apr", value: 210 },
    { name: "May", value: 160 },
    { name: "Jun", value: 140 },
    { name: "Jul", value: 190 },
    { name: "Aug", value: 220 },
    { name: "Sep", value: 170 },
    { name: "Oct", value: 200 },
    { name: "Nov", value: 230 },
    { name: "Dec", value: 80 },
  ];

  const statData = [
    { name: "Jan", uv: 160, pv: 90 },
    { name: "Feb", uv: 175, pv: 80 },
    { name: "Mar", uv: 155, pv: 70 },
    { name: "Apr", uv: 165, pv: 95 },
    { name: "May", uv: 170, pv: 85 },
    { name: "Jun", uv: 150, pv: 65 },
    { name: "Jul", uv: 155, pv: 70 },
    { name: "Aug", uv: 180, pv: 95 },
    { name: "Sep", uv: 190, pv: 110 },
    { name: "Oct", uv: 210, pv: 130 },
    { name: "Nov", uv: 220, pv: 140 },
    { name: "Dec", uv: 215, pv: 135 },
  ];

  useEffect(() => {
    setCalendarMonth(scheduleDate || new Date());
  }, [scheduleDate]);

  function handleCalendarWheel(e) {
    e.preventDefault();
    const dir = e.deltaY > 0 ? 1 : -1;
    const next = new Date(calendarMonth);
    next.setMonth(calendarMonth.getMonth() + dir);
    setCalendarMonth(next);
  }

  async function viewScheduled(id) {
    setViewError("");
    setViewLoading(true);
    setViewOpen(true);
    try {
      const res = await fetch(`${API_PREFIX}/notifications/schedule/${id}`, {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Failed to load");
      }
      const data = await res.json();
      setViewItem(data);
    } catch (e) {
      setViewError(e.message || "Failed to load");
    } finally {
      setViewLoading(false);
    }
  }

  function toLocalDateTimeString(date, time) {
    if (!date || !time) return "";
    const [hh, mm] = time.split(":");
    const d = new Date(date);
    d.setHours(Number(hh), Number(mm), 0, 0);
    const yyyy = d.getFullYear();
    const mon = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    return `${yyyy}-${mon}-${day}T${h}:${m}`;
  }

  useEffect(() => {
    if (!sendNow && scheduleDate && scheduleTime) {
      setScheduledAt(toLocalDateTimeString(scheduleDate, scheduleTime));
    }
  }, [scheduleDate, scheduleTime, sendNow]);

  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  function setQuickDate(kind) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (kind === 'today') {
      setScheduleDate(new Date(now));
    } else if (kind === 'tomorrow') {
      const d = new Date(now);
      d.setDate(d.getDate() + 1);
      setScheduleDate(d);
    } else if (kind === 'next_week') {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      setScheduleDate(d);
    } else if (kind === 'in_1_hour') {
      const d = new Date();
      const minutes = d.getMinutes();
      const rounded = Math.ceil(minutes / 15) * 15;
      d.setMinutes(rounded, 0, 0);
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      setScheduleDate(new Date(now));
      setScheduleTime(`${hh}:${mm}`);
    }
  }

  async function loadPreferences() {
    setPrefsLoading(true);
    try {
      const res = await fetch(`${API_PREFIX}/notifications/preferences`, {
        method: "GET",
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          setPrefs((prev) => ({ ...prev, ...data }));
        }
      }
    } catch (e) {
      // silent
    } finally {
      setPrefsLoading(false);
    }
  }

  async function savePreferences() {
    setSavingPrefs(true);
    try {
      const res = await fetch(`${API_PREFIX}/notifications/preferences`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(prefs),
      });
      if (!res.ok) throw new Error("Failed");
      toast({ title: "Preferences saved" });
    } catch (e) {
      toast({ title: "Error", description: "Failed to save preferences" });
    } finally {
      setSavingPrefs(false);
    }
  }

  async function handleSendTest(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${API_PREFIX}/notifications/send-test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title: testTitle, message: testMessage, channel: testChannel, target: testTarget }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d?.error || "Send failed");
      }
      toast({ title: "Sent", description: "Test notification sent" });
      setTestTitle("");
      setTestMessage("");
      setTestTarget("");
    } catch (e) {
      toast({ title: "Error", description: e.message || "Send failed" });
    }
  }

  useEffect(() => {
    if (activeTab === "notifications") {
      loadPreferences();
    }
  }, [activeTab]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const finalScheduledAt = sendNow ? new Date().toISOString() : scheduledAt;
      const res = await fetch(`${API_PREFIX}/notifications/schedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title, message, scheduledAt: finalScheduledAt }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(data?.error || "Request failed");
      }
      const data = await res.json();
      const enriched = { ...data, channel, priority, audience };
      setItems((prev) => [enriched, ...prev]);
      setTitle("");
      setMessage("");
      setScheduledAt("");
      toast({ title: "Scheduled", description: "Notification has been scheduled successfully." });
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function cancelNotification(id) {
    try {
      const res = await fetch(`${API_PREFIX}/notifications/schedule/${id}/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Cancel failed");
      }
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: "canceled" } : n)));
      toast({ title: "Canceled", description: "Notification has been canceled." });
    } catch (e) {
      toast({ title: "Error", description: e.message || "Cancel failed" });
    }
  }

  const filteredItems = items.filter((n) => {
    const matchesStatus = statusFilter === "all" || n.status === statusFilter;
    const matchesQuery = !query || n.title?.toLowerCase().includes(query.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <LayoutDashboard className="h-5 w-5" />
            <span className="font-semibold">Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "dashboard"} onClick={() => setActiveTab("dashboard")}>
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <UsersIcon className="h-4 w-4" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <ShoppingCart className="h-4 w-4" />
                    <span>Orders</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "notifications"} onClick={() => setActiveTab("notifications")}>
                    <Bell className="h-4 w-4" />
                    <span>Notifications</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <div className="relative ml-1 w-full max-w-xl">
            <SidebarInput placeholder="Search or type a command..." />
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>Logout</Button>
            <Avatar>
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="p-4 md:p-6 space-y-6">
          {activeTab === "dashboard" && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {kpis.map((kpi) => (
                  <Card key={kpi.key}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {kpi.key === "target" ? (
                        <div className="space-y-2">
                          <div className="text-3xl font-semibold">{kpi.value.toFixed(2)}%</div>
                          <Progress value={kpi.value} />
                        </div>
                      ) : (
                        <div className="flex items-end justify-between">
                          <div className="text-3xl font-semibold">{kpi.value.toLocaleString()}</div>
                          <span className={kpi.positive ? "text-green-500 text-sm" : "text-red-500 text-sm"}>{kpi.delta}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Monthly Sales</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ value: { label: "Sales", color: "hsl(var(--glimz-primary))" } }}>
                      <BarChart data={salesData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <ChartTooltip cursor={{ fill: "hsl(var(--muted))" }} content={<ChartTooltipContent hideLabel />} />
                        <Bar dataKey="value" fill="var(--color-value)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistics (Monthly)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={{ uv: { label: "UV", color: "hsl(var(--glimz-primary))" }, pv: { label: "PV", color: "hsl(var(--glimz-secondary))" } }}>
                      <AreaChart data={statData}>
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis dataKey="name" tickLine={false} axisLine={false} />
                        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                        <Area dataKey="uv" type="monotone" fill="var(--color-uv)" stroke="var(--color-uv)" fillOpacity={0.2} />
                        <Line dataKey="pv" type="monotone" stroke="var(--color-pv)" strokeWidth={2} dot={false} />
                      </AreaChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Customers Demographic</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm"><span>USA</span><span>79%</span></div>
                      <Progress value={79} />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm"><span>France</span><span>23%</span></div>
                      <Progress value={23} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Recent Orders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Macbook Pro 13"</TableCell>
                          <TableCell>Laptop</TableCell>
                          <TableCell>$2399.00</TableCell>
                          <TableCell className="text-green-500">Delivered</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Apple Watch Ultra</TableCell>
                          <TableCell>Watch</TableCell>
                          <TableCell>$879.00</TableCell>
                          <TableCell className="text-yellow-400">Pending</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>iPhone 15 Pro Max</TableCell>
                          <TableCell>SmartPhone</TableCell>
                          <TableCell>$1369.00</TableCell>
                          <TableCell className="text-green-500">Delivered</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>iPad Pro 3rd Gen</TableCell>
                          <TableCell>Electronics</TableCell>
                          <TableCell>$1699.00</TableCell>
                          <TableCell className="text-red-500">Canceled</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-2 w-full sm:max-w-sm">
                      <Input placeholder="Search notifications..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Schedule Notification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification title" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea id="message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message" rows={4} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Channel</Label>
                          <Select value={channel} onValueChange={setChannel}>
                            <SelectTrigger><SelectValue placeholder="Channel" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="push">Push</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="sms">SMS</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Priority</Label>
                          <Select value={priority} onValueChange={setPriority}>
                            <SelectTrigger><SelectValue placeholder="Priority" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Audience</Label>
                          <Select value={audience} onValueChange={setAudience}>
                            <SelectTrigger><SelectValue placeholder="Audience" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Users</SelectItem>
                              <SelectItem value="creators">Creators</SelectItem>
                              <SelectItem value="users">Viewers</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Send Now</Label>
                          <div className="flex items-center gap-2 h-10">
                            <Switch checked={sendNow} onCheckedChange={setSendNow} />
                            <span className="text-sm text-muted-foreground">If off, pick a date below</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Date</Label>
                          <Popover open={dateOpen} onOpenChange={setDateOpen}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" className="w-full justify-start text-left font-normal" disabled={sendNow}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {scheduleDate ? scheduleDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="p-2 bg-white dark:bg-neutral-900 border shadow-md w-[90vw] max-w-[320px] sm:w-[300px] max-h-[420px] overflow-y-auto" align="start">
                              <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                  <Button size="sm" variant="secondary" onClick={() => setQuickDate('today')}>Today</Button>
                                  <Button size="sm" variant="secondary" onClick={() => setQuickDate('tomorrow')}>Tomorrow</Button>
                                  <Button size="sm" variant="secondary" onClick={() => setQuickDate('next_week')}>Next Week</Button>
                                  <Button size="sm" variant="outline" onClick={() => setQuickDate('in_1_hour')}>+1 hour</Button>
                                  <Button size="sm" variant="ghost" onClick={() => { setScheduleDate(null); }}>Clear</Button>
                                </div>
                                <div onWheel={handleCalendarWheel} className="select-none">
                                  <Calendar
                                    mode="single"
                                    numberOfMonths={1}
                                    month={calendarMonth}
                                    onMonthChange={setCalendarMonth}
                                    selected={scheduleDate}
                                    onSelect={(d) => { setScheduleDate(d); if (isMobile) setDateOpen(false); }}
                                    showOutsideDays
                                    initialFocus
                                    disabled={{ before: new Date(new Date().setHours(0, 0, 0, 0)) }}
                                    captionLayout="dropdown-buttons"
                                    className="p-2"
                                    classNames={{
                                      day: "h-8 w-8 p-0 text-xs",
                                      head_cell: "w-8 text-[10px]",
                                      cell: "h-8 w-8",
                                      caption_label: "text-xs",
                                      nav_button: "h-6 w-6",
                                    }}
                                  />
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="grid gap-2">
                          <Label>Time</Label>
                          <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} disabled={sendNow} />
                          <div className="text-[11px] text-muted-foreground">Time zone: {tz}</div>
                        </div>
                      </div>
                      {error ? (
                        <div className="text-sm text-red-500">{error}</div>
                      ) : null}
                      <div className="pt-4 mt-2 border-t">
                        <div className="text-sm font-medium mb-3">Notification Preferences</div>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">Push</div>
                              <div className="text-xs text-muted-foreground">Receive in-app push alerts</div>
                            </div>
                            <Switch checked={!!prefs.push} onCheckedChange={(v) => setPrefs((p) => ({ ...p, push: v }))} disabled={prefsLoading || savingPrefs} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">Email</div>
                              <div className="text-xs text-muted-foreground">Send updates to email</div>
                            </div>
                            <Switch checked={!!prefs.email} onCheckedChange={(v) => setPrefs((p) => ({ ...p, email: v }))} disabled={prefsLoading || savingPrefs} />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">SMS</div>
                              <div className="text-xs text-muted-foreground">Send SMS notifications</div>
                            </div>
                            <Switch checked={!!prefs.sms} onCheckedChange={(v) => setPrefs((p) => ({ ...p, sms: v }))} disabled={prefsLoading || savingPrefs} />
                          </div>
                          <div className="flex justify-end">
                            <Button type="button" onClick={savePreferences} disabled={savingPrefs}>{savingPrefs ? "Saving..." : "Save Preferences"}</Button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button type="submit" disabled={!title || !message || (!sendNow && !scheduledAt) || submitting}>
                          {submitting ? "Scheduling..." : (<span className="inline-flex items-center gap-2"><Send className="h-4 w-4" />Schedule</span>)}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Scheduled Notifications</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Scheduled At</TableHead>
                          <TableHead>Channel</TableHead>
                          <TableHead>Priority</TableHead>
                          <TableHead>Audience</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredItems.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={7} className="text-muted-foreground">No scheduled notifications</TableCell>
                          </TableRow>
                        ) : (
                          filteredItems.map((i) => (
                            <TableRow key={i.id}>
                              <TableCell>{i.title}</TableCell>
                              <TableCell>{new Date(i.scheduledAt).toLocaleString()}</TableCell>
                              <TableCell><Badge variant="outline" className="capitalize">{i.channel || "push"}</Badge></TableCell>
                              <TableCell><Badge className="capitalize" variant={i.priority === "high" ? "destructive" : i.priority === "normal" ? "secondary" : "outline"}>{i.priority || "normal"}</Badge></TableCell>
                              <TableCell className="capitalize">{i.audience || "all"}</TableCell>
                              <TableCell>
                                {i.status === "canceled" ? (
                                  <Badge variant="destructive">Canceled</Badge>
                                ) : (
                                  <Badge variant="secondary" className="capitalize">{i.status || "scheduled"}</Badge>
                                )}
                              </TableCell>
                              <TableCell className="space-x-2">
                                <Button variant="outline" size="sm" onClick={() => viewScheduled(i.id)}>View</Button>
                                {i.status !== "canceled" && (
                                  <Button variant="outline" size="sm" onClick={() => cancelNotification(i.id)}>Cancel</Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
              <Dialog open={viewOpen} onOpenChange={setViewOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Scheduled Notification</DialogTitle>
                    <DialogDescription>
                      View details of the scheduled notification.
                    </DialogDescription>
                  </DialogHeader>
                  {viewLoading ? (
                    <div className="text-sm text-muted-foreground">Loading...</div>
                  ) : viewError ? (
                    <div className="text-sm text-red-500">{viewError}</div>
                  ) : viewItem ? (
                    <div className="space-y-3">
                      <div className="text-sm"><span className="font-medium">Title:</span> {viewItem.title || "-"}</div>
                      <div className="text-sm"><span className="font-medium">Message:</span> {viewItem.message || "-"}</div>
                      <div className="text-sm"><span className="font-medium">Scheduled At:</span> {viewItem.scheduledAt ? new Date(viewItem.scheduledAt).toLocaleString() : "-"}</div>
                      <div className="flex gap-2 items-center text-sm">
                        <Badge variant="outline" className="capitalize">{(viewItem.channel || viewItem.channelType || channel || "push")}</Badge>
                        <Badge className="capitalize" variant={(viewItem.priority || priority) === "high" ? "destructive" : (viewItem.priority || priority) === "normal" ? "secondary" : "outline"}>{viewItem.priority || priority || "normal"}</Badge>
                        <Badge variant="secondary" className="capitalize">{viewItem.audience || audience || "all"}</Badge>
                        <Badge variant={viewItem.status === "canceled" ? "destructive" : "secondary"} className="capitalize">{viewItem.status || "scheduled"}</Badge>
                      </div>
                    </div>
                  ) : null}
                </DialogContent>
              </Dialog>
              <Toaster />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
