import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
	Button, createTheme, Paper, Box, Typography, Grid, Menu, IconButton
} from '@mui/material'
import BrowsingUserIcon from './BrowsingUserIcon'
import browsingService from '../../services/browsingService'
import { setBrowsingCriteria } from '../../reducers/browsingReducer'
import { getUserLists } from '../../reducers/userListsReducer'
import { changeNotification } from '../../reducers/notificationReducer'
import { changeSeverity } from '../../reducers/severityReducer'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import ThumbUpIcon from '@mui/icons-material/ThumbUp'
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'
import BlockIcon from '@mui/icons-material/Block'
import MaleIcon from '@mui/icons-material/Male'
import FemaleIcon from '@mui/icons-material/Female'
import WcIcon from '@mui/icons-material/Wc'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import TodayIcon from '@mui/icons-material/Today';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGenderless } from '@fortawesome/free-solid-svg-icons'

const themelike = createTheme({
	palette: {
		primary: {
			main: '#4CBB17',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const themeunlike = createTheme({
	palette: {
		primary: {
			main: '#FF1E56',
		},
		secondary: {
			main: '#F5F5F5',
		},
	}
})

const UserPreviews = ({ pageUsers, browsingCriteria }) => {
	const userLists = useSelector(state => state.userLists)
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const likeUser = async (user_id) => {
		const result = await browsingService.likeUser(user_id)
		if (result === 'No profile picture') {
			dispatch(changeSeverity('error'))
			dispatch(changeNotification('You must set a profile picture before you can like other users.'))
		} else {
			dispatch(getUserLists())
		}
	}

	const unlikeUser = async (user_id) => {
		await browsingService.unlikeUser(user_id)
		dispatch(getUserLists())
	}

	const blockUser = async (user_id) => {
		await browsingService.blockUser(user_id)
		dispatch(getUserLists())
		dispatch(setBrowsingCriteria({ ...browsingCriteria }))
	}

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	return (
		pageUsers.map(user => {
			var button, gender
			if (userLists.connected.includes(user.id)) {
				button = <>
					<Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}>Unlike user</Button>
					<Button>Connected</Button>
				</>
			} else if (userLists.liked.includes(user.id)) {
				button = <Button theme={themeunlike} onClick={() => { unlikeUser(user.id) }}><ThumbDownAltIcon sx={{ mr: 1 }} />Unlike user</Button>
			} else {
				button = <Button theme={themelike} onClick={() => { likeUser(user.id) }}><ThumbUpIcon sx={{ mr: 1 }} />Like user</Button>
			}

			if (user.gender === 'male') {
				gender = <MaleIcon sx={{
					ml: 1,
					fontSize: '60px',
					color: '#89CFF0',
					filter: 'drop-shadow(0 2px 1px rgb(31, 73, 102))'
				}} />
			} else if (user.gender === 'female') {
				gender = <FemaleIcon sx={{
					ml: 1,
					fontSize: '60px',
					color: '#FF7779',
					filter: 'drop-shadow(0 2px 1px rgb(184, 84, 86))'
				}} />
			} else {
				gender = <FontAwesomeIcon icon={faGenderless} style={{
					fontSize: '50px',
					marginLeft: '15px',
					color: '#d859ff',
					filter: 'drop-shadow(0 2px 1px rgb(125, 52, 148))'
				}} />
			}
			console.log('user', user)
			if (!user.id) {
				return (<div key="emptyusers"></div>)
			} else
				return (
					<Paper key={`profile_container${user.id}`} sx={{ mb: 1 }}>
						<Grid container display='flex' sx={{ alignItems: 'center' }}>
							<Grid item>
								<BrowsingUserIcon user={user} />
							</Grid>
							<Grid item>
								<Box key={`profile_data${user.id}`}>
									<Grid display='flex' sx={{ alignItems: 'center' }}>
										<Typography
											variant='h3'
											onClick={() => navigate(`/userprofile/${user.id}`)}
											sx={{ cursor: 'pointer' }}
										>{user.username}</Typography>
										<Grid item>{gender}</Grid>
									</Grid>
									<Grid display='flex' sx={{ alignItems: 'center', mb: 1 }}>
										<Grid display='flex'
											sx={{
												mr: 1, mt: '4px', border: '1px solid gray',
												borderRadius: '10px', padding: '2px 5px',
												backgroundColor: '#f1f1f1'
											}}>
											<WhatshotIcon sx={{ color: 'red' }} />
											<Typography sx={{ fontWeight: 550 }}>{user.fame_rating}</Typography>
										</Grid>
										<Grid display='flex'>
											{button}
										</Grid>
									</Grid>
									<Box sx={{ ml: 1 }}>
										<Grid display='flex' sx={{ alignItems: 'center' }}>
											<WcIcon sx={{ color: 'gray', mr: 1 }} />
											<Typography sx={{ fontWeight: 550 }}>{user.sexual_pref}</Typography>
										</Grid>
										<Grid display='flex' sx={{ alignItems: 'center' }}>
											<LocationOnIcon sx={{ color: 'gray', mr: 1 }} />
											<Typography sx={{ fontWeight: 550 }}>{user.user_location} ({Math.floor(user.distance)} km)</Typography>
										</Grid>
										<Grid display='flex' sx={{ alignItems: 'center' }}>
											<TodayIcon sx={{ color: 'gray', mr: 1 }} />
											<Typography sx={{ fontWeight: 550 }}>{`${user.age} years old`}</Typography>
										</Grid>
									</Box>
									<Grid item>
											<IconButton
												arial-label='more'
												id='long-button'
												aria-controls={open ? 'long-menu' : undefined}
												aria-expanded={open ? 'true' : undefined}
												aria-haspopup='true'
												onClick={handleClick}
											>
												<MoreVertIcon />
											</IconButton>
											<Menu
												anchorEl={anchorEl}
												open={open}
												onClose={handleClose}
											>
												<Button theme={themeunlike} onClick={() => { blockUser(user.id) }} sx={{ mt: 1 }}>
													<BlockIcon sx={{ mr: 1 }} />
													Block user
												</Button>
											</Menu>
										</Grid>
								</Box>
							</Grid>
						</Grid>
					</Paper>
				)
		}
		))
}

export default UserPreviews
