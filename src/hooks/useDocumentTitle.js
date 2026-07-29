import { useEffect, useState } from 'react';
import { companySettingsApi } from '../services/companySettingsApi';

export function useDocumentTitle(title) {
  const [companyName, setCompanyName] = useState('Emerboard');

  useEffect(() => {
    companySettingsApi.show()
      .then((d) => { if (d?.company_name) setCompanyName(d.company_name); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | ${companyName}` : companyName;
    return () => { document.title = prev; };
  }, [title, companyName]);
}
