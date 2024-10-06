import { Avatar, Card, Container, CssBaseline } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { getHospitalProfile } from '../../Utils/SmartContractUtils';
import { useSelector } from 'react-redux';
import { enqueueSnackbar } from 'notistack';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

const HospiProfile = () => {

    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const accountAddress = useSelector(state => state.accountAddress);
    const getProfile = async (accountAddress) => {
        const res = await getHospitalProfile(accountAddress);
        if (res.message) {
            enqueueSnackbar(res.message, { variant: "error" });
        }
        else {
            setProfile(res)
        }
        setIsLoading(false);
    }
    useEffect(() => {
        getProfile(accountAddress);
    }, [accountAddress]);

    return (
        <>
            <Container component="main" maxWidth="s" minWidth="xs"><CssBaseline />
                <Backdrop
                    sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                    open={isLoading}
                >
                    <CircularProgress color="inherit" />
                </Backdrop>
                {profile && <><Card sx={{ margin: "auto", width: "60vw", minWidth: "400px", padding: "15px 20px", display: "flex" }}>
                    <div style={{ display: "flex" }}>
                        <Avatar sx={{ bgcolor: "red", width: 100, height: 100, fontSize: 50 }} aria-label="recipe">
                            {profile["hospname"][0]}
                        </Avatar>
                        <div style={{ margin: "auto 60px", fontSize: "24px" }}><p> {profile["hospname"]} </p></div>

                    </div>
                </Card><Card sx={{ margin: "auto", width: "60vw", minWidth: "400px", padding: "15px 20px" }}>
                        <h3>DETAILS</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto" }}>
                            <h4 style={{ color: "grey" }}>E-mail ID : </h4>
                            <b><h4> {profile["email"]} </h4></b>
                            <h4 style={{ color: "grey" }}>Phone Number : </h4>
                            <b><h4>{Number(profile["phone"])}</h4></b>
                            <h4 style={{ color: "grey" }}>License : </h4>
                            <b><h4>{profile["license"]}</h4></b>
                        </div>
                    </Card></>}

            </Container>
        </>
    );
}

export default HospiProfile;
