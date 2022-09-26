import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { changeNotification } from '../reducers/notificationReducer'
import { changeSeverity } from '../reducers/severityReducer'
import signUpService from '../services/signUpService'
import { setUser } from '../reducers/userReducer'
import { getProfileData } from '../reducers/profileReducer'

const Logout = ({ socket }) => {
	const dispatch = useDispatch()
	const navigate = useNavigate()

	useEffect(() => {
		signUpService.logOutUser()
		dispatch(setUser(""))
		dispatch(getProfileData())
		dispatch(changeSeverity('success'))
		dispatch(changeNotification("Logged out. Thank you for using Matcha!"))
		socket.emit("logOut", { socketID: socket.id })
		navigate('/login')
	}, [dispatch, navigate, socket])
}

export default Logout
