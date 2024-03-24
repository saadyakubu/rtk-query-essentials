import React from 'react'
import { selectUserById } from './usersSlice'
import { useSelector } from 'react-redux'
import { selectAllPosts, selectPostsByUser } from '../posts/postsSlice'
import { useGetPostQuery } from '../api/apiSlice'
import { Link } from 'react-router-dom'
import { createSelector } from '@reduxjs/toolkit'

const User = ({ match }) => {
    const { userId } = match.params
    const user = useSelector(state => selectUserById(state, userId))
    /*const postsForUser = useSelector(state =>{
        const allPosts = selectAllPosts(state)
        return allPosts.filter(post => post.user === userId)
    })*/

    const selectPostsByUser = useMemo(() => {
        const emptyArray = []
        //// Return a unique selector instance for this page so that the filtered results are correctly memoized
        return createSelector(
            res => res.data,
            (res, userId) => userId,
            (data, userId) => data?.filter(post => post.user === userId) ?? emptyArray
        )
    }, [])
    
    //taking advantage memoizing technique by createSelector() in the postsSlice, to only re-render if the state changes. 
    //const postsForUser = useSelector(state => selectPostsByUser(state, userId))
    const { postsForUser } = useGetPostQuery( undefined, {
        selectFromResult: result => ({
            ...result,
            postsForUser: selectPostsByUser(result, userId)
        })
    })

    const postTitles = postsForUser.map(post=>(
        <li key={post.id}><Link to={`/posts/${post.id}`}>{post.title}</Link></li>
    ))

    return (
        <section>
            <h2>{user?.name}</h2>
            <ul>{postTitles}</ul>
        </section>
    )
}

export default User