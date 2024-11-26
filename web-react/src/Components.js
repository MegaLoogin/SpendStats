import { Backdrop, CircularProgress, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export function SelectInput(props){
    const { labelName, value, setValue, array, required, callback, fullWidth = true } = props;
    return (
    <FormControl fullWidth={fullWidth} required={required} style={{minWidth: "150px"}}>
        <InputLabel>{labelName}</InputLabel>
        <Select label={labelName} onChange={(e) => {setValue(e.target.value); callback(e.target.value);}} value={value} required={required}>
            {array.map(v => <MenuItem key={v[0]} value={v[0]}>{v[1]}</MenuItem>)}
        </Select>
    </FormControl>);
}

export function SimpleBackdrop(props) {
    const { openState } = props;
    return (
        <div>
            <Backdrop
            sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
            open={openState}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>
    );
}

export function BasicDatePicker(props) {
    const { label, value, setValue, callback } = props;
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DemoContainer components={['DatePicker']}>
                <DatePicker label={label} value={value} onChange={v => { setValue(v); callback(v, v);}} disableFuture/>
            </DemoContainer>
        </LocalizationProvider>
    );
}