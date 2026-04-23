import { useEffect, useState } from 'react'
import { Lightbulb, ThumbsUp, ThumbsDown, MessageCircle, Plus, Send, Filter, TrendingUp, CheckCircle, Search, X, FileQuestion } from 'lucide-react'
import toast from 'react-hot-toast'
import { useForm } from 'react-hook-form'

const statusLabels = { submitted: 'Submitted', under_review: 'Under Review', adopted: 'Adopted', implemented: 'Implemented' }
const statusOrder = ['submitted', 'under_review', 'adopted', 'implemented']
const tagOptions = ['Tech Solution', 'Community Action', 'Policy Change', 'Logistics', 'Communication', 'Health', 'Food Security', 'Data Analysis']

export default function InnovationHub() {
  const [ideas, setIdeas] = useState([])
  const [tab, setTab] = useState('top')
  const [showForm, setShowForm] = useState(false)
  const [filterTag, setFilterTag] = useState('')
  const [search, setSearch] = useState('')
  const [expandedComments, setExpandedComments] = useState({})
  const [commentText, setCommentText] = useState({})
  const [loading, setLoading] = useState(true)
  const [selectedTags, setSelectedTags] = useState([])

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    setLoading(true)
    fetch(`/api/ideas?sort=${tab}`).then(r => r.json()).then(data => {
      setIdeas(data)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [tab])

  const handleVote = async (id, type) => {
    try {
      const res = await fetch(`/api/ideas/${id}/vote`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type }) })
      const updated = await res.json()
      setIdeas(prev => prev.map(i => i.id === id ? updated : i))
      toast.success(type === 'up' ? 'Upvoted!' : 'Downvoted', { icon: type === 'up' ? '👍' : '👎' })
    } catch (e) {
      toast.error('Failed to vote')
    }
  }

  const onSubmitIdea = async (data) => {
    if (selectedTags.length === 0) {
      toast.error('Please select at least one tag')
      return
    }
    const loadToast = toast.loading('Submitting idea...')
    try {
      const res = await fetch('/api/ideas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, tags: selectedTags }) })
      const created = await res.json()
      setIdeas(prev => [created, ...prev])
      setShowForm(false)
      reset()
      setSelectedTags([])
      toast.success('Idea submitted successfully!', { id: loadToast })
    } catch (e) {
      toast.error('Failed to submit idea', { id: loadToast })
    }
  }

  const handleComment = async (id) => {
    const text = commentText[id]
    if (!text?.trim()) return
    const loadToast = toast.loading('Posting comment...')
    try {
      const res = await fetch(`/api/ideas/${id}/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, user: 'You' }) })
      const updated = await res.json()
      setIdeas(prev => prev.map(i => i.id === id ? updated : i))
      setCommentText(prev => ({ ...prev, [id]: '' }))
      toast.success('Comment posted!', { id: loadToast })
    } catch (e) {
      toast.error('Failed to post comment', { id: loadToast })
    }
  }

  const toggleTag = (tag) => setSelectedTags(p => p.includes(tag) ? p.filter(t => t !== tag) : [...p, tag])

  const filtered = ideas.filter(i => {
    if (filterTag && !i.tags?.some(t => t.toLowerCase().includes(filterTag.toLowerCase()))) return false
    if (search && !i.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div>
      <div className="page-header">
        <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1>💡 Open Innovation Hub</h1>
            <p>Crowdsource solutions — turn collective intelligence into action</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <Plus size={18} /> Submit Idea
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
          <div className="stat-card blue"><div className="stat-card-icon"><Lightbulb size={22} /></div><div className="stat-card-value">{loading ? '-' : ideas.length}</div><div className="stat-card-label">Total Ideas</div></div>
          <div className="stat-card green"><div className="stat-card-icon"><CheckCircle size={22} /></div><div className="stat-card-value">{loading ? '-' : ideas.filter(i => i.status === 'implemented').length}</div><div className="stat-card-label">Implemented</div></div>
          <div className="stat-card purple"><div className="stat-card-icon"><TrendingUp size={22} /></div><div className="stat-card-value">{loading ? '-' : ideas.reduce((s, i) => s + i.upvotes, 0)}</div><div className="stat-card-label">Total Votes</div></div>
          <div className="stat-card cyan"><div className="stat-card-icon"><MessageCircle size={22} /></div><div className="stat-card-value">{loading ? '-' : ideas.reduce((s, i) => s + (i.comments?.length || 0), 0)}</div><div className="stat-card-label">Comments</div></div>
        </div>

        {/* Submit Form */}
        {showForm && (
          <form className="glass-card animate-in" style={{ marginBottom: 24 }} onSubmit={handleSubmit(onSubmitIdea)}>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <h3>💡 Submit Your Idea</h3>
              <button type="button" style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }} onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <div className="form-group">
              <label className="form-label">Your Name</label>
              <input className="form-input" placeholder="How should we credit you?" {...register('author', { required: 'Name is required' })} />
              {errors.author && <span className="error-msg">{errors.author.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Idea Title</label>
              <input className="form-input" placeholder="Give your idea a compelling title" {...register('title', { required: 'Title is required' })} />
              {errors.title && <span className="error-msg">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Describe your idea in detail. What problem does it solve? How would it work?" rows={4} {...register('description', { required: 'Description is required' })} />
              {errors.description && <span className="error-msg">{errors.description.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Tags</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {tagOptions.map(t => <button type="button" key={t} className={`skill-tag ${selectedTags.includes(t) ? 'selected' : ''}`} onClick={() => toggleTag(t)}>{t}</button>)}
              </div>
            </div>
            <button type="submit" className="btn btn-primary">
              <Send size={18} /> Submit Idea
            </button>
          </form>
        )}

        {/* Filters */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="tabs" style={{ marginBottom: 0 }}>
            <button className={`tab ${tab === 'top' ? 'active' : ''}`} onClick={() => setTab('top')}>🔥 Top Voted</button>
            <button className={`tab ${tab === 'new' ? 'active' : ''}`} onClick={() => setTab('new')}>🆕 Newest</button>
          </div>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
            <input className="form-input" placeholder="Search ideas..." value={search} onChange={e => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
          </div>
          <select className="form-select" style={{ width: 180 }} value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">All Tags</option>
            {tagOptions.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Ideas List */}
        {loading ? (
          <div>
            {[1, 2].map(n => (
              <div key={n} className="idea-card skeleton" style={{ height: 180, marginBottom: 16 }}></div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state animate-in">
            <FileQuestion className="empty-state-icon" />
            <h3>No Ideas Found</h3>
            <p>Be the first to submit an idea for this category or try different filters.</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Submit Idea</button>
          </div>
        ) : (
          filtered.map(idea => (
            <div key={idea.id} className="idea-card animate-in">
              <div className="idea-header">
                <div style={{ flex: 1 }}>
                  <div className="idea-title">{idea.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>by {idea.author || 'Anonymous'}</div>
                </div>
                <div className="idea-votes">
                  <button className="vote-btn up" onClick={() => handleVote(idea.id, 'up')}><ThumbsUp size={16} /></button>
                  <span className="vote-count" style={{ color: (idea.upvotes - idea.downvotes) > 0 ? '#22c55e' : '#ef4444' }}>{idea.upvotes - idea.downvotes}</span>
                  <button className="vote-btn down" onClick={() => handleVote(idea.id, 'down')}><ThumbsDown size={16} /></button>
                </div>
              </div>
              <p className="idea-desc">{idea.description}</p>

              {/* Status Tracker */}
              <div className="status-tracker">
                {statusOrder.map((s, idx) => {
                  const currentIdx = statusOrder.indexOf(idea.status)
                  const isCompleted = idx < currentIdx
                  const isActive = idx === currentIdx
                  return (
                    <div key={s} className={`status-step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                      {idx < statusOrder.length - 1 && <div className="status-step-line" />}
                      <div className="status-step-dot">{isCompleted ? '✓' : idx + 1}</div>
                      <div className="status-step-label">{statusLabels[s]}</div>
                    </div>
                  )
                })}
              </div>

              <div className="idea-tags">
                {idea.tags?.map(t => <span key={t} className="badge badge-info">{t}</span>)}
              </div>
              <div className="idea-footer">
                <div className="idea-status">
                  <div className={`status-dot ${idea.status}`} />
                  {statusLabels[idea.status]}
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setExpandedComments(p => ({ ...p, [idea.id]: !p[idea.id] }))}>
                  <MessageCircle size={14} /> {idea.comments?.length || 0} Comments
                </button>
              </div>

              {/* Comments */}
              {expandedComments[idea.id] && (
                <div className="comments-section animate-in">
                  {idea.comments?.map((c, i) => (
                    <div key={i} className="comment">
                      <span className="comment-user">{c.user}</span>
                      <span className="comment-text">{c.text}</span>
                      <div className="comment-date">{new Date(c.date).toLocaleDateString()}</div>
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <input className="form-input" placeholder="Add a comment..." value={commentText[idea.id] || ''} onChange={e => setCommentText(p => ({ ...p, [idea.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && handleComment(idea.id)} />
                    <button className="btn btn-primary btn-sm" onClick={() => handleComment(idea.id)}><Send size={14} /></button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
