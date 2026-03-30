
import React from 'react';
// FIX: Added CommentThread and UserRole to imports to support new props.
import { Comment, CommentThread, UserRole } from '../types';
import { CommentIndicator } from './CommentIndicator';

interface CommentableSectionProps {
  children: React.ReactNode;
  fieldId: string;
  fieldLabel: string;
  comments: Comment[];
  commentThreads: CommentThread[];
  currentUserRole: UserRole;
  onOpenCommentThread: (fieldId: string, fieldLabel: string) => void;
  className?: string;
  isLocked?: boolean;
}

export const CommentableSection: React.FC<CommentableSectionProps> = ({
  children,
  fieldId,
  fieldLabel,
  comments,
  commentThreads,
  currentUserRole,
  onOpenCommentThread,
  className = '',
  isLocked = false,
}) => {
  return (
    <div className={`relative ${className}`}>
      {children}
      {!isLocked && (
        <div className="comment-indicator-wrapper">
          {/* FIX: Passed missing `commentThreads` and `currentUserRole` props to CommentIndicator. */}
          <CommentIndicator
            fieldId={fieldId}
            comments={comments}
            commentThreads={commentThreads}
            currentUserRole={currentUserRole}
            onClick={() => onOpenCommentThread(fieldId, fieldLabel)}
          />
        </div>
      )}
    </div>
  );
};