import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import CircularProgress from '@mui/material/CircularProgress';
import Footer from '../../components/Footer';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { getHospitalProfile, registerHospital } from '../../Utils/SmartContractUtils';
import ConfirmDialog from '../../components/ConfirmDialog';


const HospitalLogin = () => {
    const { enqueueSnackbar } = useSnackbar();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [confirm, setConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const name = useRef();
    const email = useRef();
    const phone = useRef();
    const license = useRef();
    const [nameError, setNameError] = useState({
        error: false,
        message: ""
    });
    const [emailError, setEmailError] = useState({
        error: false,
        message: ""
    });
    const [phoneError, setPhoneError] = useState({
        error: false,
        message: ""
    });
    const [licenseError, setLicenseError] = useState({
        error: false,
        message: ""
    });
    const [accounts, setAccounts] = useState([]);
    useEffect(() => {

        // Asking if metamask is already present or not
        if (window.ethereum) {
            enqueueSnackbar("Please give access to only one account at a time, otherwise, the first account selected in Metamask would be used to LOGIN!", { variant: "info" })
            window.ethereum
                .request({ method: "eth_requestAccounts" }).then((res) => {
                    if (res.length === 0) {
                        enqueueSnackbar("Please connect at least one account to continue!", { variant: "error" })
                        navigate("/");
                    }
                    else {
                        return res;
                    }
                })
                .then((res) => {
                    setAccounts(res);
                    const authenticate = async () => {
                        const getProfile = await getHospitalProfile(res[0]);
                        if (!getProfile || getProfile["hospname"] === "") {
                            return;
                        }
                        else if (getProfile.message) {
                            enqueueSnackbar(getProfile.message, { variant: "error" });
                            return;
                        }
                        else {
                            const profile = {
                                name: getProfile["hospname"],

                                email: getProfile["email"],


                                mobile: Number(getProfile["phone"]),
                                license: getProfile["license"],
                            }
                            sessionStorage.setItem("credential", JSON.stringify({ accountType: "HOSPITAL", accountAddress: res[0], profile: profile }))
                            enqueueSnackbar(`Welcome, ${profile.name}`);
                            dispatch({ type: "LOGIN", payload: { accountType: "HOSPITAL", accountAddress: res[0], profile: profile } })
                            navigate("/Dashboard");
                        }
                    }
                    authenticate();
                    setIsLoading(false)
                }).catch(err => {
                    enqueueSnackbar("Please Log in to Metamask to Proceed!", { variant: "error" });
                    navigate("/");
                });
        } else {
            enqueueSnackbar("Please install Metamask to Proceed!", { variant: "error" });
            navigate("/");

        }// eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const handleSubmit = async () => {

        // add field for degree name
        const data = { name: name.current.value, phone: phone.current.value, email: email.current.value, license: license.current.value };
        let flag = 0;
        if (data.name === "") {
            setNameError({
                error: true,
                message: "Name cannot be empty!"
            });
            flag = 1;
        }
        else {
            setNameError({
                error: false,
                message: ""
            });
        }
        if (data.phone === "" || data.phone.length !== 10 || isNaN(data.phone)) {
            setPhoneError({
                error: true,
                message: "Phone number cannot be empty and must be a number!"
            });
            flag = 1;
        }
        else {
            setPhoneError({
                error: false,
                message: ""
            });
        }
        if (data.email === "" || !data.email.includes('@')) {
            setEmailError({
                error: true,
                message: "Email cannot be empty and must be a valid email address!"
            });
            flag = 1;
        }
        else {
            setEmailError({
                error: false,
                message: ""
            });
        }
        if (data.license === "") {
            setLicenseError({
                error: true,
                message: "License cannot be empty!"
            });
            flag = 1;
        }
        else {
            setLicenseError({
                error: false,
                message: ""
            });
        }
        if (flag === 1) {
            return;
        }
        const res = await registerHospital(data, accounts[0]);
        enqueueSnackbar("Please wait for a few seconds, Registration takes time!", { variant: "info" })
        if (res.message) {
            enqueueSnackbar(res.message, { variant: "error" });
        }
        else {
            setIsLoading(true);
            setTimeout(async () => {
                const getProfile = await getHospitalProfile(accounts[0]);

                if (getProfile.message) {
                    enqueueSnackbar(getProfile.message, { variant: "error" });
                    setIsLoading(false);
                }
                else {
                    const profile = {
                        name: getProfile["hospname"],

                        email: getProfile["email"],


                        mobile: Number(getProfile["phone"]),
                        license: getProfile["license"],
                    }
                    setIsLoading(false);
                    sessionStorage.setItem("credential", JSON.stringify({ accountType: "HOSPITAL", accountAddress: accounts[0], profile: profile }))
                    enqueueSnackbar(`Welcome, ${profile.name}`);
                    dispatch({ type: "LOGIN", payload: { accountType: "HOSPITAL", accountAddress: accounts[0], profile: profile } })
                    navigate("/Dashboard");
                }
            }, 20000)

        }
    };

    return (
        <>
            {isLoading && <Box sx={{ display: 'flex', position: "absolute", top: "48%", left: "48%" }}>
                <CircularProgress />
            </Box>}
            {!isLoading && <><Navbar />
                <Container component="main" maxWidth="s">
                    <CssBaseline />
                    <ConfirmDialog open={confirm} setOpen={setConfirm} title={"Confirm Registration"} children={"Would you like to register. You will be charged 0.1 ETH for this transaction."} onConfirm={handleSubmit} />
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                            <LocalHospitalIcon />
                        </Avatar>
                        <Typography component="h1" variant="h5">
                            Sign up as a Hospital
                        </Typography>
                        <Box component="form" sx={{ mt: 1, maxWidth: "600px", marginBottom: "60px" }}>
                            <TextField
                                margin="normal"
                                fullWidth
                                name="name"
                                label="Name"
                                type="text"
                                id="name"
                                inputRef={name}
                                error={nameError.error}
                                helperText={nameError.message}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="email"
                                label="E-mail"
                                name="email"
                                type='email'
                                inputRef={email}
                                error={emailError.error}
                                helperText={emailError.message}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="phone"
                                label="Mobile Number"
                                name="phone"
                                type='text'
                                inputRef={phone}
                                error={phoneError.error}
                                helperText={phoneError.message}
                            />
                            <TextField
                                margin="normal"
                                fullWidth
                                id="license"
                                label="License"
                                name="license"
                                inputRef={license}
                                error={licenseError.error}
                                helperText={licenseError.message}
                            />
                            <FormControlLabel
                                control={<Checkbox value="remember" color="primary" />}
                                label="Remember me"
                            />
                            <Button
                                onClick={() => setConfirm(true)}
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Sign Up
                            </Button>
                            <Grid container>
                                <Grid item xs>
                                    <Link href="#" variant="body2">
                                        Forgot password?
                                    </Link>
                                </Grid>
                            </Grid>
                        </Box>
                    </Box>
                </Container><Footer /></>}
        </>
    );

}


export default HospitalLogin;
