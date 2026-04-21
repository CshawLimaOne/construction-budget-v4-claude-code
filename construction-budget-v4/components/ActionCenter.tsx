
import React from 'react';
import { Comment, CommentThread, UserRole } from '../types';
import { ComplexModal } from './ComplexModal';

interface ActionCenterWidgetProps {
  threads: CommentThread[];
  currentUserRole: UserRole;
  onClick: () => void;
}

export const ActionCenterWidget: React.FC<ActionCenterWidgetProps> = ({ threads, currentUserRole, onClick }) => {
  const actionItemCount = threads.filter(t => t.assignee === currentUserRole && t.status !== 'resolved').length;

  return (
    <div className="p-1 bg-white border border-[#DFE1E5] rounded-xl shadow-sm">
      <button
        onClick={onClick}
        className="w-full text-left p-4 rounded-lg hover:bg-[#F7F9FC] transition-colors group"
      >
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#1E2D5C] text-sm uppercase tracking-wide">Action Center</span>
          {actionItemCount > 0 ? (
            <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-[#B92814] rounded-full shadow-md animate-pulse">
              {actionItemCount}
            </span>
          ) : (
             <div className="w-2 h-2 rounded-full bg-[#139B23]"></div>
          )}
        </div>
        <p className="text-xs text-[#78819D] mt-2 leading-relaxed">
          {actionItemCount > 0 ? `You have ${actionItemCount} item(s) requiring your attention.` : 'No pending actions. All clear!'}
        </p>
      </button>
    </div>
  );
};

interface ActionCenterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  threads: CommentThread[];
  comments: Comment[];
  currentUserRole: UserRole;
  onItemClick: (thread: CommentThread) => void;
}

export const ActionCenterSidebar: React.FC<ActionCenterSidebarProps> = ({ isOpen, onClose, threads, comments, currentUserRole, onItemClick }) => {
  const actionItems = threads.filter(t => t.assignee === currentUserRole && t.status !== 'resolved');

  const getLastComment = (threadId: string) => {
    return comments
      .filter(c => c.threadId === threadId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };
  
  const getStatusBadge = (status: CommentThread['status']) => {
      switch(status) {
          case 'needs_borrower_action': return <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-brand-50 text-brand-500 border border-brand-200">Action Required</span>;
          case 'pending_analyst_review': return <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#FFF5DB] text-[#EAA800] border border-[#EDDDB1]">Pending Review</span>;
          default: return null;
      }
  };

  const modalFooter = (
    <button onClick={onClose} className="button-base bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]">Close</button>
  );

  return (
    <ComplexModal isOpen={isOpen} onClose={onClose} title="Your Action Items" footer={modalFooter} size="lg">
      {actionItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-[#E1F7E4] rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-[#139B23]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
            </div>
            <h3 className="text-lg font-bold text-[#1E2D5C]">All Caught Up!</h3>
            <p className="text-sm text-[#78819D] mt-1">You have no pending action items at this time.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {actionItems.map(thread => {
            const lastComment = getLastComment(thread.id);
            return (
              <li key={thread.id}>
                <button
                  onClick={() => onItemClick(thread)}
                  className="w-full text-left p-4 border border-[#DFE1E5] rounded-xl hover:bg-[#F7F9FC] transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white shadow-sm"
                >
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm text-[#1E2D5C]">{thread.label}</p>
                    {getStatusBadge(thread.status)}
                  </div>
                  {lastComment && (
                    <div className="flex items-start mt-2">
                        <div className="w-1 h-full min-h-[20px] bg-[#DFE1E5] rounded-full mr-3"></div>
                        <p className="text-xs text-[#78819D] italic line-clamp-2">
                        "{lastComment.text}"
                        </p>
                    </div>
                  )}
                  <div className="mt-2 text-[10px] text-[#78819D] text-right">
                      Last update: {lastComment ? new Date(lastComment.timestamp).toLocaleDateString() : 'N/A'}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </ComplexModal>
  );
};
