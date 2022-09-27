import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/userReducer'
import notificationReducer from './reducers/notificationReducer'
import severityReducer from './reducers/severityReducer'
import profileReducer from './reducers/profileReducer'
import onlineUsersReducer from './reducers/onlineUsersReducer'
import browsingReducer from './reducers/browsingReducer'

const store = configureStore({
	reducer: {
		user: userReducer,
		notification: notificationReducer,
		severity: severityReducer,
		profile: profileReducer,
		onlineUsers: onlineUsersReducer,
		browsingCriteria: browsingReducer,
	}
})

export default store
