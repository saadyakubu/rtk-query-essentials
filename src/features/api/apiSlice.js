import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

//Define the single API slice object per server interaction
export const apiSlice = createApi({
    //the cache reducer expected to be added at `state.api` (already added by default)
    reducerPath: 'api',
    //base url
    baseQuery: fetchBaseQuery({ baseUrl: '/fakeApi' }),

    tagTypes: ['Post'], //A root tagTypes field in the API slice object, declaring an array of string tag names for data types such as 'Post'

    //the endpoints rep operations and requests for this server
    endpoints: builder => ({
        //the `getPosts` endpoint is a "query" operation that returns data
        getPosts: builder.query({
            //The URL for the request is '/fakeApi/posts'
            query: () => '/posts',
            providesTags: ['Post'] //A providesTags array in query endpoints, listing a set of tags describing the data in that query
        }),
        getPost: builder.query({
            query: postId => `/posts/${postId}`,
        }),
        addNewPost: builder.mutation({
            query: newPost => ({
                url: '/posts',
                method: 'POST',
                //include the entire post object as the body of the req
                body: newPost
            }),
            //An invalidatesTags array in mutation endpoints, listing a set of tags that are invalidated every time that mutation runs
            invalidatesTag: ['Post'] 
        }),        
    })
})

//export the autogenerated hook for the 'getPosts' query endpoint
export const { useGetPostsQuery, useGetPostQuery, useAddNewPostMutation } = apiSlice