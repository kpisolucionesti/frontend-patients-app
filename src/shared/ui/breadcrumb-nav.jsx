import { Box, Breadcrumbs, Link, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BreadcrumbNav = ({ crumbs }) => {
  if (!crumbs || crumbs.length === 0) return null;

  return (
    <Box sx={{ px: 2, pt: 1, pb: 0.5 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
        aria-label="breadcrumb"
      >
        {crumbs.map((crumb, idx) => {
          const isLast = idx === crumbs.length - 1;
          if (isLast || !crumb.onClick) {
            return (
              <Typography
                key={idx}
                variant="caption"
                aria-current="page"
                sx={{
                  fontWeight: isLast ? 600 : 400,
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontSize: '0.75rem',
                }}
              >
                {crumb.label}
              </Typography>
            );
          }
          return (
            <Link
              key={idx}
              variant="caption"
              onClick={crumb.onClick}
              sx={{
                cursor: 'pointer',
                color: 'primary.main',
                fontWeight: 500,
                fontSize: '0.75rem',
                '&:hover': { textDecoration: 'underline', color: 'primary.dark' },
              }}
              underline="none"
            >
              {crumb.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNav;
