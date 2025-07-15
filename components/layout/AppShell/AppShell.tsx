'use client';

import React, { ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { IconHome, IconPlus, IconSettings } from '@tabler/icons-react';
import {
  Box,
  Burger,
  Group,
  AppShell as MantineAppShell,
  Stack,
  Text,
  UnstyledButton,
  useMantineTheme,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import classes from './AppShell.module.css';

interface AppShellProps {
  children: ReactNode;
}

interface NavLinkProps {
  icon: React.ComponentType<any>;
  label: string;
  href: string;
  active?: boolean;
  onClick?: () => void;
}

function NavLink({ icon: Icon, label, href, active, onClick }: NavLinkProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
    onClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  return (
    <UnstyledButton
      className={classes.navLink}
      data-active={active || undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-current={active ? 'page' : undefined}
    >
      <Group gap="sm">
        <Icon size={20} stroke={1.5} aria-hidden="true" />
        <Text size="sm" fw={500}>
          {label}
        </Text>
      </Group>
    </UnstyledButton>
  );
}

function DesktopNavigation({
  pathname,
  onLinkClick,
}: {
  pathname: string;
  onLinkClick?: () => void;
}) {
  const navItems = [
    { icon: IconHome, label: 'Tasks', href: '/' },
    { icon: IconSettings, label: 'Settings', href: '/settings' },
  ];

  return (
    <nav role="navigation" aria-label="Main navigation">
      <Stack gap="xs">
        {navItems.map((item) => (
          <NavLink
            key={item.href}
            {...item}
            active={pathname === item.href}
            onClick={onLinkClick}
          />
        ))}
      </Stack>
    </nav>
  );
}

function MobileNavigation({ pathname }: { pathname: string }) {
  const router = useRouter();
  const theme = useMantineTheme();

  const navItems = [
    { icon: IconHome, label: 'Tasks', href: '/' },
    { icon: IconPlus, label: 'Add Task', href: '/add-task' },
    { icon: IconSettings, label: 'Settings', href: '/settings' },
  ];

  return (
    <Box
      component="nav"
      role="navigation"
      aria-label="Bottom navigation"
      className={classes.bottomNav}
      style={{
        backgroundColor: theme.colors.gray[0],
        borderTop: `1px solid ${theme.colors.gray[2]}`,
      }}
    >
      <Group justify="space-around" align="center" h="100%">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <UnstyledButton
              key={item.href}
              className={classes.bottomNavItem}
              data-active={isActive || undefined}
              onClick={() => router.push(item.href)}
              aria-current={isActive ? 'page' : undefined}
              style={{
                color: isActive ? theme.colors.primary[6] : theme.colors.gray[6],
              }}
            >
              <Stack gap={4} align="center">
                <Icon size={24} stroke={1.5} aria-hidden="true" />
                <Text size="xs" fw={isActive ? 600 : 400}>
                  {item.label}
                </Text>
              </Stack>
            </UnstyledButton>
          );
        })}
      </Group>
    </Box>
  );
}

export function AppShell({ children }: AppShellProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const theme = useMantineTheme();
  const isMobile = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`);
  const pathname = usePathname();

  return (
    <MantineAppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: !opened, desktop: false },
      }}
      footer={isMobile ? { height: 80 } : undefined}
      padding="md"
      className={classes.appShell}
    >
      <MantineAppShell.Header className={classes.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            {isMobile && (
              <Burger
                opened={opened}
                onClick={toggle}
                hiddenFrom="sm"
                size="sm"
                aria-label="Toggle navigation menu"
              />
            )}
            <Text size="lg" fw={700} component="h1" className={classes.logo}>
              How Long Since
            </Text>
          </Group>
        </Group>
      </MantineAppShell.Header>

      {!isMobile && (
        <MantineAppShell.Navbar p="md" className={classes.navbar}>
          <DesktopNavigation pathname={pathname} />
        </MantineAppShell.Navbar>
      )}

      {isMobile && opened && (
        <MantineAppShell.Navbar p="md" className={classes.mobileNavbar}>
          <DesktopNavigation pathname={pathname} onLinkClick={close} />
        </MantineAppShell.Navbar>
      )}

      <MantineAppShell.Main className={classes.main}>
        <Box className={classes.content} aria-label="Main content">
          {children}
        </Box>
      </MantineAppShell.Main>

      {isMobile && (
        <MantineAppShell.Footer className={classes.footer}>
          <MobileNavigation pathname={pathname} />
        </MantineAppShell.Footer>
      )}
    </MantineAppShell>
  );
}
