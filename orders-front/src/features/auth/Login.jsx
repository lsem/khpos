import React from "react";
import { TextField, Button, InputAdornment } from "@material-ui/core";
import { MailOutline, Lock } from "@material-ui/icons";
import { makeStyles } from "@material-ui/core/styles";
import { connect } from "react-redux";
import { thunkApiLogin } from "./authSlice";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },

  loginForm: {
    flex: "1 1 auto",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    padding: `${theme.spacing(2)}px ${theme.spacing(3)}px`,
    margin: `0 ${theme.spacing(2)}px`,
    minWidth: 300,
    maxWidth: 400,
    backgroundColor: theme.palette.background.paper,
    borderRadius: 3,
    boxShadow: theme.shadows[2],

    "&>*": {
      marginTop: theme.spacing(2),
    },
  },
}));

function Login({ apiLogin }) {
  const classes = useStyles();

  const [userOrEmail, setUserOrEmail] = React.useState("");
  const [pass, setPass] = React.useState("");
  const [userOrEmailIsValid, setUserOrEmailIsValid] = React.useState(true);
  const [passIsValid, setPassIsValid] = React.useState(true);

  // const validateEmail = (str) => {
  //   const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  //   return re.test(String(str).toLowerCase());
  // };

  const handleEmailBlur = () => {
    setUserOrEmailIsValid(!!userOrEmail);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    apiLogin(userOrEmail, pass);
  };

  return (
    <>
      <div className={classes.root}>
        <form className={classes.loginForm} onSubmit={handleFormSubmit}>
          <TextField
            error={!userOrEmailIsValid}
            helperText={userOrEmailIsValid ? "" : "невірний e-mail"}
            value={userOrEmail}
            onChange={(e) => {
              setUserOrEmail(e.target.value);
              setUserOrEmailIsValid(!!e.target.value);
            }}
            onBlur={handleEmailBlur}
            autoFocus
            variant="outlined"
            label="користувач"
            type="text"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MailOutline />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            error={!passIsValid}
            variant="outlined"
            helperText={passIsValid ? "" : "пароль не може бути порожній"}
            value={pass}
            onChange={(e) => {
              setPass(e.target.value);
              setPassIsValid(!!e.target.value);
            }}
            label="пароль"
            type="password"
            autoComplete="current-password"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock />
                </InputAdornment>
              ),
            }}
          />
          <Button
            type="submit"
            color="primary"
            disabled={!(!!userOrEmail && !!pass && userOrEmailIsValid && passIsValid)}
          >
            Увійти
          </Button>
        </form>
      </div>
    </>
  );
}

const mapStateToProps = () => ({
});

const mapDispatchToProps = (dispatch) => ({
  apiLogin: (email, password) => {
    dispatch(thunkApiLogin(email, password));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
