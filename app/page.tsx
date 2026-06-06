"use client";
import { useState, useEffect, FormEvent } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useSession, signOut } from "next-auth/react";
import { 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Archive, 
  Search, 
  LayoutDashboard, 
  Settings, 
  User,
  MoreVertical,
  PlusCircle,
  Command
} from "lucide-react";

interface Thing {
  _id: string;
  title: string;
  description: string;
  dateAcquired?: string;
  createdAt: string;
  updatedAt: string;
}

function getAge(dateString: string) {
  const diffTime = Math.max(0, new Date().getTime() - new Date(dateString).getTime());
  const diffSeconds = Math.floor(diffTime / 1000);
  
  if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds !== 1 ? 's' : ''} old`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} old`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} old`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} old`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffDays < 30) return `${diffWeeks} week${diffWeeks !== 1 ? 's' : ''} old`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} old`;
  const diffYears = Math.floor(diffDays / 365.25);
  return `${diffYears} year${diffYears !== 1 ? 's' : ''} old`;
}

function AgeBadge({ dateString }: { dateString: string }) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <span suppressHydrationWarning className="shrink-0 inline-flex items-center px-2.5 py-1 rounded-full bg-current/10 border border-current/20 text-[10px] font-black uppercase tracking-wider shadow-sm mb-1">
      {getAge(dateString)}
    </span>
  );
}

export default function Home() {
  const { data: session } = useSession();
  const [things, setThings] = useState<Thing[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dateAcquired, setDateAcquired] = useState<Date | undefined>(undefined);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDateAcquired, setEditDateAcquired] = useState<Date | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchThings = async () => {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      setThings(data.items || []);
    } catch (error) {
      console.error("Failed to fetch things:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchThings();
    }
  }, [session]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!title) return;

    await fetch("/api/items", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ title, description, dateAcquired: dateAcquired ? dateAcquired.toISOString() : undefined }),
    });

    setTitle("");
    setDescription("");
    setDateAcquired(undefined);
    setIsAddOpen(false);
    toast.success("Thing added to your collection!");
    fetchThings();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/items/${id}`, { method: "DELETE" });
    toast.error("Thing deleted from your collection.");
    fetchThings();
  };

  const startEdit = (thing: Thing) => {
    setEditId(thing._id);
    setEditTitle(thing.title);
    setEditDescription(thing.description);
    
    if (thing.dateAcquired) {
      setEditDateAcquired(new Date(thing.dateAcquired));
    } else {
      setEditDateAcquired(undefined);
    }
    
    setIsEditOpen(true);
  };

  const handleEdit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editId || !editTitle) return;
    await fetch(`/api/items/${editId}`, {
      method: "PATCH",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ title: editTitle, description: editDescription, dateAcquired: editDateAcquired ? editDateAcquired.toISOString() : undefined }),
    });
    setEditId(null);
    setIsEditOpen(false);
    toast.success("Thing updated!");
    fetchThings();
  };

  const getCardStyle = (id: string) => {
    const styles = [
      "bg-blue-500/10 border-blue-400/20 text-blue-200",
      "bg-emerald-500/10 border-emerald-400/20 text-emerald-200",
      "bg-amber-500/10 border-amber-400/20 text-amber-200",
      "bg-purple-500/10 border-purple-400/20 text-purple-200",
      "bg-pink-500/10 border-pink-400/20 text-pink-200",
      "bg-indigo-500/10 border-indigo-400/20 text-indigo-200",
      "bg-rose-500/10 border-rose-400/20 text-rose-200",
      "bg-cyan-500/10 border-cyan-400/20 text-cyan-200",
    ];
    // Deterministic selection based on the ID string
    const charCodeSum = id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return styles[charCodeSum % styles.length];
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
      
      {/* Top Header */}
      <header className="h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto h-full px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary h-7 w-7 rounded-md flex items-center justify-center text-primary-foreground shadow-sm">
              <Command className="h-4 w-4" />
            </div>
            <span className="font-bold tracking-tight text-base hidden sm:inline-block">My Things</span>
          </div>

          <div className="flex items-center gap-4">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="h-8 font-bold gap-1.5 px-3">
                  <Plus className="h-3.5 w-3.5" /> New Thing
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-card border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
                <DialogHeader className="px-6 pt-6 pb-4 bg-secondary/10 border-b border-border/20">
                  <DialogTitle className="text-lg font-black tracking-tight">Create New Thing</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Title</label>
                    <Input 
                      placeholder="e.g. My Favorite Watch" 
                      className="h-10 bg-secondary/20 border-border/40 text-sm focus:ring-1 focus:ring-primary/30 rounded-xl"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Description</label>
                    <Textarea 
                      placeholder="Add a short note..." 
                      className="min-h-[80px] resize-none bg-secondary/20 border-border/40 text-sm focus:ring-1 focus:ring-primary/30 rounded-xl"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Date Acquired</label>
                    <DateTimePicker date={dateAcquired} setDate={setDateAcquired} />
                  </div>
                  <Button type="submit" className="w-full h-10 font-black text-[11px] uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-primary/10">
                    Save Record
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <div className="h-4 w-px bg-border mx-1" />

            <div className="flex items-center gap-3">
              <div className="hidden md:block mr-2">
                <p className="text-sm font-black tracking-tight">{session.user?.name}</p>
              </div>
              <button 
                onClick={() => signOut()} 
                className="h-8 w-8 rounded-full bg-secondary hover:bg-secondary/80 flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors border border-border/50"
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 py-8 md:py-12 bg-background/50 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 md:px-10 space-y-8">
          
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight">Your Collection</h2>
            <span className="h-1.5 w-1.5 rounded-full bg-primary/20" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest opacity-60">{things.length} saved</p>
          </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <Card key={i} className="animate-pulse h-32" />
                ))}
              </div>
            ) : things.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 bg-card/30 border border-dashed border-border/40 rounded-xl gap-4">
                <div className="bg-secondary p-3 rounded-full">
                  <Archive className="h-6 w-6 text-muted-foreground/60" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-muted-foreground/80">No things yet</p>
                  <p className="text-xs text-muted-foreground/60">Add your first item to see it here.</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => setIsAddOpen(true)} className="h-8 border-border/40">
                  Add Item
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {things
                  .slice()
                  .sort((a, b) => {
                    const timeA = new Date(a.dateAcquired || a.createdAt).getTime();
                    const timeB = new Date(b.dateAcquired || b.createdAt).getTime();
                    // Sort descending by time (newest/youngest items first)
                    return timeB - timeA;
                  })
                  .map((thing) => (
                    <div
                      key={thing._id}
                    className={`group relative flex flex-col justify-between p-4 border transition-all duration-300 rounded-xl min-h-[110px] hover:scale-[1.01] hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)] ${getCardStyle(thing._id)}`}
                  >
                    <div className="flex flex-col gap-3 overflow-hidden">
                      <h3 className="text-lg font-black tracking-tight leading-tight text-foreground line-clamp-2">
                        {thing.title}
                      </h3>
                      
                      {thing.description && (
                        <p className="text-sm text-foreground/80 line-clamp-3 leading-snug font-medium">
                          {thing.description}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-end justify-between mt-4">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button 
                            onClick={() => startEdit(thing)}
                            className="p-1.5 hover:bg-white/10 rounded-md transition-colors bg-current/5"
                            title="Edit"
                          >
                            <Edit3 className="h-3 w-3" />
                          </button>
                          <button 
                            onClick={() => handleDelete(thing._id)}
                            className="p-1.5 hover:bg-destructive/20 hover:text-destructive rounded-md transition-colors bg-current/5"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                        <div className="text-[8px] text-muted-foreground/60 font-black uppercase tracking-widest min-h-[12px]">
                          {thing.updatedAt !== thing.createdAt && (
                            <span suppressHydrationWarning>Edited {new Date(thing.updatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          )}
                        </div>
                      </div>

                      <AgeBadge dateString={thing.dateAcquired || thing.createdAt} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] bg-card border-border shadow-2xl p-0 overflow-hidden rounded-2xl">
          <DialogHeader className="px-6 pt-6 pb-4 bg-secondary/10 border-b border-border/20">
            <DialogTitle className="text-lg font-black tracking-tight">Edit Thing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Title</label>
              <Input 
                className="h-10 bg-secondary/20 border-border/40 text-sm focus:ring-1 focus:ring-primary/30 rounded-xl"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Description</label>
              <Textarea 
                className="min-h-[80px] resize-none bg-secondary/20 border-border/40 text-sm focus:ring-1 focus:ring-primary/30 rounded-xl"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Date Acquired</label>
              <DateTimePicker date={editDateAcquired} setDate={setEditDateAcquired} />
            </div>
            <Button type="submit" className="w-full h-10 font-black text-[11px] uppercase tracking-[0.15em] rounded-xl shadow-lg shadow-primary/10">
              Update Record
            </Button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
