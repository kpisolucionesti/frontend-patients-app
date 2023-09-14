import React, { useState } from "react";
import { Box, Tab, Tabs } from "@mui/material";
import ListIcon from '@mui/icons-material/List';
import AddToQueueIcon from '@mui/icons-material/AddToQueue';
import CurrentPatients from "./CurrentPatients";
import TablePatients from "./TablePatients";

const PatientsView = () => {
    const [value, setValue] = useState(0)

    const handleChange = (event, newValue) => {
        setValue(newValue)
    }

    return(
        <Box >
            <Box>
                <Tabs
                    centered
                    value={value} 
                    onChange={handleChange}
                >
                    <Tab icon={<AddToQueueIcon />} iconPosition="start" label="ACTUALES" />
                    <Tab icon={<ListIcon />} iconPosition="start"  label='ANTIGUOS' />
                </Tabs>
            </Box>
            <Box>
                {value === 0 && (
                    <CurrentPatients />
                )}
                {value === 1 && (
                    <TablePatients />
                )}
            </Box>
        </Box>
    )
}

export default PatientsView