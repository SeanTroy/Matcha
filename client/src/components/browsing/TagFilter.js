import { useState, useEffect } from 'react'
import {
	TextField, Autocomplete
} from '@mui/material'
import browsingService from '../../services/browsingService'

import { useDispatch, useSelector } from 'react-redux'

const TagFilter = ({ setTagFilter, setDisplaySettings }) => {
	const [menuTags, setMenuTags] = useState([])
	const displaySettings = useSelector(state => state.displaySettings)
	const dispatch = useDispatch()

	useEffect(() => {
		const getTags = async () => {
			const allTags = await browsingService.getAllTags()
			console.log("All tags: ", allTags)
			setMenuTags(allTags)
		}
		getTags()
	}, [])

	const handleTagFilter = (value) => {
		console.log(value)
		setTagFilter(value)
		dispatch(setDisplaySettings({ ...displaySettings, page: 1, offset: 0 }))
	}

	return (
		<Autocomplete
			sx={{ ml: 2, width: 300 }}
			multiple
			id="tags"
			options={menuTags}
			getOptionLabel={(tag) => tag.tag_content}
			defaultValue={[]}
			onChange={(event, newValue) => handleTagFilter(newValue)}
			renderInput={(params) => (
				<TextField
					{...params}
					sx={{ width: 300 }}
					label="Tags"
					placeholder="Tags"
				/>
			)}
		/>
	)
}

export default TagFilter
