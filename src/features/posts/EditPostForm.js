import React, { useState } from "react"
import { postUpdated } from "./postsSlice"
import { useDispatch, useSelector } from "react-redux"
import { useHistory } from "react-router-dom"

import { selectPostById } from "./postsSlice"
import { useGetPostQuery, useEditPostMutation } from "../api/apiSlice"

export const EditPostForm = ({match})=> {
    const { postId } = match.params
    //const post = useSelector(state=>selectPostById(state, postId))//useSelector(state=>state.posts.find(post=>post.id === postId) || {})
    
    const { data: post } = useGetPostQuery(postId)
    const [ updatePost, { isLoading }] = useEditPostMutation()
    

    const [title, setTitle] = useState(post.title)
    const [content, setContent] = useState(post.content)

    //const dispatch = useDispatch()
    const history = useHistory()

    const onTitleChanged = e => setTitle(e.target.value)
    const onContentChanged = e => setContent(e.target.value)

    const onSavePostClicked = async ()=> {
        if(title && content){
            // dispatch(postUpdated({
            //     id: postId,
            //     title,
            //     content,
            // }))
            await updatePost({id: postId, title, content })
            history.push(`/posts/${postId}`)
        }
    }

    return (
        <section>
            <h2>Edit Post</h2>
            <form>
                <label htmlFor="postTitle">Post Title:</label>
                <input type="text" id="postTitle" name="postTitle" value={title} onChange={onTitleChanged} placeholder="What's on your mind?"/>
                <label htmlFor="postContent">Content:</label>
                <textarea id="postContent" name="postContent" value={content} onChange={onContentChanged}/>
                <button type="button" onClick={onSavePostClicked}>Save Post</button>
            </form>
        </section>
    )
}