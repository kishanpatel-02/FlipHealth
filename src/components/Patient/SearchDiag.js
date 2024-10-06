import { Container, CssBaseline, IconButton, InputBase, Paper, Box, Select, FormControl, InputLabel, MenuItem } from '@mui/material';
import React, { useRef, useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import SearchDiagResult from './SearchDiagResult';
import { getAllDiagnostics, getDiagnosticForPatient, getDiagProfile } from '../../Utils/SmartContractUtils';
import { useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const SearchDiag = () => {
    const accountAddress = useSelector(state => state.accountAddress);
    const search = useRef("");
    const [searchType, setSearchType] = useState('name');
    const [results, setResults] = useState([]);
    const [grantedDiag, setGrantedDiag] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const handleChange = (event) => {
        setSearchType(event.target.value);
    }
    const getByAddress = async (address) => {
        setIsLoading(true);
        const result = await getDiagProfile(address, accountAddress);
        // console.log(result);
        if (result.message) {
            enqueueSnackbar(result.message, { variant: "error" })
        }
        else {
            const newRes = {
                name: result["Diagname"],
                email: result["email"],
                phone: result["phone"],
                license: result["license"],
                myAdd: result.myAdd
            }
            // console.log(newRes);
            setResults([newRes]);
            // console.log(results)
        }
        setIsLoading(false);
    }
    const fetchDiagnostics = async () => {
        setIsLoading(true);
        const res = await getDiagnosticForPatient(accountAddress)
        if (res.message) {
            enqueueSnackbar(res.message, { variant: "error" });
        }
        else {
            const newres = (res.filter(item => item["myAdd"] !== "0x0000000000000000000000000000000000000000")).map(item => {
                return {
                    name: item["name"],
                    email: item["email"],
                    phone: item["phone"],
                    license: item["license"],
                    myAdd: item["myAdd"]
                }
            })
            setGrantedDiag(newres);
        }
        setIsLoading(false);
    }
    const getByName = async (name) => {
        setIsLoading(true);
        const res = await getAllDiagnostics(accountAddress);
        const regex = new RegExp(name, "gi");
        const newRes = res.map(
            item => {
                return {
                    name: item["name"],
                    email: item["email"],
                    phone: item["phone"],
                    license: item["license"],
                    myAdd: item["myAdd"]
                }
            }
        )
        const result = newRes.filter(
            item => (name !== "" && regex.test(item["name"]))
        )
        // console.log(result);
        setResults(result);
        setIsLoading(false);
    }
    const searchHandler = (e) => {
        e.preventDefault();

        fetchDiagnostics();
        if (searchType === "name") {
            getByName(search.current.value);
        }
        // if search by address
        if (searchType === "address") {
            getByAddress(search.current.value);
        }
    }
    return (
        <>
            <Container component="main" maxwidth="s" minwidth="xs" sx={{ minHeight: "50vh" }}><CssBaseline /><Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={isLoading}
            >
                <CircularProgress color="inherit" />
            </Backdrop><Paper onSubmit={searchHandler}
                component="form"
                sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400, margin: '20px auto' }}
            >   <FormControl ><InputLabel id="demo-simple-select-label">Search By</InputLabel><Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={searchType}
                label="Search Type"
                onChange={handleChange}
                required
            >
                <MenuItem value={"name"}>Name</MenuItem>
                <MenuItem value={"address"}>Address</MenuItem>

            </Select></FormControl>
                    <InputBase
                        sx={{ ml: 1, flex: 1 }}
                        placeholder="Search"
                        inputProps={{ 'aria-label': 'search ' }}
                        inputRef={search}
                    />
                    <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
                        <SearchIcon />
                    </IconButton>

                </Paper>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: "10px" }}>
                    {results.length !== 0 && results.map((item, index) => <SearchDiagResult key={index} data={item} grantedDiag={grantedDiag} isLoading={isLoading} setIsLoading={setIsLoading} />)}
                    {results.length === 0 && !search.current.value && <h5>ENTER A SEARCH QUERY</h5>}
                    {results.length === 0 && search.current.value && <h5>NO RESULTS FOUND</h5>}
                </Box>
            </Container>
        </>
    );
}

export default SearchDiag;
