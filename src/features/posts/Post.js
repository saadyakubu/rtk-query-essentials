import React from 'react'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { PostAuthor } from './PostAuthor'
import TimeAgo from './TimeAgo'
import { ReactionButtons } from './ReactionButtons'

//import { selectPostById } from './postsSlice'

import { Spinner } from '../../components/Spinner'
import { useGetPostQuery } from '../api/apiSlice'


export const Post = ({ match }) => {
    const { postId } = match.params

    //const post = useSelector(state => selectPostById(state, postId))//useSelector(state => state.posts.find(post => post.id === postId))
    const { data: post, isFetching, isSuccess, isError } = useGetPostQuery(postId)

    let content
    if (isFetching) {
        content = <Spinner text='Loading...' />
    }
    else if (isSuccess) {
        content = (
            <article>
                <h2>{post.title}</h2>
                <p className='post-content'>{post.content}</p>
                <ReactionButtons post={post} />
                <PostAuthor userId={post.user} /> &nbsp; <TimeAgo timestamp={post.date} />
                <Link to={`/edit-post/${post.id}`} className="button">Edit Post</Link>
            </article>
        )
    }
    else if (isError) {
        content = (
            <article>
                <h2>Error loading post!</h2>
            </article>
        )
    }



    return (
        <section>{ content }</section>
    )
}
