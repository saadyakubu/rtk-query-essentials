import React from 'react'
//import { useDispatch } from 'react-redux'

import { reactionAdded } from './postsSlice'

import { useAddReactionMutation } from '../api/apiSlice'

const reactionEmojis = {
    thumbsUp: '👍',
    hooray: '🎉',
    heart: '❤️',
    rocket: '🚀',
    eyes: '👀'
}

export const ReactionButtons = ({ post }) => {
    //const dispatch = useDispatch()
    const [ addReaction ] = useAddReactionMutation()

    const reactionButtons = Object.entries(reactionEmojis).map(([reactionName, emoji]) => {
        return (
            <button key={name} type='button' className='button muted-button reaction-button' 
                //onClick={()=>dispatch(reactionAdded({ postId: post.id, reaction: name }))}
                onClick={()=>addReaction({postId: post.id, reaction: reactionName})}>
                {emoji} {post.reactions[reactionName]}
            </button>
        )
    })
    
    return (
        <div>{reactionButtons}</div>
    )
}
