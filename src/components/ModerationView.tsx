import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Check, 
  Trash2, 
  X, 
  AlertTriangle, 
  User as UserIcon, 
  FileText,
  MessageSquare,
  ShieldCheck,
  Flag,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Neighborhood, Report, Post, Comment } from '../types';
import { 
  getReports, 
  saveReports, 
  getPosts, 
  savePosts, 
  getComments, 
  saveComments 
} from '../data/store';

interface ModerationViewProps {
  currentUser: User;
  activeNeighborhood: Neighborhood;
  onRefresh: () => void;
}

export default function ModerationView({ 
  currentUser, 
  activeNeighborhood, 
  onRefresh 
}: ModerationViewProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const reports = getReports();
  const posts = getPosts();
  const comments = getComments();

  // Pending reports
  const pendingReports = reports.filter(r => r.status === 'PENDING');
  // Resolved logs
  const resolvedReports = reports.filter(r => r.status !== 'PENDING');

  const selectedReport = pendingReports.find(r => r.id === selectedReportId) || pendingReports[0];

  // Helper to find the original content text and metadata
  const getContentDetails = (report: Report) => {
    if (report.targetType === 'POST') {
      const p = posts.find(p => p.id === report.targetId);
      return p ? { text: p.text, author: p.authorName, phone: p.authorPhone, count: p.reportsCount, hidden: p.isHidden } : null;
    } else {
      const c = comments.find(c => c.id === report.targetId);
      return c ? { text: c.text, author: c.authorName, phone: c.authorPhone, count: c.reportsCount, hidden: c.isHidden } : null;
    }
  };

  // Action 1: Valid report -> Content permanently deleted + warning issued
  const handleApproveFlag = (report: Report) => {
    // 1. Mark report as RESOLVED
    const currentReports = getReports();
    // Update all reports for this same targetId
    currentReports.forEach(r => {
      if (r.targetId === report.targetId) {
        r.status = 'RESOLVED';
      }
    });
    saveReports(currentReports);

    // 2. Permanently delete original post or comment
    if (report.targetType === 'POST') {
      const currentPosts = getPosts();
      const filtered = currentPosts.filter(p => p.id !== report.targetId);
      savePosts(filtered);
    } else {
      const currentComments = getComments();
      const filtered = currentComments.filter(c => c.id !== report.targetId);
      saveComments(filtered);
    }

    setSuccessToast(`Trust Protocol Actioned: Flag Approved! The reported content has been permanently deleted from the database, and an official warning has been registered for the author.`);
    setSelectedReportId(null);
    onRefresh();

    setTimeout(() => setSuccessToast(null), 4500);
  };

  // Action 2: Invalid report -> Content restored, reporter noted, report dismissed
  const handleDismissFlag = (report: Report) => {
    // 1. Mark report as DISMISSED
    const currentReports = getReports();
    currentReports.forEach(r => {
      if (r.targetId === report.targetId) {
        r.status = 'DISMISSED';
      }
    });
    saveReports(currentReports);

    // 2. Restore content (Hidden = false) and clear report counts
    if (report.targetType === 'POST') {
      const currentPosts = getPosts();
      const idx = currentPosts.findIndex(p => p.id === report.targetId);
      if (idx !== -1) {
        currentPosts[idx].isHidden = false;
        currentPosts[idx].reportsCount = 0;
        savePosts(currentPosts);
      }
    } else {
      const currentComments = getComments();
      const idx = currentComments.findIndex(c => c.id === report.targetId);
      if (idx !== -1) {
        currentComments[idx].isHidden = false;
        currentComments[idx].reportsCount = 0;
        saveComments(currentComments);
      }
    }

    setSuccessToast(`Trust Protocol Actioned: Flag Dismissed! Content has been vindicated, restored back to the feed, and reported flags have been cleared.`);
    setSelectedReportId(null);
    onRefresh();

    setTimeout(() => setSuccessToast(null), 4500);
  };

  return (
    <div className="flex-1 space-y-6 font-sans" id="moderation-center-root">
      
      {/* Moderation header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 rounded-2xl shadow-sm border border-slate-800">
        <h3 className="font-display font-bold text-lg flex items-center gap-2">
          <ShieldAlert className="text-rose-400" size={20} />
          ApnaArea Trust & Safety Center
        </h3>
        <p className="text-[11px] text-slate-300 mt-1">Review reported items from neighbors. To prevent abuse, items with 5 or more flags are auto-hidden from feeds immediately pending your audit.</p>
      </div>

      {/* SUCCESS TOAST MESSAGE */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-slate-900 text-white text-xs font-semibold rounded-xl border border-slate-800 flex items-start gap-2.5 shadow-lg shadow-slate-900/10 leading-normal"
          >
            <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Report queue list (8 cols or 6 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 p-4 space-y-4 shadow-sm h-[480px] flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Flagged Reports Queue ({pendingReports.length})</span>
          
          <div className="flex-1 overflow-y-auto pr-1 space-y-2" id="pending-reports-list">
            {pendingReports.length === 0 ? (
              <div className="py-20 text-center space-y-2">
                <ShieldCheck size={32} className="mx-auto text-slate-300" />
                <h4 className="font-bold text-xs text-slate-700">Neighborhood is Clean!</h4>
                <p className="text-[10px] text-slate-400">Zero pending reports. Neighbors are keeping interactions highly civil.</p>
              </div>
            ) : (
              pendingReports.map((r) => {
                const details = getContentDetails(r);
                const isSelected = selectedReport && r.id === selectedReport.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReportId(r.id)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isSelected 
                        ? 'border-rose-300 bg-rose-50/20 shadow-sm' 
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-[10px] font-bold">
                        {r.targetType === 'POST' ? <FileText size={11} className="text-slate-400" /> : <MessageSquare size={11} className="text-slate-400" />}
                        <span className="text-slate-500 uppercase tracking-wider">{r.targetType}</span>
                      </div>
                      
                      {/* Highlight if Auto-Hidden */}
                      {details?.hidden && (
                        <span className="bg-rose-100 text-rose-700 font-bold text-[8px] px-1.5 py-0.2 rounded border border-rose-100 animate-pulse">AUTO-HIDDEN</span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-700 font-bold mt-1 line-clamp-1">{r.targetText}</p>
                    
                    <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-slate-100/50 text-[9px] text-slate-400 font-medium">
                      <span>Reason: <strong className="text-rose-600">{r.reason}</strong></span>
                      <span>By {r.reporterName}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Action and detail panel */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm min-h-[360px] flex flex-col justify-between">
          {selectedReport && pendingReports.length > 0 ? (
            (() => {
              const details = getContentDetails(selectedReport);
              return (
                <div className="h-full flex flex-col justify-between space-y-6" id="report-detail-card">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-800">Reviewing Flag ID #{selectedReport.id.substring(4, 9)}</h4>
                        <span className="text-[10px] text-slate-400">Reported on {new Date(selectedReport.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <span className="bg-rose-50 text-rose-600 font-bold text-[10px] px-2.5 py-1 rounded-full border border-rose-100/50">
                        {selectedReport.reason}
                      </span>
                    </div>

                    {/* Reported user details */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reported Account (Real Identity)</span>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100/80 space-y-1">
                        <div className="font-bold text-slate-700 flex items-center gap-1">
                          <UserIcon size={12} />
                          {details?.author || 'Unknown Resident'}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{details?.phone || 'No phone registered'}</div>
                      </div>
                    </div>

                    {/* Reported Content text */}
                    <div className="space-y-1.5 text-xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Flagged Content Text</span>
                      <div className="bg-rose-50/15 border border-rose-100 p-3.5 rounded-xl text-slate-700 italic font-medium leading-relaxed">
                        "{details?.text || selectedReport.targetText}"
                      </div>
                    </div>

                    {/* Report Statistics block */}
                    <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100/60 text-[10px] font-semibold text-slate-500">
                      <AlertTriangle size={12} className="text-rose-500 shrink-0" />
                      <span>Currently has <strong>{details?.count || 1} pending report flags</strong> out of 5 allowed before auto-hide.</span>
                    </div>
                  </div>

                  {/* Decision actions - Matches Section 5 flow of PRD */}
                  <div className="border-t border-slate-50 pt-4 flex gap-3 justify-end" id="moderator-decision-actions">
                    <button
                      onClick={() => handleDismissFlag(selectedReport)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <X size={14} className="stroke-[2.5]" />
                      Dismiss Flag (Restore Feed)
                    </button>

                    <button
                      onClick={() => handleApproveFlag(selectedReport)}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-500/10 transition-colors"
                    >
                      <Trash2 size={14} />
                      Approve Flag (Delete & Warn)
                    </button>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-2">
              <ShieldCheck size={44} className="text-slate-300 animate-pulse" />
              <h4 className="font-display font-bold text-sm text-slate-700">Audit Desk is Clear</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">Select any flagged report from the queue list on the left to review, or sit back. The neighborhood is safe!</p>
            </div>
          )}
        </div>

      </div>

      {/* RESOLVED LOG PANEL */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm space-y-3.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 block">Resolved Audits History ({resolvedReports.length})</span>
        {resolvedReports.length === 0 ? (
          <p className="text-center text-[10px] text-slate-400 py-2">No previously resolved moderation audits.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {resolvedReports.map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-slate-50 bg-slate-50/20 text-[10px]">
                <div className="flex items-center justify-between">
                  <span className={`font-bold px-1.5 py-0.2 rounded shrink-0 uppercase tracking-wider text-[8px] ${
                    r.status === 'RESOLVED' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {r.status === 'RESOLVED' ? 'Deleted + Warned' : 'Dismissed'}
                  </span>
                  <span className="text-slate-400 font-medium">#{r.id.substring(4, 9)}</span>
                </div>
                <p className="text-slate-600 italic font-medium mt-1.5 truncate">"{r.targetText}"</p>
                <div className="text-[9px] text-slate-400 mt-2 flex justify-between">
                  <span>Reported: {r.reason}</span>
                  <span>By {r.reporterName}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
