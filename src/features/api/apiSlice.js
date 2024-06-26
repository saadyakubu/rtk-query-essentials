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
            //providesTags: ['Post'] //A providesTags array in query endpoints, listing a set of tags describing the data in that query
            //provides a general 'Post' tag for the whole list, as well as a specific {type: 'Post', id} tag for each received post object
            providesTags: (result = [], error, arg) => [
                'Post',
                ...result.map(({id}) => ({
                    type: 'Post',
                    id
                }))
            ]
        }),
        getPost: builder.query({
            query: postId => `/posts/${postId}`,
            //provides a specific {type: 'Post', id} object for the individual post object
            providesTags: (result, error, arg) => [{
                type: 'Post',
                id: arg
            }]
        }),
        addNewPost: builder.mutation({
            query: newPost => ({
                url: '/posts',
                method: 'POST',
                //include the entire post object as the body of the req
                body: newPost
            }),
            //An invalidatesTags array in mutation endpoints, listing a set of tags that are invalidated every time that mutation runs
            invalidatesTags: ['Post'] 
        }),
        editPost: builder.mutation({
            query: post => ({
                url: `/posts/${post.id}`,
                method: 'PATCH',
                body: post
            }),
            //invalidates the specific {type: 'Post', id} tag. This will force a refetch of both the individual post from getPost, 
            //as well as the entire list of posts from getPosts, because they both provide a tag that matches that {type, id} value.
            invalidatesTags: (result, error, arg) => [{
                type: 'Post',
                id: arg.id
            }]
        }),
        
        getUsers: builder.query({
            query: () => '/users'
        }),

        addReaction: builder.mutation({
            query: ({ postId, reaction }) => ({
                url: `/posts/${postId}/reactions`,
                method: 'POST',
                // In a real app, we'd probably need to base this on user ID somehow so that a user can't do the same reaction more than once
                body: { reaction }
            }),
            invalidatesTags: (result, error, arg) => [
                {   type: 'Post', id: arg.postId    }
            ],
            //called when the individual mutation is started, used for optimistic update in the client side 
            //i.e save state in client side while proceeding with the server side
            async onQueryStarted({ postId, reaction}, { dispatch, queryFulfilled}){
                // `updateQueryData` requires the endpoint name and cache key arguments, so it knows which piece of cache state to update
                const patchResult = dispatch(
                    apiSlice.util.updateQueryData('getPosts', undefined, draft => {
                        //The draft is Immer-wrapped and can be "mutated" like in createSlice
                        const post = draft.find(post => post.id === postId)
                        if(post){
                            post.reaction[reaction]++
                        }
                    })
                )

                try {
                    await queryFulfilled
                } catch {
                    patchResult.undo()
                }
            },

        })
    })
})

//export the autogenerated hook for the 'getPosts' query endpoint
export const {  useGetPostsQuery, useGetPostQuery, useAddNewPostMutation, useEditPostMutation,
                useGetUsersQuery,
                useAddReactionMutation } = apiSlice