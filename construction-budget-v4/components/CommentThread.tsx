



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
      ? 'bg-brand-50 border border-brand-200 self-start rounded-tr-lg rounded-bl-lg'
      : 'bg-[#F6F7F9] border border-[#DFE1E5] self-end rounded-tl-lg rounded-br-lg';
  };

  return (
    <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white border-l border-[#DFE1E5] shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <header className="flex justify-between items-center p-4 border-b border-[#DFE1E5] flex-shrink-0">
        <div>
            <h3 id="comment-thread-title" className="text-base font-semibold text-[#1E2D5C]">Comments on:</h3>
            <p className="text-sm text-[#78819D] truncate">{threadLabel}</p>
        </div>
        <button
          onClick={onClose}
          className="text-[#78819D] hover:text-[#1E2D5C] transition-colors"
          aria-label="Close comments panel"
        >
          <XIcon className="w-6 h-6" />
        </button>
      </header>

      <main className="flex-grow p-4 overflow-y-auto space-y-4">
        {threadComments.map(comment => (
            <div key={comment.id} className={`flex flex-col w-4/5 ${comment.authorRole === 'analyst' ? 'self-start' : 'self-end'}`}>
                <div className={`p-3 rounded-lg ${getAuthorStyle(comment.authorRole)}`}>
                    <p className="text-sm text-[#1E2D5C]">{comment.text}</p>
                </div>
                <div className={`text-xs text-[#78819D] mt-1 ${comment.authorRole === 'analyst' ? 'text-left' : 'text-right'}`}>
                    {comment.authorName} - {new Date(comment.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        ))}
         <div ref={endOfMessagesRef} />
      </main>

      <footer className="p-4 border-t border-[#DFE1E5] flex-shrink-0">
        {!isThreadResolved ? (
            <>
                <textarea
                    rows={3}
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    placeholder="Add a comment..."
                    className="form-input-premium w-full resize-none"
                    aria-label="New comment"
                />
                <div className="flex justify-between items-center mt-2">
                    {currentUserRole === 'analyst' ? (
                        <button onClick={() => onResolveThread(threadId)} className="button-base text-xs py-1.5 px-3 bg-white text-[#1E2D5C] border border-[#DFE1E5] hover:bg-[#F7F9FC]">
                            Resolve Thread
                        </button>
                    ) : (
                        <div />
                    )}
                    <button onClick={handleAddCommentClick} className="button-base text-xs py-1.5 px-3 bg-brand-500 text-white hover:bg-brand-600">
                        Send
                    </button>
                </div>
            </>
        ) : (
            <div className="text-center">
                <div className="text-sm text-[#78819D] p-2 bg-[#F6F7F9] border border-[#DFE1E5] rounded-md">
                    This thread has been resolved.
                </div>
                <button onClick={() => onReopenThread(threadId)} className="button-base text-xs py-1.5 px-3 bg-[#EAA800] text-white hover:bg-[#D49700] mt-2">
                    Re-open Thread
                </button>
            </div>
        )}
      </footer>
    </div>
  );
};