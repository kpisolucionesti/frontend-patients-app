import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { BackendAPI } from "../../services/BackendApi";
import ForcePasswordChange from "./ForcePasswordChange";

const SignIn = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [values, setValues] = useState({ username: "", password: "" });
  const [error, setError] = useState(searchParams.get('expired') === '1');
  const [errorMessage, setErrorMessage] = useState(searchParams.get('expired') === '1' ? "Su sesión ha expirado por inactividad. Por favor, inicie sesión nuevamente." : "");
  const [showForceChange, setShowForceChange] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const handleClickShowPassword = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    if (searchParams.get('expired') === '1') {
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleValueChange = (target) => {
    setValues({ ...values, [target.name]: target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(false);
    setErrorMessage("");
    if (!values.username || !values.password) {
      setError(true);
      setErrorMessage("Por favor llenar todos los campos");
      return;
    }
    try {
      const response = await BackendAPI.auth.signIn(values.username, values.password);
      if (response.status === "success") {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        localStorage.setItem("user_permissions", JSON.stringify(response.user.permissions));
        if (response.user.must_change_password) {
          setShowForceChange(true);
        } else {
          navigate("/patients", { replace: true });
        }
      } else {
        setError(true);
        setErrorMessage(response.message || "Error al iniciar sesión");
      }
    } catch (e) {
      const msg = e.response?.data?.message || "Error de conexión con el servidor";
      setError(true);
      setErrorMessage(msg);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ maxWidth: 400, width: "100%", mx: 2 }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Typography variant="h4" fontWeight="bold" color="primary">
              EMERBOARD
            </Typography>
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
              INICIAR SESION
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              variant="standard"
              fullWidth
              label="Usuario"
              name="username"
              value={values.username}
              onChange={({ target }) => handleValueChange(target)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              variant="standard"
              fullWidth
              label="Contrasena"
              name="password"
              type={showPassword ? "text" : "password"}
              value={values.password}
              onChange={({ target }) => handleValueChange(target)}
              sx={{ mb: 3 }}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClickShowPassword}
                      edge="end"
                      tabIndex={-1}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              color="primary"
            >
              Entrar
            </Button>
            <Button fullWidth variant="text" onClick={() => navigate('/forgot-password')} sx={{ mt: 1 }}>
              Olvidaste tu contrasena?
            </Button>
          </form>
        </CardContent>
      </Card>

      {showForceChange && (
        <ForcePasswordChange onComplete={() => navigate("/patients", { replace: true })} />
      )}
    </Box>
  );
};

export default SignIn;
