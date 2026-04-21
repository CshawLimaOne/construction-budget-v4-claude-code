
import React from 'react';
import { Comment, CommentThread, UserRole } from '../types';
import { ChatBubbleIcon, CheckCircleIcon } from './Icons';
import Tooltip from './Tooltip';

interface CommentIndicatorProps {
  fieldId: string;
  comments: Comment[];
  commentThreads: CommentThread[];
  currentUserRole: UserRole;
  onClick: () => void;
}

export const CommentIndicator: React.FC<CommentIndicatorProps> = ({ fieldId, comments, commentThreads, currentUserRole, onClick }) => {
  const thread = commentThreads.find(t => t.id === fieldId);

  // Case 1: No thread exists yet. Render a subtle, clickable icon to initiate a thread.
  if (!thread) {
    return (
        <Tooltip text="Add a comment" position="top">
            <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 text-[#78819D] hover:text-[#1E2D5C] hover:bg-[#F7F9FC] focus:ring-brand-500"
                aria-label="Add a comment on this item"
            >
                <ChatBubbleIcon className="w-4 h-4" />
            </button>
        </Tooltip>
    );
  }

  // Case 2: Thread exists.
  const isActionableForMe = thread.assignee === currentUserRole && thread.status !== 'resolved';
  const isPendingOther = thread.assignee !== currentUserRole && thread.status !== 'resolved';
  
  if (thread.status === 'resolved') {
      const commentCount = comments.filter(c => c.threadId === fieldId).length;
      return (
        <Tooltip text="View resolved thread" position="top">
            <button
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                className="flex items-center justify-center w-6 h-6 text-[#139B23]"
                aria-label={`View ${commentCount} resolved comments on this item`}
            >
                <CheckCircleIcon className="w-5 h-5"/>
            </button>
        </Tooltip>
      );
  }

  return (
    <Tooltip text={isActionableForMe ? "Action Required" : "Pending other party"} position="top">
        <button
          onClick={(e) => { e.stopPropagation(); onClick(); }}
          className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 text-white
            ${isActionableForMe ? 'bg-red-500 focus:ring-red-500' : ''}
            ${isPendingOther ? 'bg-brand-500 focus:ring-brand-500' : ''}
          `}
          aria-label={isActionableForMe ? "Action required on this item" : "This item is pending review from the other party"}
        >
          <ChatBubbleIcon className="w-4 h-4" />
        </button>
    </Tooltip>
  );
};
