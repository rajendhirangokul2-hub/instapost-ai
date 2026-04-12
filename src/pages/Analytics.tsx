import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, BarChart3, Star, TrendingUp, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AnalyticsExport from "@/components/AnalyticsExport";
import { format, subDays, startOfDay } from "date-fns";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["hsl(var(--primary))", "hsl(var(--accent))", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

interface SavedPost {
  created_at: string;
  template_name: string;
  format: string;
}

const Analytics = () => {
  const [posts, setPosts] = useState<SavedPost[]>([]);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    fetchData();
  }, [user]);

  const fetchData = async () => {
    const [saved, scheduled] = await Promise.all([
      supabase.from("saved_posts").select("created_at, template_name, format"),
      supabase.from("scheduled_posts").select("id", { count: "exact", head: true }),
    ]);
    if (saved.data) setPosts(saved.data as SavedPost[]);
    setScheduledCount(scheduled.count ?? 0);
    setLoading(false);
  };

  // Stats
  const totalPosts = posts.length;

  // Template usage
  const templateMap = new Map<string, number>();
  posts.forEach((p) => templateMap.set(p.template_name, (templateMap.get(p.template_name) || 0) + 1));
  const templateData = [...templateMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 7)
    .map(([name, count]) => ({ name, count }));
  const topTemplate = templateData[0]?.name ?? "—";

  // Format distribution
  const formatMap = new Map<string, number>();
  posts.forEach((p) => formatMap.set(p.format, (formatMap.get(p.format) || 0) + 1));
  const formatData = [...formatMap.entries()].map(([name, value]) => ({ name, value }));

  // Daily trend (last 30 days)
  const last30 = subDays(new Date(), 30);
  const dayMap = new Map<string, number>();
  for (let i = 0; i < 30; i++) {
    dayMap.set(format(subDays(new Date(), i), "MMM d"), 0);
  }
  posts.forEach((p) => {
    const d = new Date(p.created_at);
    if (d >= startOfDay(last30)) {
      const key = format(d, "MMM d");
      dayMap.set(key, (dayMap.get(key) || 0) + 1);
    }
  });
  const trendData = [...dayMap.entries()].reverse().map(([date, count]) => ({ date, count }));

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-8 flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-display text-2xl font-bold text-foreground">Analytics</h2>
          <div className="ml-auto">
            <AnalyticsExport data={{ totalPosts, topTemplate, templatesUsed: templateMap.size, scheduledCount, templateData, formatData, trendData }} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Stat Cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={<FileText className="h-5 w-5" />} label="Total Posts" value={totalPosts} />
              <StatCard icon={<Star className="h-5 w-5" />} label="Top Template" value={topTemplate} />
              <StatCard icon={<BarChart3 className="h-5 w-5" />} label="Templates Used" value={templateMap.size} />
              <StatCard icon={<TrendingUp className="h-5 w-5" />} label="Scheduled" value={scheduledCount} />
            </div>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generation Trend (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" className="fill-muted-foreground" />
                      <YAxis allowDecimals={false} className="fill-muted-foreground" />
                      <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Template Usage */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Most Used Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  {templateData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet</p>
                  ) : (
                    <div className="space-y-3">
                      {templateData.map((t, i) => (
                        <div key={t.name} className="flex items-center gap-3">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="flex-1 text-sm text-foreground truncate">{t.name}</span>
                          <span className="text-sm font-semibold text-foreground">{t.count}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Format Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Format Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={formatData} cx="50%" cy="50%" innerRadius={40} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                          {formatData.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", color: "hsl(var(--foreground))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-xl font-bold text-foreground truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default Analytics;
