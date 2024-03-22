import React, { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Link } from "react-router-dom"
import TimeAgo from "./TimeAgo"
import { PostAuthor } from "./PostAuthor"
import { ReactionButtons } from "./ReactionButtons"

import { selectAllPosts, fetchPosts, selectPostIds, selectPostById } from "./postsSlice"
import { Spinner } from "../../components/Spinner"

import { useGetPostsQuery } from "../api/apiSlice"

let PostExcerpt = ({ post }) => {
    
    return (
        <article className="post-excerpt">
            <h3>{post.title}</h3>
            <div>
                <PostAuthor userId={post.user} />
                <TimeAgo timestamp={post.date} />
            </div>
            <p className="post-content">{post.content.substring(0, 100)}</p>

            <ReactionButtons post={post} />
            <Link to={`/posts/${post.id}`} className="button muted-button">View Post</Link>
        </article>
    )
}


export const PostsList = () => {
    const {
        data: posts = [],
        isLoading,
        isSuccess,
        isError,
        error
    } = useGetPostsQuery()

    const sortedPosts = useMemo(() => {
        const sortedPosts = posts.slice()
        //sort posts in descending chronological order
        sortedPosts.sort((a, b) => b.date.localeCompare(a.date))
        return sortedPosts
    }, [posts])

    let content
    if (isLoading) {
        content = <Spinner text="Loading..." />
    }
    else if(isSuccess) {
        content = sortedPosts.map(post => <PostExcerpt key={post.id} post={post} />)
    }
    else if(isError){
        content = <div>{`Error: ${error.toString()}`}</div>
    }

    return (
        <section className="posts-list">
            <h2>Posts</h2>
            {content}
        </section>
    )
}