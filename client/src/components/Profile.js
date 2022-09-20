import { useState, useEffect } from 'react'
import { changeNotification } from '../reducers/notificationReducer'
import { useSelector, useDispatch } from 'react-redux'
import {
	Typography, Button, Paper, TextField, FormControl, FormLabel, createTheme,
	RadioGroup, FormControlLabel, Radio, InputLabel, Select, MenuItem, TextareaAutosize,
} from '@mui/material'
import { Container } from '@mui/system';
import { IconUserCircle } from '@tabler/icons';
import Notification from './Notification'
import { changeSeverity } from '../reducers/severityReducer'
import { getProfileData } from '../reducers/profileReducer'
import profileService from '../services/profileService'

export const ProfileSetUpForm = () => {
	const dispatch = useDispatch()

	const theme = createTheme({
		palette: {
			primary: {
				main: '#FF1E56',
			},
			secondary: {
				main: '#F5F5F5',
			},
		}
	})

	const submitUserInfo = (event) => {
		event.preventDefault()

		const ProfileSettings = {
			gender: event.target.gender.value,
			age: event.target.age.value,
			location: event.target.location.value,
			sexual_pref: event.target.sexual_pref.value,
			biography: event.target.biography.value,
		}

		profileService.setUpProfile(ProfileSettings).then((result) => {
			if (result === true) {
				dispatch(changeSeverity('success'))
				dispatch(changeNotification("Profile Settings Updated"))
			} else {
				dispatch(changeSeverity('error'))
				dispatch(changeNotification(result))
			}
		})

		console.log("Profile Settings: ", ProfileSettings)
	}

	const imageStyle = {
		display: 'relative',
		marginLeft: 'calc(50% + 5px)',
		transform: 'translate(-50%)',
		filter: 'drop-shadow(0px 0px 3px rgb(241 25 38 / 0.8))',
	}

	const [age, setAge] = useState('');
	const [sexual_pref, setSexpref] = useState('bisexual');

	const handleAge = (event) => {
		setAge(event.target.value);
	}

	const handleSexpref = (event) => {
		setSexpref(event.target.value);
	}

	return (
		<Container maxWidth='md' sx={{ pt: 5, pb: 5 }}>
			<Paper elevation={10} sx={{ padding: 3 }}>
				<IconUserCircle size={100} color="#F11926" style={imageStyle} />
				<Typography variant='h5' align='center'
					sx={{ fontWeight: 550 }}>Profile</Typography>
				<Typography align='center' xs={{ mb: 4 }}>
					Please enter some details about yourself
				</Typography>
				<form onSubmit={submitUserInfo}>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='gender'>Gender</FormLabel>
						<RadioGroup row aria-labelledby='gender' name='gender'>
							<FormControlLabel value='female' control={<Radio />} label='Female' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='other' control={<Radio />} label='Other' />
						</RadioGroup>
					</FormControl>
					<FormControl fullWidth sx={{ mb: 2 }}>
						<InputLabel id='age'>Age</InputLabel>
						<Select labelId='age' id='age' name='age' value={age} onChange={handleAge} required>
							{[...Array(83).keys()].map((i) => (
								<MenuItem value={i + 18} key={i + 18}>{i + 18}</MenuItem>
							))}
						</Select>
					</FormControl>
					<TextField fullWidth margin='normal' name="location" label='Location'
						placeholder="Location" sx={{ mb: 2 }} required></TextField>
					<FormControl sx={{ mb: 2 }}>
						<FormLabel id='sexual_pref'>Sexual Preference</FormLabel>
						<RadioGroup row aria-labelledby='sexual_pref' name='sexual_pref' value={sexual_pref} onChange={handleSexpref} >
							<FormControlLabel value='bisexual' control={<Radio />} label='Bisexual' />
							<FormControlLabel value='male' control={<Radio />} label='Male' />
							<FormControlLabel value='female' control={<Radio />} label='Female' />
						</RadioGroup>
					</FormControl>
					<br />
					<FormLabel id='biography' >Biography</FormLabel>
					<TextareaAutosize
						name='biography'
						style={{ width: '100%', marginTop: '10px' }}
						maxLength={500}
						minRows={5}
						placeholder='Short description of you here...'
					/>
					<Button type="submit" variant='contained' theme={theme}
						size='large' sx={{ mt: 1 }}>
						Save settings
					</Button>
				</form>
				<Notification />
			</Paper>
		</Container>
	)

}

const Profile = () => {
	const [isLoading, setLoading] = useState(true);
	const dispatch = useDispatch()

	useEffect(() => {
		const getData = async () => {
			await dispatch(getProfileData())
			setLoading(false);
		}
		getData()
	}, [dispatch])

	const profileData = useSelector(state => state.profile)

	if (isLoading) {
		return <div>Loading...</div>;
	}

	// console.log(profileData.profile_pic['picture_data'])
	// const profile_pic = require(`${profileData.profile_pic['picture_data']}`)
	const profile_pic = require('../images/demo_profilepic.jpeg')
	const other_pictures = profileData.other_pictures
	// console.log(other_pictures)

	if (!profileData.id) {
		return (
			<>
				<ProfileSetUpForm />
			</>
		)
	} else {
		return (
			<>
				<div id="profile_container">
					<div id="picture_container">
						<img key={profileData.profile_pic.picture_id} alt="profile_picture" src={profile_pic} height="200px"></img>
					</div>
					<div id="profile_data">
						<h1>{profileData.username}</h1>
						<h3>Fame rating: {profileData.fame_rating}</h3>
						<br></br>
						<p>First name: {profileData.firstname}</p>
						<p>Last name: {profileData.lastname}</p>
						<p>Email address: {profileData.email}</p>
						<p>Gender: {profileData.gender}</p>
						<p>Age: {profileData.age}</p>
						<p>Sexual preference: {profileData.sexual_pref}</p>
						<p>Location: {profileData.user_location}</p>
						<p>Biography: {profileData.biography}</p>
						<br></br>
						<button>Change password</button>
					</div>
				</div>
				<div id="other_pictures">
					{other_pictures.map(picture =>
						<div>
							<img key={picture.picture_id} alt="random_picture" height="100px" src={picture.picture_data}></img>
						</div>
					)}
				</div>
			</>
		)
	}
}

export default Profile
