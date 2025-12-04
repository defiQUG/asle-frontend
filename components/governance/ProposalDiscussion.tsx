'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useAccount } from 'wagmi'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

interface Comment {
  id: string
  author: string
  content: string
  parentId?: string
  upvotes: number
  downvotes: number
  createdAt: string
}

interface ProposalDiscussionProps {
  proposalId: string
}

export function ProposalDiscussion({ proposalId }: ProposalDiscussionProps) {
  const { address } = useAccount()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchComments()
  }, [proposalId])

  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/governance/discussion/${proposalId}`)
      setComments(response.data.comments || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !address) return

    setLoading(true)
    try {
      await axios.post(`${API_URL}/api/governance/discussion/${proposalId}/comment`, {
        author: address,
        content: newComment,
      })
      setNewComment('')
      fetchComments()
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVote = async (commentId: string, upvote: boolean) => {
    if (!address) return

    try {
      await axios.post(`${API_URL}/api/governance/discussion/comment/${commentId}/vote`, {
        voter: address,
        upvote,
      })
      fetchComments()
    } catch (error) {
      console.error('Error voting on comment:', error)
    }
  }

  const topLevelComments = comments.filter((c) => !c.parentId)
  const replies = (parentId: string) => comments.filter((c) => c.parentId === parentId)

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Discussion ({comments.length})</h3>

      {/* Comment Form */}
      {address && (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            rows={3}
          />
          <button
            type="submit"
            disabled={loading || !newComment.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {topLevelComments.map((comment) => (
          <div key={comment.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-start justify-between mb-2">
              <div>
                <span className="font-semibold">{comment.author.slice(0, 10)}...</span>
                <span className="text-sm text-gray-500 ml-2">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
            <p className="text-gray-700 mb-3">{comment.content}</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleVote(comment.id, true)}
                className="flex items-center gap-1 text-gray-600 hover:text-blue-600"
              >
                ▲ {comment.upvotes}
              </button>
              <button
                onClick={() => handleVote(comment.id, false)}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600"
              >
                ▼ {comment.downvotes}
              </button>
            </div>

            {/* Replies */}
            {replies(comment.id).length > 0 && (
              <div className="mt-4 ml-8 space-y-2 border-l-2 border-gray-200 pl-4">
                {replies(comment.id).map((reply) => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{reply.author.slice(0, 10)}...</span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

