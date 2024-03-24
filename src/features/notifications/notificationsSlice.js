import React from 'react'
import { createAsyncThunk, createSlice, createEntityAdapter, createSelector, isAnyOf } from '@reduxjs/toolkit'
import { client } from '../../api/client'

import { forceGenerateNotifications } from '../../api/server'
import { apiSlice } from '../api/apiSlice'

const notificationsReceived = createAction('notifications/notificationsReceived')

export const extendedApi = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNotifications: builder.query({
            query: () => '/notifications',
            async onCacheEntryAdded(
                arg,
                { updateCachedData, cacheDataLoaded, cacheEntryRemoved, dispatch }
            ){
                //create a web socket connection when the cache subscription starts
                const ws = new WebSocket('ws://localhost')
                try {
                    //wait for the initial query to resolve before proceeding
                    await cacheDataLoaded

                    //when the data is received from the socket connection to the server, update query result with received msg
                    const listener = event => {
                        const message = JSON.parse(event.data)
                        switch(message.type){
                            case 'notifications': {
                                updateCachedData(draft => {
                                    //insert all received notifications from the websocket into the existing RTKQ cache array
                                    draft.push(...message.payload)
                                    draft.sort((a, b)=> b.date.localeCompare(a.date))
                                })
                                //dispatch an additional action so we can track "read" state
                                dispatch(notificationsReceived(message.payload))
                                break
                            }
                            default:
                                break
                        }
                    }

                    ws.addEventListener('message', listener)
                } catch {
                    // no-op in case `cacheEntryRemoved` resolves before `cacheDataLoaded`, in which case `cacheDataLoaded` will throw
                }

                // cacheEntryRemoved will resolve when the cache subscription is no longer active
                await cacheEntryRemoved
                //perform cleanup steps once the `cacheEntryRemoved` promise resolves
                ws.close()
            }
        })
    })
})

export const { useGetNotificationsQuery } = extendedApi

const emptyNotifications = []

export const selectionNotificationsResult = extendedApi.endpoints.getNotifications.select()

const selectNotificationsData = createSelector(
    selectionNotificationsResult,
    notificationsResult => notificationsResult?.data ?? emptyNotifications
)

export const fetchNotificationsWebsocket = () => (dispatch, getState) => {
    const allNotifications = selectNotificationsData(getState())
    const [ latestNotification ] = allNotifications
    const latestTimestamp = latestNotification?.data.date ?? ''
    //hardcode a call to the mock server to simulate a server push scenario over websockets
    forceGenerateNotifications(latestTimestamp)
}

// const notificationsAdapter = createEntityAdapter({
//     sortComparer: (a, b) => b.date.localeCompare(a.date)
// })
const notificationsAdapter = createEntityAdapter()
const matchNotificationsReceived = isAnyOf(
    notificationsReceived,
    extendedApi.endpoints.getNotifications.matchFulfilled
)

export const fetchNotifications = createAsyncThunk('notifications/fetchNotifications', async (_, { getState})=>{
    const allNotifications = selectAllNotifications(getState())
    //we want to use the creation timestamp of the most recent notification as part of our request, 
    //so that the server knows it should only send back notifications that are actually new.
    const [ latestNotification ] = allNotifications
    const latestTimestamp = latestNotification ? latestNotification.date : ''
    const response = await client.get(`/fakeApi/notifications?since=${latestTimestamp}`)
    return response.data
})

const notificationsSlice = createSlice({
    name: "notifications",
    initialState: notificationsAdapter.getInitialState(),//[],
    reducers: {
        allNotificationsRead(state, action){
            //state.forEach(notification => notification.read = true)
            Object.values(state.entities).forEach(notification => notification.read = true)
        },
    },
    extraReducers(builder){
        /*builder.addCase(fetchNotifications.fulfilled, (state, action)=>{
            // state.push(...action.payload)
            // state.forEach(notification => {
            //     //any notifications we've read are no longer new
            //     notification.isNew = !notification.read
            // })
            // state.sort((a, b)=> b.date.localeCompare(a.date))
            notificationsAdapter.upsertMany(state, action.payload)
            Object.values(state.entities).forEach(notification => notification.isNew = !notification.read)
        })*/
        builder.addMatcher(matchNotificationsReceived, (state, action) => {
            //add client side metadata for tracking new notifications
            const notificationsMetadata = action.payload.map(notification => ({
                id: notification.id,
                read: false, 
                isNew: true
            }))

            Object.values(state.entities).forEach(notification =>{
                //any notifications we've read are no longer new
                notification.isNew = !notification.read
            })

            notificationsAdapter.upsertMany(state, notificationsMetadata)
        })
    }
  })

export default notificationsSlice.reducer
//export const selectAllNotifications = state => state.notifications
//export const { selectAll: selectAllNotifications } = notificationsAdapter.getSelectors(state => state.notifications)
export const { selectAll: selectNotificationsMetadata, selectEntities: selectMetadatEntities } = 
                                                                            notificationsAdapter.getSelectors(state=> state.notifications)
export const { allNotificationsRead } = notificationsSlice.actions