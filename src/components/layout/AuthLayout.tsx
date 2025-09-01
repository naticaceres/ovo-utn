import React from 'react';
import { MainLayout } from './MainLayout';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return <MainLayout>{children}</MainLayout>;
}
