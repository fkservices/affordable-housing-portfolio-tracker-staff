'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import WarningIcon from '@mui/icons-material/Warning';
import TableChartIcon from '@mui/icons-material/TableChart';
import PeopleIcon from '@mui/icons-material/People';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useState } from 'react';

export const DRAWER_WIDTH = 260;

interface SidebarProps {
  alertCount?: number;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

export default function Sidebar({ alertCount = 0 }: SidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:767px)');
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Properties', href: '/properties', icon: <BusinessIcon /> },
    { label: 'Alerts', href: '/alerts', icon: <WarningIcon />, badge: alertCount },
    { label: 'HUD Reference', href: '/hud-reference', icon: <TableChartIcon /> },
    { label: 'Developers', href: '/developers', icon: <PeopleIcon /> },
  ];

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'primary.main' }}>
          AHPT
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Affordable Housing Portfolio Tracker
        </Typography>
      </Box>
      <Divider />
      <List sx={{ flex: 1, pt: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <ListItemButton
              key={item.href}
              component={Link}
              href={item.href}
              selected={isActive}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                mx: 1,
                borderRadius: 2,
                mb: 0.5,
                '&.Mui-selected': {
                  backgroundColor: theme.palette.primary.main + '14',
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main + '20',
                  },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.badge ? (
                  <Badge badgeContent={item.badge} color="error">
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          sx={{
            position: 'fixed',
            top: 6,
            left: 12,
            zIndex: 1500,
            backgroundColor: 'white',
            boxShadow: 2,
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          <MenuIcon />
        </IconButton>
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileOpen(false)} aria-label="Close menu">
              <CloseIcon />
            </IconButton>
          </Box>
          {drawerContent}
        </Drawer>
      </>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
