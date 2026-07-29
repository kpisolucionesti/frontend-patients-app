import { useState, useEffect } from 'react';
import axios from 'axios';
import { companySettingsApi } from '../services/companySettingsApi';

const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT;
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const baseURL = API_ENDPOINT || `http://${hostname}:3100`;

const cached = { data: null, loaded: false };

const useCompanySettings = () => {
  const [data, setData] = useState(cached.data);

  useEffect(() => {
    if (cached.loaded) {
      setData(cached.data);
      return;
    }
    axios.get(`${baseURL}/company_settings/public_info`)
      .then((res) => {
        cached.data = res.data;
        cached.loaded = true;
        setData(res.data);
      })
      .catch(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          cached.loaded = true;
          setData(null);
          return;
        }
        companySettingsApi.show()
          .then((d) => {
            cached.data = d;
            cached.loaded = true;
            setData(d);
          })
          .catch(() => {
            cached.loaded = true;
            setData(null);
          });
      });
  }, []);

  return {
    companyName: data?.company_name || 'Emerboard',
    logoUrl: data?.logo_url || null,
    data,
  };
};

export default useCompanySettings;
