import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Avatar,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { BackendAPI } from "../../services/BackendApi";

const SignIn = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: "", password: "" });
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleValueChange = (target) => {
    setValues({ ...values, [target.name]: target.value });
    setError(false);
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!values.email || !values.password) {
      setError(true);
      setErrorMessage("Por favor llenar todos los campos");
      return;
    }
    try {
      const response = await BackendAPI.auth.signIn(values.email, values.password);
      if (response.status === "success") {
        localStorage.setItem("auth_token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        navigate("/patients", { replace: true });
      } else {
        setError(true);
        setErrorMessage(response.message || "Error al iniciar sesión");
      }
    } catch (e) {
      setError(true);
      setErrorMessage(e.response?.data?.message || "Error de conexión con el servidor");
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
            <Avatar sx={{ m: 1, bgcolor: "darkblue", width: 56, height: 56 }}>
              <LockOutlinedIcon fontSize="large" />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">
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
              fullWidth
              label="Correo Electronico"
              name="email"
              type="email"
              value={values.email}
              onChange={({ target }) => handleValueChange(target)}
              sx={{ mb: 2 }}
              required
            />
            <TextField
              fullWidth
              label="Contrasena"
              name="password"
              type="password"
              value={values.password}
              onChange={({ target }) => handleValueChange(target)}
              sx={{ mb: 3 }}
              required
            />
            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ bgcolor: "darkblue", "&:hover": { bgcolor: "navy" } }}
            >
              Entrar
            </Button>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SignIn;
