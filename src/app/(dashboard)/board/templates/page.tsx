'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotesStore } from '@/store/useNotesStore';
import { useBoardStore } from '@/store/useBoardStore';
import { useTemplateStore, toTemplate, SavedTemplate } from '@/store/useTemplateStore';
import { TEMPLATES, TEMPLATE_CATEGORIES, Template, TemplateNote } from '@/lib/templates';
import toast from 'react-hot-toast';
import {
  Search, ArrowRight, Loader2, LayoutTemplate,
  Columns3, RotateCcw, Lightbulb, Calendar, Palette, Users,
  Star, X, Bookmark, Trash2, Clock, Eye
} from 'lucide-react';

const CAT_ICON: Record<string, React.ReactNode> = {
  all:        <LayoutTemplate size={13} />,
  kanban:     <Columns3   size={13} />,
  retro:      <RotateCcw  size={13} />,
  brainstorm: <Lightbulb  size={13} />,
  planning:   <Calendar   size={13} />,
  design:     <Palette    size={13} />,
  meeting:    <Users      size={13} />,
  saved:      <Bookmark   size={13} />,
};

const NOTE_COLORS: Record<string, string> = {
  yellow:'#fef6ca', green:'#c5ead1', blue:'#e3f0fe', pink:'#ffcce5', purple:'#e2c1f3',
  xanthous:'#F7B538', golden:'#FEC700', power:'#C3D809',
  sunset:'linear-gradient(135deg,#ffecd2,#fcb69f)',
  ocean:'linear-gradient(135deg,#e0c3fc,#8ec5fc)',
  aurora:'linear-gradient(135deg,#d4fc79,#96e6a1)',
};

const CAT_BADGE: Record<string, string> = {
  kanban:'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  retro:'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  brainstorm:'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  planning:'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  design:'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  meeting:'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  custom:'bg-theme-secondary text-theme-primary',
  saved:'bg-theme-secondary text-theme-primary',
};

function noteStyle(note: TemplateNote): React.CSSProperties {
  const c = NOTE_COLORS[note.color];
  const isG = c?.startsWith('linear');
  return {
    position:'absolute', left:note.position.x, top:note.position.y,
    width:note.size.width, height:note.size.height, borderRadius:10,
    border:note.isFrame?'2px dashed #94a3b8':'none',
    background:note.isFrame?'transparent':(!isG?(c||'#fef6ca'):undefined),
    backgroundImage:(!note.isFrame&&isG)?c:undefined,
    boxShadow:note.isFrame?'none':'0 2px 8px rgba(0,0,0,0.10)',
    padding:14, fontSize:15, fontWeight:600, color:'#374151', overflow:'hidden',
  };
}

function computeScale(notes: TemplateNote[], W: number, H: number) {
  if (!notes.length) return 0.25;
  const maxX = Math.max(...notes.map(n=>n.position.x+n.size.width),100);
  const maxY = Math.max(...notes.map(n=>n.position.y+n.size.height),100);
  return Math.min((W-40)/maxX,(H-40)/maxY,0.55);
}

export default function TemplatesPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch]     = useState('');
  const [loadingId, setLoadingId] = useState<string|null>(null);
  const [previewTpl, setPreviewTpl] = useState<Template|null>(null);

  const router = useRouter();
  const addNote = useNotesStore(s=>s.addNote);
  const createBoard = useBoardStore(s=>s.createBoard);
  const setActiveBoardId = useBoardStore(s=>s.setActiveBoardId);

  const {
    builtinFavorites, recentlyUsed, savedTemplates, isLoading,
    toggleBuiltinFavorite, addRecentlyUsed,
    fetchSavedTemplates, deleteCustomTemplate, toggleSavedFavorite,
  } = useTemplateStore();

  useEffect(() => { fetchSavedTemplates(); }, [fetchSavedTemplates]);

  // Merge: saved (DB) + builtin
  const savedAsTemplates = useMemo(() => savedTemplates.map(toTemplate), [savedTemplates]);
  const allTemplates = useMemo(() => [...savedAsTemplates, ...TEMPLATES], [savedAsTemplates]);

  // Determine if a template is a favorite
  const isFav = (t: Template) =>
    t.category === 'custom'
      ? savedTemplates.find(s=>s._id===t.id)?.isFavorite ?? false
      : builtinFavorites.includes(t.id);

  const toggleFav = async (t: Template) => {
    const currentlyFav = isFav(t);
    try {
      if (t.category === 'custom') await toggleSavedFavorite(t.id);
      else toggleBuiltinFavorite(t.id);
      toast.success(currentlyFav ? 'Removed from favorites' : 'Added to favorites');
    } catch {
      toast.error('Failed to update favorites');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomTemplate(id);
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const categories = useMemo(() => {
    const cats = [...TEMPLATE_CATEGORIES];
    if (savedTemplates.length > 0)
      cats.splice(1, 0, { id:'saved', label:'Saved', emoji:'🔖' });
    return cats;
  }, [savedTemplates]);

  const filtered = useMemo(() => {
    let list = allTemplates.filter(t => {
      const matchCat =
        activeCategory==='all'   ? true :
        activeCategory==='saved' ? t.category==='custom' :
        t.category===activeCategory;
      const q = search.toLowerCase();
      return matchCat && (t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q));
    });
    if (activeCategory==='all' && !search) {
      const fav = list.filter(t=>isFav(t));
      const rest = list.filter(t=>!isFav(t));
      list = [...fav, ...rest];
    }
    return list;
  }, [allTemplates, activeCategory, search, builtinFavorites, savedTemplates]);

  const recentTemplates = useMemo(
    ()=>recentlyUsed.map(id=>allTemplates.find(t=>t.id===id)).filter(Boolean) as Template[],
    [recentlyUsed, allTemplates]
  );

  async function handleUseTemplate(template: Template) {
    setLoadingId(template.id);
    setPreviewTpl(null);
    try {
      const board = await createBoard(template.name, template.emoji);
      setActiveBoardId(board._id);
      for (const note of template.notes) await addNote({...note, boardId:board._id});
      addRecentlyUsed(template.id);
      toast.success(`"${template.name}" loaded!`);
      router.push('/board');
    } catch { toast.error('Failed to load template'); }
    finally { setLoadingId(null); }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Header */}
      <div className="px-8 pt-7 pb-5 border-b border-border shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <LayoutTemplate size={20} className="text-theme-primary" />
            <h1 className="text-xl font-bold text-foreground tracking-tight">Templates</h1>
          </div>
          <div className="relative w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..."
              className="w-full h-8 pl-8 pr-3 rounded-lg bg-input-bg border border-border text-sm text-foreground placeholder:text-foreground/40 outline-none focus:border-theme-primary transition-colors"/>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat=>(
            <button key={cat.id} onClick={()=>setActiveCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeCategory===cat.id ? 'bg-theme-primary text-white' : 'bg-input-bg text-foreground/60 hover:text-foreground hover:bg-border'
              }`}
            >
              {CAT_ICON[cat.id]||<LayoutTemplate size={13}/>}{cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-5 flex flex-col gap-6">
        {/* Recently Used */}
        {recentTemplates.length>0 && !search && activeCategory==='all' && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock size={14} className="text-foreground/40"/>
              <span className="text-xs font-semibold text-foreground/50 uppercase tracking-wider">Recently Used</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentTemplates.map(t=>(
                <button key={t.id} onClick={()=>setPreviewTpl(t)}
                  className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-surface hover:border-theme-primary/40 hover:bg-input-bg transition-all text-left">
                  <span className="text-lg">{t.emoji}</span>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-none">{t.name}</p>
                    <p className="text-[10px] text-foreground/40 mt-0.5">{t.notes.length} notes</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Grid */}
        {isLoading && filtered.length===0 ? (
          <div className="flex items-center justify-center flex-1 gap-2 text-foreground/40">
            <Loader2 size={18} className="animate-spin"/> Loading...
          </div>
        ) : filtered.length===0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3 text-foreground/30">
            <Search size={32} strokeWidth={1.5}/><p className="text-sm">No templates found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(template=>(
              <TemplateCard
                key={template.id} template={template}
                loading={loadingId===template.id}
                isFavorite={isFav(template)}
                isCustom={template.category==='custom'}
                onUse={()=>handleUseTemplate(template)}
                onPreview={()=>setPreviewTpl(template)}
                onToggleFav={()=>toggleFav(template)}
                onDelete={template.category==='custom' ? ()=>handleDelete(template.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {previewTpl && (
        <PreviewModal
          template={previewTpl} loading={loadingId===previewTpl.id} isFavorite={isFav(previewTpl)}
          onClose={()=>setPreviewTpl(null)} onUse={()=>handleUseTemplate(previewTpl)} onToggleFav={()=>toggleFav(previewTpl)}
        />
      )}
    </div>
  );
}

function TemplateCard({ template, loading, isFavorite, isCustom, onUse, onPreview, onToggleFav, onDelete }:{
  template:Template; loading:boolean; isFavorite:boolean; isCustom:boolean;
  onUse:()=>void; onPreview:()=>void; onToggleFav:()=>void; onDelete?:()=>void;
}) {
  return (
    <div className="group relative bg-surface border border-border rounded-xl overflow-hidden hover:border-theme-primary/40 hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer" onClick={onPreview}>
      <button onClick={e=>{e.stopPropagation();onToggleFav();}}
        title={isFavorite ? "Remove from favorites" : "Add to favorites"}
        className={`absolute top-2 left-2 z-10 p-1.5 rounded-lg transition-all shadow-sm ${isFavorite?'text-theme-primary bg-theme-secondary':'text-white/90 opacity-0 group-hover:opacity-100 bg-black/40 backdrop-blur-sm hover:bg-black/60'}`}>
        <Star size={18} fill={isFavorite?'currentColor':'none'}/>
      </button>
      {isCustom && onDelete && (
        <button onClick={e=>{e.stopPropagation();onDelete();}}
          title="Delete custom template"
          className="absolute top-2 right-2 z-10 p-1.5 rounded-lg text-white/90 opacity-0 group-hover:opacity-100 bg-red-500/80 hover:bg-red-500 backdrop-blur-sm transition-all shadow-sm">
          <Trash2 size={16}/>
        </button>
      )}
      <div className="relative h-48 bg-input-bg overflow-hidden">
        <div className="absolute inset-0 scale-[0.25] origin-top-left" style={{width:'400%',height:'400%'}}>
          {template.notes.map((note,i)=><div key={i} style={noteStyle(note)}>{note.title}</div>)}
        </div>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex flex-col gap-3 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
          <button onClick={e=>{e.stopPropagation();onUse();}} disabled={loading}
            className="flex items-center justify-center gap-1.5 w-36 bg-white text-theme-primary font-semibold px-2 py-2 rounded-xl shadow-lg text-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-60">
            {loading?<><Loader2 size={15} className="animate-spin"/>Loading...</>:<>Use Template <ArrowRight size={15}/></>}
          </button>
          <button onClick={e=>{e.stopPropagation();onPreview();}}
            className="flex items-center justify-center gap-1.5 w-36 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md font-semibold px-2 py-2 rounded-xl shadow-lg text-sm hover:scale-105 active:scale-95 transition-all">
            <Eye size={15}/> Preview
          </button>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1">
        <div className="flex items-center gap-1.5">
          {isFavorite&&<Star size={11} className="text-theme-primary shrink-0" fill="currentColor"/>}
          <h3 className="font-semibold text-foreground text-sm leading-tight truncate">{template.name}</h3>
        </div>
        <p className="text-xs text-foreground/50 leading-relaxed line-clamp-2">{template.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md ${CAT_BADGE[template.category]||'bg-input-bg text-foreground/50'}`}>
            {CAT_ICON[template.category]||<LayoutTemplate size={11}/>}
            {template.category==='custom'?'Saved':template.category}
          </span>
          <span className="text-[11px] text-foreground/40">{template.notes.length} notes</span>
        </div>
      </div>
    </div>
  );
}

function PreviewModal({ template, loading, isFavorite, onClose, onUse, onToggleFav }:{
  template:Template; loading:boolean; isFavorite:boolean;
  onClose:()=>void; onUse:()=>void; onToggleFav:()=>void;
}) {
  const W=760, H=440;
  const scale = computeScale(template.notes, W, H);
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col" onClick={e=>e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{template.emoji}</span>
            <div>
              <h2 className="font-bold text-lg text-foreground leading-none">{template.name}</h2>
              <p className="text-sm text-foreground/50 mt-0.5">{template.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onToggleFav}
              className={`p-2 rounded-lg transition-all ${isFavorite?'text-theme-primary bg-theme-secondary':'text-foreground/40 hover:text-foreground hover:bg-input-bg'}`}>
              <Star size={16} fill={isFavorite?'currentColor':'none'}/>
            </button>
            <button onClick={onClose} className="p-2 rounded-lg text-foreground/40 hover:text-foreground hover:bg-input-bg transition-colors"><X size={16}/></button>
          </div>
        </div>
        <div className="bg-input-bg relative overflow-hidden" style={{height:H}}>
          <div className="absolute inset-0 opacity-30" style={{backgroundImage:'radial-gradient(circle, #94a3b8 1px, transparent 1px)',backgroundSize:'24px 24px'}}/>
          <div style={{position:'absolute',inset:0,transform:`scale(${scale})`,transformOrigin:'top left',width:`${100/scale}%`,height:`${100/scale}%`}}>
            {template.notes.map((note,i)=><div key={i} style={noteStyle(note)}>{note.title}</div>)}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg ${CAT_BADGE[template.category]||'bg-input-bg text-foreground/50'}`}>
              {CAT_ICON[template.category]}{template.category==='custom'?'Saved':template.category}
            </span>
            <span className="text-xs text-foreground/40">{template.notes.length} notes</span>
          </div>
          <button onClick={onUse} disabled={loading}
            className="flex items-center gap-2 bg-theme-primary text-white font-semibold px-5 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60 text-sm">
            {loading?<><Loader2 size={15} className="animate-spin"/>Loading...</>:<>Use Template<ArrowRight size={15}/></>}
          </button>
        </div>
      </div>
    </div>
  );
}
