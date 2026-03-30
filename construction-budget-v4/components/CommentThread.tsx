



import React, { useState, useEffect, useRef } from 'react';
// FIX: Aliased the imported 'CommentThread' type to 'CommentThreadType' to resolve name collision with the exported component.
import { Comment, CommentThread as CommentThreadType, UserRole } from '../types';
import { XIcon } from './Icons';

interface CommentThreadProps {
  isOpen: boolean;
  onClose: () => void;
  threadId: string;
  threadLabel: string;
  comments: Comment[];
  commentThreads: CommentThreadType[];
  currentUserRole: UserRole;
  onSubmitEntry: (commentText: string, threadId: string, threadLabel: string) => void;
  onResolveThread: (threadId: string) => void;
  onReopenThread: (threadId: string) => void;
}

// FIX: Corrected component and interface definition for CommentThread.
export const CommentThread: React.FC<CommentThreadProps> = ({
  isOpen,
  onClose,
  threadId,
  threadLabel,
  comments,
  commentThreads,
  currentUserRole,
  onSubmitEntry,
  onResolveThread,
  onReopenThread
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const thread = commentThreads.find(t => t.id === threadId);
  const threadComments = comments.filter(c => c.fieldId === threadId).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  const isThreadResolved = thread?.status === 'resolved';
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, threadComments.length]);

  if (!isOpen) {
    return null;
  }

  const handleAddCommentClick = () => {
    if (newCommentText.trim() === '') return;
    onSubmitEntry(newCommentText, threadId, threadLabel);
    setNewCommentText('');
  };
  
  const getAuthorStyle = (role: UserRole) => {
    return role === 'analyst' 
      ? 'bg-sky-100 dark:bg-sky-900/50 self-start rounded-tr-lg rounded-bl-lg' 
      : 'bg-slate-100 dark:bg-slate-700 self-end rounded-tl-lg rounded-br-lg';
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-800 shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <header className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
        <div>
            <h3 id="comment-thread-title" className="text-base font-semibold text-slate-800 dark:text-slate-100">Comments on:</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate">{threadLabel}</p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
          aria-label="Close comments panel"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto space-y-4">
        {threadComments.map(comment => (
            <div key={comment.id} className={`flex flex-col w-4/5 ${comment.authorRole === 'analyst' ? 'self-start' : 'self-end'}`}>
                <div className={`p-3 rounded-lg ${getAuthorStyle(comment.authorRole)}`}>
                    <p className="text-sm text-slate-800 dark:text-slate-200">{comment.text}</p>
                </div>
                <div className={`text-xs text-slate-500 dark:text-slate-400 mt-1 ${comment.authorRole === 'analyst' ? 'text-left' : 'text-right'}`}>
                    {comment.authorName} - {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        ))}
         <div ref={endOfMessagesRef} />
      </main>

      <footer className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
        {!isThreadResolved ? (
            <>
                <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="spreadsheet-input w-full resize-none"
                    aria-label="New comment"
                />
                <div className="flex justify-between items-center mt-2">
                    {currentUserRole === 'analyst' ? (
                        <button onClick={() => onResolveThread(threadId)} className="button-base text-xs py-1.5 px-3 bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">
                            Resolve Thread
                        </button>
                    ) : (
                        <div /> // Placeholder to keep alignment
                    )}
                    <button onClick={handleAddCommentClick} className="button-base text-xs py-1.5 px-3 bg-[#32373c] text-white hover:bg-[#4a5056]">
                        Send
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center">
                <div className="text-sm text-slate-500 dark:text-slate-400 p-2 bg-slate-100 dark:bg-slate-700 rounded-md">
                    This thread has been resolved.
                </div>
                <button onClick={() => onReopenThread(threadId)} className="button-base text-xs py-1.5 px-3 bg-yellow-500 text-white hover:bg-yellow-600 mt-2">
                    Re-open Thread
                </button>
            </div>
        )}
      </footer>
    </div>
  );
};