import React, { useCallback, useEffect, useState } from "react";
import styles from "./index.module.css";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-hot-toast";
import { useColorPalates } from "../../providers/theme-provider/hooks";
import { OTPInput } from "../../components/otp-input";
import config from "./config?.json";
import { useLocalization } from "../../hooks";
import { useRouter } from "next/router";
import jwt_decode from "jwt-decode";
import { useCookies } from "react-cookie";
import { useDispatch, useSelector } from "react-redux";
import { verifyOtp } from "../../store/actions/user/verify-otp";
import { selectUserFetching, setLoading } from "../../store/slices/userSlice";

const OtpPage: React.FC = () => {
  const [otp, setOtp] = useState("");

  const theme = useColorPalates();
  const { logo, showLogo, showSplitedView, title, otpLength } = config?.component;
  const router = useRouter();
  const dispatch = useDispatch();
  const t = useLocalization();

  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  useEffect(() => {
    if (!router.query.state || router.query.state?.length !== 10) {
      router.push('/login')
    }
  }, [router]);

  const loading = useSelector(selectUserFetching);

  const handleLogin = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (navigator.onLine) {
        dispatch(setLoading(true));
        if (otp.length === Number(otpLength)) {
          //@ts-ignore
          dispatch(verifyOtp({
            loginId: router.query.state,
            password: otp,
            applicationId: process.env.NEXT_PUBLIC_USER_SERVICE_APP_ID,
            //@ts-ignore
          })).then((res: any) => {
            console.log({ res })
            dispatch(setLoading(false))
            if (res.type.includes('fulfilled')) {
              if (res.payload.params.status === "Success") {
                let expires = new Date();
                expires.setTime(
                  expires.getTime() +
                  res.payload.result.data.user.tokenExpirationInstant * 1000
                );
                removeCookie("access_token");
                setCookie("access_token", res.payload.result.data.user.token, {
                  path: "/",
                  expires,
                });
                const phoneNumber = router.query.state;
                // @ts-ignore
                localStorage.setItem("phoneNumber", phoneNumber);
                const decodedToken = jwt_decode(res.payload.result.data.user.token);
                //@ts-ignore
                localStorage.setItem("userID", decodedToken?.sub);
                localStorage.setItem("auth", res.payload.result.data.user.token);
                // @ts-ignore
                // setUserId(analytics, localStorage.getItem("userID"));

                setTimeout(() => {
                  router.push("/");
                }, 10);
              }
              else {
                toast.error(res.payload.params.err);
              }
            }
          })
        }
      } else {
        toast.error(`${t("label.no_internet")}`)
      }

    },
    [otp.length]
  );

  return (
    <>
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
      ></meta>
      <div className={styles.main}>
        {showSplitedView && (
          <div
            className={styles.leftColumn}
            style={{ background: theme?.primary?.main }}
          >
            {showLogo && (
              <div className={styles.logo}>
                <img src={logo} width={150} height={40} alt="" />
              </div>
            )}
          </div>
        )}
        <div className={styles.rightColumn}>
          <div className={styles.form}>
            {/* Form */}
            <Typography
              variant="h4"
              textAlign="left"
              width="90%"
              color="#1E232C"
              sx={{ m: 2 }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              textAlign="left"
              width="90%"
              color="#838BA1"
            >
              Enter the verification code we just sent on your mobile number
            </Typography>
            <Box
              component="form"
              onSubmit={handleLogin}
              sx={{ mt: 1, width: "90%" }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <OTPInput
                  separator={<></>}
                  value={otp}
                  onChange={setOtp}
                  length={otpLength}
                />
              </Box>
              <Button
                variant="contained"
                sx={{
                  textTransform: "none",
                  mt: 3,
                  mb: 4,
                  p: 1,

                  // background: config?.theme.secondaryColor.value,
                  background: theme.primary.main,
                  borderRadius: "10px",
                  width: "50%",
                }}
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Login"
                )}
              </Button>
            </Box>
          </div>
        </div>
      </div>
    </>
  );
};

export default OtpPage;
