import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { Toast } from '../components/Toast';
import {
  Database, Upload, FileText, Layers, Brain, Trash, Eye,
  Refresh, Search, CheckCircle, AlertCircle
} from '../components/Icons';

// Status badge helper
const StatusBadge = ({ status }) => {
  const cfg = {
    EMBEDDED:  { label: 'Embedded',  cls: 'badge-green'  },
    CHUNKED:   { label: 'Chunked',   cls: 'badge-purple' },
    EXTRACTED: { label: 'Extracted', cls: 'badge-blue'   },
    UPLOADED:  { label: 'Uploaded',  cls: 'badge-amber'  },
    FAILED:    { label: 'Failed',    cls: 'badge-red'    },
  }[status] || { label: status, cls: 'badge-slate' };
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
};

const fmtSize = (b) => {
  if (!b) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(b) / Math.log(1024));
  return (b / 1024 ** i).toFixed(1) + ' ' + units[i];
};

export const KnowledgeBaseView = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [processingId, setProcessingId] = useState(null);
  const [toast, setToast] = useState({ message: '', type: 'info' });

  // Modals
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewText, setPreviewText] = useState('');
  const [chunksDoc, setChunksDoc] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [loadingChunks, setLoadingChunks] = useState(false);

  const fileRef = useRef(null);

  const notify = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: '', type: 'info' }), 4000);
  };

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await api.documents.getAll();
      if (res.success) setDocuments(res.documents || []);
    } catch (err) {
      notify(err.message || 'Failed to load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const handleUpload = async (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { notify('File must be under 10 MB', 'error'); return; }
    const ok = ['.pdf', '.docx', '.txt'].some(e => file.name.toLowerCase().endsWith(e));
    if (!ok) { notify('Only PDF, DOCX, TXT files are accepted', 'error'); return; }
    try {
      setUploading(true);
      await api.documents.upload(file);
      notify(`"${file.name}" uploaded successfully!`);
      fetchDocs();
    } catch (err) {
      notify(err.message || 'Upload failed', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleChunk = async (docId) => {
    try {
      setProcessingId(docId);
      await api.chunks.process(docId);
      notify('Document chunked successfully!');
      fetchDocs();
    } catch (err) {
      notify(err.message || 'Chunking failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleEmbed = async (docId) => {
    try {
      setProcessingId(docId);
      await api.embeddings.generate(docId);
      notify('Embeddings generated and indexed!');
      fetchDocs();
    } catch (err) {
      notify(err.message || 'Embedding failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (docId, name) => {
    if (!window.confirm(`Delete "${name}"? This also removes chunks and vectors.`)) return;
    try {
      setProcessingId(docId);
      await api.documents.delete(docId);
      notify(`"${name}" deleted`, 'info');
      fetchDocs();
    } catch (err) {
      notify(err.message || 'Delete failed', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  const openPreview = async (doc) => {
    setPreviewDoc(doc);
    setPreviewText('Loading…');
    try {
      const res = await api.documents.getById(doc._id);
      setPreviewText(res.document?.extractedText || 'No text extracted yet.');
    } catch {
      setPreviewText('Failed to load text.');
    }
  };

  const openChunks = async (doc) => {
    setChunksDoc(doc);
    setLoadingChunks(true);
    try {
      const res = await api.chunks.getByDocumentId(doc._id);
      setChunks(res.chunks || []);
    } catch {
      setChunks([]);
    } finally {
      setLoadingChunks(false);
    }
  };

  const filtered = documents.filter(d => {
    const matchName = d.originalName?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return matchName && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} className="animate-fade-in">

      {/* ── Header ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={22} color="#818cf8" /> Knowledge Base
          </h1>
          <p className="section-subtitle">Upload documents, process chunks, and generate vector embeddings.</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={fetchDocs} disabled={loading} className="btn btn-secondary btn-sm">
            <Refresh size={14} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={e => handleUpload(e.target.files?.[0])} style={{ display: 'none' }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploading} className="btn btn-primary">
            {uploading ? <><span className="spinner spinner-sm" /> Uploading…</> : <><Upload size={15} /> Upload Document</>}
          </button>
        </div>
      </div>

      {/* ── Drop Zone ── */}
      <div
        className="drop-zone"
        onClick={() => fileRef.current?.click()}
        onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
        onDragLeave={e => e.currentTarget.classList.remove('dragover')}
        onDrop={e => { e.preventDefault(); e.currentTarget.classList.remove('dragover'); handleUpload(e.dataTransfer.files?.[0]); }}
      >
        <Upload size={32} color="#4f46e5" />
        <div style={{ marginTop: 12, fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
          Click or drag & drop files here
        </div>
        <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
          Supported formats: <strong>PDF</strong>, <strong>DOCX</strong>, <strong>TXT</strong> · Max 10 MB
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <Search size={15} color="#475569" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36, fontSize: 13 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search documents…"
          />
        </div>
        <select className="select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="ALL">All Statuses</option>
          <option value="UPLOADED">Uploaded</option>
          <option value="EXTRACTED">Extracted</option>
          <option value="CHUNKED">Chunked</option>
          <option value="EMBEDDED">Embedded</option>
        </select>
        <span style={{ fontSize: 13, color: '#475569' }}>
          {filtered.length} document{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Documents Table ── */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state">
            <span className="spinner spinner-dark" style={{ width: 28, height: 28 }} />
            <p style={{ color: '#64748b', margin: 0 }}>Loading documents…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <FileText size={40} />
            <h3>No documents found</h3>
            <p>{search || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filter.'
              : 'Upload your first document to start building your knowledge base.'}</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Size</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(doc => {
                  const busy = processingId === doc._id;
                  const canEmbed = ['CHUNKED', 'EMBEDDED'].includes(doc.status);
                  return (
                    <tr key={doc._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1a2338', border: '1px solid #1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <FileText size={17} color="#818cf8" />
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: 13, maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {doc.originalName}
                            </div>
                            <div style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace' }}>
                              …{doc._id.slice(-6)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{fmtSize(doc.fileSize)}</td>
                      <td><StatusBadge status={doc.status} /></td>
                      <td style={{ fontSize: 12 }}>{new Date(doc.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>

                          {/* Preview Text */}
                          <button className="btn btn-secondary btn-sm btn-icon" title="Preview extracted text" onClick={() => openPreview(doc)}>
                            <Eye size={14} />
                          </button>

                          {/* Chunk */}
                          <button
                            className={`btn btn-sm ${doc.status === 'EXTRACTED' || doc.status === 'UPLOADED' ? 'btn-success' : 'btn-secondary'}`}
                            onClick={() => handleChunk(doc._id)}
                            disabled={busy}
                            title="Split document into semantic chunks"
                          >
                            {busy ? <span className="spinner spinner-sm" /> : <Layers size={13} />}
                            {doc.status === 'EXTRACTED' || doc.status === 'UPLOADED' ? 'Chunk' : 'Re-chunk'}
                          </button>

                          {/* View Chunks */}
                          {canEmbed && (
                            <button className="btn btn-secondary btn-sm" onClick={() => openChunks(doc)}>
                              <Layers size={13} /> View Chunks
                            </button>
                          )}

                          {/* Embed */}
                          <button
                            className={`btn btn-sm ${doc.status === 'CHUNKED' ? 'btn-primary' : 'btn-secondary'}`}
                            onClick={() => handleEmbed(doc._id)}
                            disabled={busy || !canEmbed}
                            title={canEmbed ? 'Generate Gemini vector embeddings' : 'Chunk document first'}
                          >
                            {busy ? <span className="spinner spinner-sm" /> : <Brain size={13} />}
                            {doc.status === 'EMBEDDED' ? 'Re-embed' : 'Embed'}
                          </button>

                          {/* Delete */}
                          <button
                            className="btn btn-danger btn-sm btn-icon"
                            onClick={() => handleDelete(doc._id, doc.originalName)}
                            disabled={busy}
                            title="Delete document and all associated data"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Preview Modal ── */}
      <Modal isOpen={!!previewDoc} onClose={() => setPreviewDoc(null)}
        title={previewDoc?.originalName || 'Document Text'} subtitle="Extracted text content">
        <div className="code-block" style={{ maxHeight: 440, overflowY: 'auto' }}>{previewText}</div>
      </Modal>

      {/* ── Chunks Modal ── */}
      <Modal isOpen={!!chunksDoc} onClose={() => setChunksDoc(null)} maxWidth={760}
        title={`Chunks: ${chunksDoc?.originalName || ''}`}
        subtitle={loadingChunks ? 'Loading…' : `${chunks.length} chunk${chunks.length !== 1 ? 's' : ''}`}>
        {loadingChunks ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <span className="spinner spinner-dark" style={{ width: 28, height: 28, margin: '0 auto' }} />
          </div>
        ) : chunks.length === 0 ? (
          <p style={{ color: '#64748b', fontSize: 13 }}>No chunks found. Try chunking the document first.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chunks.map((c, i) => (
              <div key={c._id || i} style={{ background: '#0d1526', border: '1px solid #1e293b', borderRadius: 10, padding: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
                  <span>Chunk #{(c.chunkIndex ?? i) + 1}</span>
                  <span style={{ color: '#475569', fontFamily: 'monospace' }}>{c.content?.length || 0} chars</span>
                </div>
                <p style={{ margin: 0, fontSize: 12, color: '#94a3b8', lineHeight: 1.6, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'info' })} />}
    </div>
  );
};
