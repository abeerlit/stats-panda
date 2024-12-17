'use client';
import * as React from 'react';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import './DynamicBreadcrumb.css';

export default function DynamicBreadcrumbs() {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const pathnames = pathname.split('/').filter((x) => x);
    const crumbs = pathnames.map((value, index) => {
      const to = `/${pathnames.slice(0, index + 1).join('/')}`;
      return { name: decodeURIComponent(value), path: to };
    });
    return crumbs;
  }, [location.pathname]);

  const formatBreadcrumbName = (crumb) => {
    let { name, path } = crumb;

    // Apply the transformations according to your requirements

    // Replace 'UsStates' with 'U.S. States'
    if (name === 'UsStates') {
      name = 'U.S. State Topics';
    }
    // Replace 'EachState' with 'U.S. State Topics'
    else if (name === 'EachState') {
      name = 'U.S. States';
    }
    // Replace 'Countries' with 'Country Data Topic' if path starts with '/Countries'
    else if (name === 'Countries') {
      if (path.startsWith('/Countries')) {
        name = 'Country Data Topics';
      }
    }
    // Replace 'EachCountry' with 'Countries'
    else if (name === 'EachCountry') {
      name = 'Countries';
    }

    // Remove any instance of 'entity' in the breadcrumb name
    name = name.replace(/entity/gi, '');

    // Trim any extra whitespace
    name = name.trim();

    return name;
  };

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      style={{ alignSelf: 'flex-start', marginBottom: 20 }}
    >
      <Link href="/" className="breadcrumb">
        Home
      </Link>

      {breadcrumbs.map((crumb, index) =>
        index === breadcrumbs.length - 1 ? (
          <Typography key={crumb.path} sx={{ color: 'text.primary' }}>
            {formatBreadcrumbName(crumb)}
          </Typography>
        ) : (
          <Link key={crumb.path} href={crumb.path} className="breadcrumb">
            {formatBreadcrumbName(crumb)}
          </Link>
        ),
      )}
    </Breadcrumbs>
  );
}
